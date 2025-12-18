import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { CreateConnectionRequestDto, UpdateConnectionRequestDto } from './dto/connection-request.dto';

@Injectable()
export class ConnectionRequestService {
  constructor(@Inject('PRISMA') private readonly prisma: PrismaClient) {}

  async createConnectionRequest(currentUserId: string, dto: CreateConnectionRequestDto) {
    // Load current user for fallback matching (phone/email) when attendee.userId isn't linked
    const currentUser = await this.prisma.user.findUnique({
      where: { id: currentUserId },
      select: { id: true, phone: true, email: true },
    });

    // Check if current user is either an attendee for the event OR the event creator
    let requesterAttendee = await this.prisma.attendee.findFirst({
      where: {
        userId: currentUserId,
        ...(dto.eventId && { eventId: dto.eventId })
      }
    });

    // Fallback: if attendee record exists but wasn't linked to userId (guest registration),
    // try matching by phone/email for the same event and auto-link it.
    if (!requesterAttendee && dto.eventId && currentUser) {
      const fallbackRequester = await this.prisma.attendee.findFirst({
        where: {
          eventId: dto.eventId,
          OR: [
            ...(currentUser.phone ? [{ phone: currentUser.phone }] : []),
            ...(currentUser.email ? [{ email: currentUser.email }] : []),
          ],
        },
      });

      if (fallbackRequester) {
        requesterAttendee = await this.prisma.attendee.update({
          where: { id: fallbackRequester.id },
          data: { userId: currentUserId },
        });
      }
    }

    // If not an attendee, check if user is the event creator
    if (!requesterAttendee && dto.eventId) {
      const event = await this.prisma.event.findFirst({
        where: {
          id: dto.eventId,
          createdById: currentUserId
        },
        include: {
          createdBy: true
        }
      });

      if (event) {
        // Auto-create attendee record for event creator
        requesterAttendee = await this.prisma.attendee.create({
          data: {
            userId: currentUserId,
            eventId: dto.eventId,
            email: event.createdBy.email,
            firstName: event.createdBy.firstname || 'Event',
            lastName: event.createdBy.lastname || 'Creator',
            role: 'ADMIN',
            showEmail: true,
            showPhone: true,
            showCompany: true
          }
        });
      }
    }

    if (!requesterAttendee) {
      throw new NotFoundException('You are not associated with this event (must be attendee or event creator)');
    }

    // Get receiver attendee record
    // Frontend may pass either:
    // - receiverId = Attendee.id (legacy / attendee lists)
    // - receiverId = User.id (e.g. /events/:id/speakers returns user ids)
    let receiverAttendee = await this.prisma.attendee.findUnique({
      where: { id: dto.receiverId },
    });

    // Fallback: treat receiverId as User.id and resolve attendee via eventId
    if (!receiverAttendee && dto.eventId) {
      receiverAttendee = await this.prisma.attendee.findFirst({
        where: {
          userId: dto.receiverId,
          eventId: dto.eventId,
        },
      });
    }

    // Fallback 2: receiver registered as guest attendee (no userId linked yet) — match by phone/email
    if (!receiverAttendee && dto.eventId) {
      const receiverUser = await this.prisma.user.findUnique({
        where: { id: dto.receiverId },
        select: { id: true, phone: true, email: true },
      });

      if (receiverUser) {
        const fallbackReceiver = await this.prisma.attendee.findFirst({
          where: {
            eventId: dto.eventId,
            OR: [
              ...(receiverUser.phone ? [{ phone: receiverUser.phone }] : []),
              ...(receiverUser.email ? [{ email: receiverUser.email }] : []),
            ],
          },
        });

        if (fallbackReceiver) {
          receiverAttendee = await this.prisma.attendee.update({
            where: { id: fallbackReceiver.id },
            data: { userId: receiverUser.id },
          });
        }
      }
    }

    if (!receiverAttendee) {
      throw new NotFoundException('Receiver attendee not found');
    }

    const receiverAttendeeId = receiverAttendee.id;

    // Check if request already exists
    const existingRequest = await this.prisma.connectionRequest.findUnique({
      where: {
        requesterId_receiverId_eventId: {
          requesterId: requesterAttendee.id,
          receiverId: receiverAttendeeId,
          eventId: dto.eventId || null,
        },
      },
    });

    // If request exists and is PENDING or ACCEPTED, throw error
    if (existingRequest && (existingRequest.status === 'PENDING' || existingRequest.status === 'ACCEPTED')) {
      throw new ConflictException('Connection request already exists');
    }

    // If request exists but is REJECTED, update it to PENDING (allow re-requesting)
    let connectionRequest;
    if (existingRequest && existingRequest.status === 'REJECTED') {
      connectionRequest = await this.prisma.connectionRequest.update({
        where: { id: existingRequest.id },
        data: {
          status: 'PENDING',
          message: dto.message,
          requestDateTime: new Date(),
          responseDateTime: null // Clear previous response
        },
        include: {
          requester: {
            include: {
              user: true
            }
          },
          receiver: {
            include: {
              user: true
            }
          }
        }
      });
    } else {
      // Create the connection request
      connectionRequest = await this.prisma.connectionRequest.create({
        data: {
          requesterId: requesterAttendee.id,
          receiverId: receiverAttendeeId,
          eventId: dto.eventId,
          message: dto.message,
          requestDateTime: new Date()
        },
        include: {
          requester: {
            include: {
              user: true
            }
          },
          receiver: {
            include: {
              user: true
            }
          }
        }
      });
    }

    return {
      requestId: connectionRequest.id,
      requesterId: connectionRequest.requesterId,
      receiverId: connectionRequest.receiverId,
      requestDateTime: connectionRequest.requestDateTime.toISOString(),
      requestStatus: connectionRequest.status.toLowerCase(),
      requestType: 'out'
    };
  }

  async getConnectionRequests(currentUserId: string, eventId?: string) {
    // Get current user's attendee records
    const attendeeRecords = await this.prisma.attendee.findMany({
      where: {
        userId: currentUserId,
        ...(eventId && { eventId })
      }
    });

    const attendeeIds = attendeeRecords.map(a => a.id);

    if (attendeeIds.length === 0) {
      return {
        incomingRequests: [],
        outgoingRequests: [],
        connections: []
      };
    }

    // Get incoming requests
    const incomingRequests = await this.prisma.connectionRequest.findMany({
      where: {
        receiverId: { in: attendeeIds },
        status: 'PENDING'
      },
      include: {
        requester: {
          include: {
            user: true
          }
        }
      },
      orderBy: { requestDateTime: 'desc' }
    });

    // Get outgoing requests
    const outgoingRequests = await this.prisma.connectionRequest.findMany({
      where: {
        requesterId: { in: attendeeIds },
        status: 'PENDING'
      },
      include: {
        receiver: {
          include: {
            user: true
          }
        }
      },
      orderBy: { requestDateTime: 'desc' }
    });

    // Get accepted connections
    const connections = await this.prisma.connectionRequest.findMany({
      where: {
        OR: [
          { requesterId: { in: attendeeIds } },
          { receiverId: { in: attendeeIds } }
        ],
        status: 'ACCEPTED'
      },
      include: {
        requester: {
          include: {
            user: true
          }
        },
        receiver: {
          include: {
            user: true
          }
        }
      },
      orderBy: { responseDateTime: 'desc' }
    });

    return {
      incomingRequests: incomingRequests.map(req => ({
        id: req.id,
        requestId: req.id,
        requesterId: req.requesterId,
        receiverId: req.receiverId,
        requestDateTime: req.requestDateTime.toISOString(),
        requestStatus: req.status.toLowerCase(),
        requestType: 'in',
        message: req.message,
        requester: this.formatAttendeeData(req.requester)
      })),
      outgoingRequests: outgoingRequests.map(req => ({
        id: req.id,
        requestId: req.id,
        requesterId: req.requesterId,
        receiverId: req.receiverId,
        requestDateTime: req.requestDateTime.toISOString(),
        requestStatus: req.status.toLowerCase(),
        requestType: 'out',
        message: req.message,
        receiver: this.formatAttendeeData(req.receiver)
      })),
      connections: connections.map(conn => {
        const isRequester = attendeeIds.includes(conn.requesterId);
        return {
          id: conn.id,
          requestId: conn.id,
          requesterId: conn.requesterId,
          receiverId: conn.receiverId,
          requestDateTime: conn.requestDateTime.toISOString(),
          requestStatus: conn.status.toLowerCase(),
          requestType: isRequester ? 'out' : 'in',
          connectedUser: this.formatAttendeeData(isRequester ? conn.receiver : conn.requester)
        };
      })
    };
  }

  async updateConnectionRequest(requestId: string, currentUserId: string, dto: UpdateConnectionRequestDto) {
    // Get the connection request
    const request = await this.prisma.connectionRequest.findUnique({
      where: { id: requestId },
      include: {
        receiver: true
      }
    });

    if (!request) {
      throw new NotFoundException('Connection request not found');
    }

    // Check if current user is the receiver of this request
    if (request.receiver.userId !== currentUserId) {
      throw new BadRequestException('You can only respond to requests sent to you');
    }

    // Update the request
    const updatedRequest = await this.prisma.connectionRequest.update({
      where: { id: requestId },
      data: {
        status: dto.status.toUpperCase() as 'ACCEPTED' | 'REJECTED',
        responseDateTime: new Date()
      },
      include: {
        requester: {
          include: {
            user: true
          }
        },
        receiver: {
          include: {
            user: true
          }
        }
      }
    });

    return {
      requestId: updatedRequest.id,
      requesterId: updatedRequest.requesterId,
      receiverId: updatedRequest.receiverId,
      requestDateTime: updatedRequest.requestDateTime.toISOString(),
      responseDateTime: updatedRequest.responseDateTime?.toISOString(),
      requestStatus: updatedRequest.status.toLowerCase(),
      requestType: 'in'
    };
  }

  async deleteConnectionRequest(requestId: string, currentUserId: string) {
    // Get the connection request
    const request = await this.prisma.connectionRequest.findUnique({
      where: { id: requestId },
      include: {
        requester: true,
        receiver: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Connection request not found');
    }

    const isSender = request.requester.userId === currentUserId;
    const isReceiver = request.receiver.userId === currentUserId;

    // Allow both parties to cancel/delete:
    // - Sender can withdraw outgoing requests
    // - Receiver can cancel incoming requests
    // - Either party can remove an accepted connection (disconnect)
    if (!isSender && !isReceiver) {
      throw new BadRequestException('You can only withdraw/cancel requests you are part of');
    }

    await this.prisma.connectionRequest.delete({
      where: { id: requestId }
    });

    if (request.status === 'ACCEPTED') {
      return { message: 'Connection removed successfully' };
    }
    return { message: isSender ? 'Connection request withdrawn successfully' : 'Connection request cancelled successfully' };
  }

  private formatAttendeeData(attendee: any) {
    // Use user's current name if available and not default values, otherwise use attendee's stored name
    const firstName = attendee.user?.firstname && attendee.user.firstname !== 'کاربر' 
      ? attendee.user.firstname 
      : attendee.firstName;
    
    const lastName = attendee.user?.lastname && attendee.user.lastname !== 'جدید' 
      ? attendee.user.lastname 
      : attendee.lastName;
    
    // Use user's current email if available and not temp email, otherwise use attendee's stored email
    const email = attendee.user?.email && !attendee.user.email.includes('@vevent.temp')
      ? attendee.user.email
      : attendee.email;
    
    return {
      id: attendee.user?.id || attendee.id,
      firstName,
      lastName,
      company: attendee.showCompany ? (attendee.user?.company || attendee.company) : null,
      jobTitle: attendee.user?.jobTitle || attendee.jobTitle,
      email: attendee.showEmail ? email : null,
      phone: attendee.showPhone ? (attendee.user?.phone || attendee.phone) : null,
      avatar: attendee.user?.avatarAssetId || attendee.avatar,
      role: attendee.role.toLowerCase()
    };
  }
}

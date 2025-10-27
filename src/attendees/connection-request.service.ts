import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { CreateConnectionRequestDto, UpdateConnectionRequestDto } from './dto/connection-request.dto';

@Injectable()
export class ConnectionRequestService {
  constructor(@Inject('PRISMA') private readonly prisma: PrismaClient) {}

  async createConnectionRequest(currentUserId: string, dto: CreateConnectionRequestDto) {
    // Check if current user is either an attendee for the event OR the event creator
    let requesterAttendee = await this.prisma.attendee.findFirst({
      where: {
        userId: currentUserId,
        ...(dto.eventId && { eventId: dto.eventId })
      }
    });

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
    const receiverAttendee = await this.prisma.attendee.findUnique({
      where: { id: dto.receiverId }
    });

    if (!receiverAttendee) {
      throw new NotFoundException('Receiver attendee not found');
    }

    // Check if request already exists
    const existingRequest = await this.prisma.connectionRequest.findUnique({
      where: {
        requesterId_receiverId_eventId: {
          requesterId: requesterAttendee.id,
          receiverId: dto.receiverId,
          eventId: dto.eventId || null
        }
      }
    });

    if (existingRequest) {
      throw new ConflictException('Connection request already exists');
    }

    // Create the connection request
    const connectionRequest = await this.prisma.connectionRequest.create({
      data: {
        requesterId: requesterAttendee.id,
        receiverId: dto.receiverId,
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
        requesterId: req.requesterId,
        receiverId: req.receiverId,
        requestDateTime: req.requestDateTime.toISOString(),
        requestStatus: req.status.toLowerCase(),
        requestType: 'in',
        message: req.message,
        requester: this.formatAttendeeData(req.requester)
      })),
      outgoingRequests: outgoingRequests.map(req => ({
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
        requester: true
      }
    });

    if (!request) {
      throw new NotFoundException('Connection request not found');
    }

    // Check if current user is the sender of this request
    if (request.requester.userId !== currentUserId) {
      throw new BadRequestException('You can only withdraw requests you sent');
    }

    await this.prisma.connectionRequest.delete({
      where: { id: requestId }
    });

    return { message: 'Connection request withdrawn successfully' };
  }

  private formatAttendeeData(attendee: any) {
    return {
      id: attendee.id,
      firstName: attendee.firstName,
      lastName: attendee.lastName,
      company: attendee.showCompany ? attendee.company : null,
      jobTitle: attendee.jobTitle,
      email: attendee.showEmail ? attendee.email : null,
      phone: attendee.showPhone ? attendee.phone : null,
      avatar: attendee.avatar,
      role: attendee.role.toLowerCase()
    };
  }
}

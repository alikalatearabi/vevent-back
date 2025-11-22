import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { UpdateAttendeePrivacyDto } from './dto/update-attendee-privacy.dto';

@Injectable()
export class AttendeesService {
  constructor(@Inject('PRISMA') private readonly prisma: PrismaClient) {}

  async checkinAttendee(attendeeId: string) {
    const attendee = await this.prisma.attendee.findUnique({ where: { id: attendeeId } });
    if (!attendee) {
      throw new NotFoundException('Attendee not found');
    }
    
    await this.prisma.attendee.update({ 
      where: { id: attendeeId }, 
      data: { checkedIn: true } 
    });
    
    return { ok: true };
  }

  async getEventAttendees(eventId: string, currentUserId: string, role?: string) {
    // First, check if the current user is registered as an attendee for this event
    const currentUserAttendee = await this.prisma.attendee.findFirst({
      where: {
        eventId: eventId,
        userId: currentUserId
      }
    });

    // If not an attendee, check if user is the event creator
    let isEventCreator = false;
    if (!currentUserAttendee) {
      const event = await this.prisma.event.findFirst({
        where: {
          id: eventId,
          createdById: currentUserId
        }
      });
      isEventCreator = !!event;
    }

    if (!currentUserAttendee && !isEventCreator) {
      throw new NotFoundException('You are not associated with this event (must be attendee or event creator)');
    }

    const whereClause: any = { eventId };
    if (role) {
      whereClause.role = role;
    }

    const attendees = await this.prisma.attendee.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy: [
        { role: 'asc' },
        { firstName: 'asc' },
        { lastName: 'asc' }
      ]
    });

    // Get count for this specific query
    const total = await this.prisma.attendee.count({ where: whereClause });

    const formattedAttendees = attendees.map(attendee => ({
      id: attendee.id,
      firstName: attendee.firstName,
      lastName: attendee.lastName,
      company: attendee.showCompany ? attendee.company : null,
      jobTitle: attendee.jobTitle,
      email: attendee.showEmail ? (attendee.email || attendee.user?.email) : null,
      phone: attendee.showPhone ? attendee.phone : null,
      avatar: attendee.avatar,
      role: attendee.role,
      checkedIn: attendee.checkedIn,
      privacy: {
        showPhone: attendee.showPhone,
        showCompany: attendee.showCompany,
        showEmail: attendee.showEmail
      },
      user: attendee.user ? {
        email: attendee.user.email
      } : null
    }));

    return {
      data: formattedAttendees,
      meta: {
        page: 1,
        limit: 50,
        total: total
      }
    };
  }

  async updatePrivacySettings(attendeeId: string, userId: string, dto: UpdateAttendeePrivacyDto) {
    const attendee = await this.prisma.attendee.findUnique({ where: { id: attendeeId } });

    if (!attendee) {
      throw new NotFoundException('Attendee not found');
    }

    if (attendee.userId !== userId) {
      throw new ForbiddenException('You can only update your own privacy settings');
    }

    const data: Record<string, boolean> = {};

    if (dto.showPhone !== undefined) {
      data.showPhone = dto.showPhone;
    }
    if (dto.showEmail !== undefined) {
      data.showEmail = dto.showEmail;
    }
    if (dto.showCompany !== undefined) {
      data.showCompany = dto.showCompany;
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('No privacy settings provided');
    }

    const updated = await this.prisma.attendee.update({
      where: { id: attendeeId },
      data,
      select: {
        id: true,
        eventId: true,
        role: true,
        showPhone: true,
        showEmail: true,
        showCompany: true,
      }
    });

    return {
      attendeeId: updated.id,
      eventId: updated.eventId,
      role: updated.role,
      privacy: {
        showPhone: updated.showPhone,
        showEmail: updated.showEmail,
        showCompany: updated.showCompany,
      },
    };
  }
}

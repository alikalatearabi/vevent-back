import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Inject } from '@nestjs/common';

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

  async getEventAttendees(eventId: string, role?: string) {
    const whereClause: any = { eventId };
    if (role) {
      whereClause.role = role;
    }

    const attendees = await this.prisma.attendee.findMany({
      where: whereClause,
      include: {
        user: true
      },
      orderBy: [
        { role: 'asc' },
        { firstName: 'asc' },
        { lastName: 'asc' }
      ]
    });

    // Get counts
    const total = await this.prisma.attendee.count({ where: { eventId } });
    const speakers = await this.prisma.attendee.count({ 
      where: { eventId, role: 'SPEAKER' } 
    });
    const visitors = await this.prisma.attendee.count({ 
      where: { eventId, role: 'VISITOR' } 
    });

    const formattedAttendees = attendees.map(attendee => ({
      id: attendee.id,
      firstName: attendee.firstName,
      lastName: attendee.lastName,
      company: attendee.showCompany ? attendee.company : null,
      jobTitle: attendee.jobTitle,
      email: attendee.showEmail ? attendee.email : null,
      phone: attendee.showPhone ? attendee.phone : null,
      avatar: attendee.avatar,
      role: attendee.role.toLowerCase()
    }));

    return {
      attendees: formattedAttendees,
      total,
      speakers,
      visitors: visitors + await this.prisma.attendee.count({ 
        where: { eventId, role: { in: ['VISITOR', 'GUEST'] } } 
      }) - visitors // Include guests in visitors count
    };
  }
}

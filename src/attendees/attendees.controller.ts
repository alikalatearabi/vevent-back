import { Controller, Patch, Param, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Attendees')
@ApiBearerAuth()
@Controller('api/v1/attendees')
export class AttendeesController {
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Check in an attendee' })
  @ApiResponse({ status: 200, description: 'Checked in' })
  @Patch(':id/checkin')
  async checkin(@Param('id') id: string, @Req() req: any) {
    // TODO: check role/permission (event staff)
    const prisma = req.app.get('PRISMA') as any;
    const attendee = await prisma.attendee.findUnique({ where: { id } });
    if (!attendee) throw new NotFoundException();
    await prisma.attendee.update({ where: { id }, data: { checkedIn: true } });
    return { ok: true };
  }
}

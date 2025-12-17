import { Inject, Injectable, BadRequestException, ForbiddenException, ConflictException, NotFoundException, forwardRef } from '@nestjs/common';
import { PrismaClient, User, Prisma } from '@prisma/client';
import * as argon2 from 'argon2';
import { AssetService } from '../common/services/asset.service';
import { PaymentBypassService } from '../auth/services/payment-bypass.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject('PRISMA') private readonly prisma: PrismaClient,
    private readonly assetService: AssetService,
    @Inject(forwardRef(() => PaymentBypassService))
    private readonly paymentBypassService: PaymentBypassService,
  ) { }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        phone: true,
        company: true,
        jobTitle: true,
        role: true,
        avatarAssetId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        avatarAsset: {
          select: {
            id: true,
            url: true,
            type: true,
          },
        },
        attendees: {
          select: {
            id: true,
            eventId: true,
            role: true,
            showPhone: true,
            showEmail: true,
            showCompany: true,
          },
        },
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async createUser(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  async sanitize(user: User) {
    const { passwordHash, ...rest } = user as any;
    return rest as Partial<User>;
  }

  /**
   * Calculate user status flags
   * @param userId User ID
   * @returns Status flags object
   */
  async getUserStatusFlags(userId: string): Promise<{
    isProfileComplete: boolean;
    isEventRegistered: boolean;
    isPaymentComplete: boolean;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstname: true,
        lastname: true,
        email: true,
        company: true,
        jobTitle: true,
        phone: true,
        isPaymentFree: true,
      },
    });

    if (!user) {
      return {
        isProfileComplete: false,
        isEventRegistered: false,
        isPaymentComplete: false,
      };
    }

    // Check if profile is complete
    // Required: firstname, lastname, email (not temp)
    // Optional: company, jobTitle (if provided, must be non-empty strings)
    const isProfileComplete = !!(
      user.firstname &&
      user.firstname.trim().length > 0 &&
      user.lastname &&
      user.lastname.trim().length > 0 &&
      user.email &&
      user.email.trim().length > 0 &&
      !user.email.includes('@vevent.temp')
      // Note: company and jobTitle are optional - profile can be complete without them
    );

    // Check if user has registered for any events
    const eventRegistrations = await this.prisma.attendee.count({
      where: { userId },
    });
    const isEventRegistered = eventRegistrations > 0;

    // Check if user is payment-free (database flag or owner phone)
    // Check owner phone first (backward compatibility)
    const ownerPhone = process.env.OWNER_PHONE;
    const isOwner = ownerPhone && user.phone === ownerPhone;
    
    // Check payment-free status from database or owner
    const isPaymentFree = isOwner || user.isPaymentFree === true;

    // Check if user has completed any payments OR is payment-free
    let isPaymentComplete = false;
    if (isPaymentFree) {
      // Payment-free user - always consider payment complete
      isPaymentComplete = true;
    } else {
      // Regular user - check actual payment status
      // Check for completed payments OR payments with amount 0 (100% discount)
      const payments = await this.prisma.payment.findMany({
      where: {
        userId,
        },
        select: {
          status: true,
          amount: true,
      },
    });
      
      // Check if any payment is COMPLETED or has amount 0 (100% discount)
      isPaymentComplete = payments.some(
        (p) => p.status === 'COMPLETED' || p.amount.toNumber() === 0
      );
    }

    return {
      isProfileComplete,
      isEventRegistered,
      isPaymentComplete,
    };
  }

  // favorites
  async listFavorites(userId: string) {
    return this.prisma.favorite.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async addFavorite(userId: string, dto: { resourceType: any; resourceId: string }) {
    // ensure resource exists (basic check)
    const exists = await this.checkResourceExists(dto.resourceType, dto.resourceId);
    if (!exists) throw new BadRequestException('Resource not found');
    return this.prisma.favorite.create({ data: { userId, resourceType: dto.resourceType, resourceId: dto.resourceId } });
  }

  async removeFavorite(userId: string, id: string) {
    const fav = await this.prisma.favorite.findUnique({ where: { id } });
    if (!fav) throw new BadRequestException('Favorite not found');
    if (fav.userId !== userId) throw new ForbiddenException();
    await this.prisma.favorite.delete({ where: { id } });
    return { ok: true };
  }

  // recent
  async addRecent(userId: string, dto: { resourceType: any; resourceId: string; metadata?: any }) {
    // upsert simple: create entry
    return (this.prisma as any).recent.create({ data: { userId, resourceType: dto.resourceType, resourceId: dto.resourceId, metadata: dto.metadata } });
  }

  // user events calendar
  async getUserEvents(userId: string) {
    // Get events user created
    const createdEvents = await this.prisma.event.findMany({
      where: {
        createdById: userId,
        deletedAt: null
      },
      select: {
        id: true,
        name: true,
        title: true,
        description: true,
        start: true,
        end: true,
        timed: true,
        location: true,
        timezone: true,
        published: true,
        color: true,
        createdAt: true
      },
      orderBy: { start: 'asc' }
    });

    // Get events user is registered for as attendee
    const registeredEvents = await this.prisma.attendee.findMany({
      where: {
        userId: userId,
        event: {
          deletedAt: null
        }
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            title: true,
            description: true,
            start: true,
            end: true,
            timed: true,
            location: true,
            timezone: true,
            published: true,
            color: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        event: { start: 'asc' }
      }
    });

    // Combine and format results
    const created = createdEvents.map(event => ({
      ...event,
      userRole: 'creator',
      registrationDate: event.createdAt
    }));

    const registered = registeredEvents.map(({ event, createdAt }) => ({
      ...event,
      userRole: 'attendee',
      registrationDate: createdAt
    }));

    // Merge and remove duplicates (in case user created and also registered)
    const allEvents = [...created, ...registered];
    const uniqueEvents = allEvents.filter((event, index, self) =>
      index === self.findIndex(e => e.id === event.id)
    );

    // Sort by start date
    uniqueEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    return {
      data: uniqueEvents,
      meta: {
        total: uniqueEvents.length,
        created: created.length,
        registered: registered.length
      }
    };
  }

  private async checkResourceExists(resourceType: any, resourceId: string) {
    try {
      switch (resourceType) {
        case 'EVENT':
          return !!(await this.prisma.event.findUnique({ where: { id: resourceId } }));
        case 'EXHIBITOR':
          return !!(await this.prisma.exhibitor.findUnique({ where: { id: resourceId } }));
        case 'PRODUCT':
          return !!(await this.prisma.product.findUnique({ where: { id: resourceId } }));
        default:
          return false;
      }
    } catch (err) {
      return false;
    }
  }

  async completeProfile(
    userId: string,
    data: {
      firstName: string;
      lastName: string;
      email: string;
      company?: string;
      jobTitle?: string;
      password?: string; // <-- make optional
      toc: boolean;
    },
  ) {
    // ✅ 1. Validate TOC
    if (!data.toc) {
      throw new BadRequestException({
        success: false,
        message: 'شما باید قوانین و مقررات را بپذیرید',
        error: 'TOC_NOT_ACCEPTED',
      });
    }

    // ✅ 2. Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });

    if (!user) {
      throw new NotFoundException({
        success: false,
        message: 'کاربر یافت نشد',
        error: 'USER_NOT_FOUND',
      });
    }

    // ✅ 3. Check if email already exists for another user
    const existingEmail = await this.prisma.user.findFirst({
      where: {
        email: data.email,
        id: { not: userId },
      },
    });

    if (existingEmail) {
      throw new ConflictException({
        success: false,
        message: 'این ایمیل قبلاً استفاده شده است',
        error: 'EMAIL_ALREADY_EXISTS',
      });
    }

    // ✅ 4. Handle password logic
    let passwordHash: string | undefined;

    if (!user.passwordHash) {
      if (!data.password || data.password.trim().length < 6) {
        throw new BadRequestException({
          success: false,
          message: 'رمز عبور الزامی است و باید حداقل 6 کاراکتر باشد',
          error: 'PASSWORD_REQUIRED',
        });
      }
      passwordHash = await argon2.hash(data.password.trim());
    } else if (data.password) {
      // user already has password but wants to update it
      if (data.password.trim().length < 6) {
        throw new BadRequestException({
          success: false,
          message: 'رمز عبور باید حداقل 6 کاراکتر باشد',
          error: 'PASSWORD_TOO_SHORT',
        });
      }
      passwordHash = await argon2.hash(data.password.trim());
    }

    // ✅ 5. Clean optional fields
    const company = data.company?.trim() || null;
    const jobTitle = data.jobTitle?.trim() || null;

    // ✅ 6. Build update data dynamically
    const updateData: any = {
      firstname: data.firstName.trim(),
      lastname: data.lastName.trim(),
      email: data.email.trim(),
      company,
      jobTitle,
    };

    if (passwordHash) {
      updateData.passwordHash = passwordHash;
    }

    // ✅ 7. Update user
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        phone: true,
        company: true,
        jobTitle: true,
        role: true,
        avatarAssetId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // ✅ 8. Get updated status flags
    const statusFlags = await this.getUserStatusFlags(userId);

    // ✅ 9. Return response
    return {
      success: true,
      message: 'اطلاعات پروفایل با موفقیت به‌روزرسانی شد',
      data: {
        ...updatedUser,
        ...statusFlags,
      },
    };
  }


  /**
   * Upload user avatar image
   */
  async uploadAvatar(userId: string, file: Express.Multer.File) {
    // Validate image file
    try {
      this.assetService.validateImageFile(file);
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    // Get current user to check for existing avatar
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarAssetId: true },
    });

    if (!user) {
      throw new NotFoundException({
        success: false,
        message: 'کاربر یافت نشد',
        error: 'USER_NOT_FOUND',
      });
    }

    // Create new asset
    const asset = await this.assetService.createAsset(
      file,
      `users/${userId}/avatar`,
      userId,
      { userId },
    );

    // Delete old avatar if exists
    if (user.avatarAssetId) {
      try {
        await this.assetService.deleteAsset(user.avatarAssetId);
      } catch (error) {
        // Log error but don't fail the upload
        console.error('Error deleting old avatar:', error);
      }
    }

    // Update user's avatarAssetId
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarAssetId: asset.id },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        phone: true,
        avatarAssetId: true,
        avatarAsset: {
          select: {
            id: true,
            url: true,
            type: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'آواتار با موفقیت آپلود شد',
      data: {
        avatarAssetId: updatedUser.avatarAssetId,
        avatarUrl: updatedUser.avatarAsset?.url || null,
      },
    };
  }

  // Admin: Set payment-free status for a user
  async setPaymentFreeStatus(userId: string, isPaymentFree: boolean) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, phone: true, email: true, firstname: true, lastname: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.paymentBypassService.setPaymentFree(userId, isPaymentFree);

    return {
      success: true,
      message: `Payment-free status ${isPaymentFree ? 'enabled' : 'disabled'} for user`,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        isPaymentFree,
      },
    };
  }

  // Admin: Get all payment-free users
  async getAllPaymentFreeUsers() {
    return this.paymentBypassService.getAllPaymentFreeUsers();
  }

  // Admin: Set payment-free status by phone number
  async setPaymentFreeStatusByPhone(phone: string, isPaymentFree: boolean) {
    const user = await this.prisma.user.findFirst({
      where: { phone },
      select: { id: true, phone: true, email: true, firstname: true, lastname: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.paymentBypassService.setPaymentFreeByPhone(phone, isPaymentFree);

    return {
      success: true,
      message: `Payment-free status ${isPaymentFree ? 'enabled' : 'disabled'} for user`,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        isPaymentFree,
      },
    };
  }

  /**
   * Get user registration and payment statistics (admin only)
   * @param eventId Optional event ID to filter by specific event
   * @returns Statistics about users who passed OTP, registered, and paid
   */
  async getRegistrationStatistics(eventId?: string) {
    // Helper to check if profile is complete
    const isProfileComplete = (user: any) => {
      return !!(
        user.firstname &&
        user.firstname.trim().length > 0 &&
        user.firstname !== 'کاربر' &&
        user.lastname &&
        user.lastname.trim().length > 0 &&
        user.lastname !== 'جدید' &&
        user.email &&
        user.email.trim().length > 0 &&
        !user.email.includes('@vevent.temp')
      );
    };

    // Get all users (excluding deleted)
    const allUsers = await this.prisma.user.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        phone: true,
        firstname: true,
        lastname: true,
        email: true,
        company: true,
        jobTitle: true,
        createdAt: true,
        payments: eventId
          ? {
              where: {
                eventId,
                status: 'COMPLETED',
              },
              select: {
                id: true,
                amount: true,
                discountCodeUsage: {
                  select: {
                    discountCode: {
                      select: {
                        code: true,
                      },
                    },
                    discountAmount: true,
                    finalAmount: true,
                    originalAmount: true,
                  },
                },
              },
            }
          : {
              where: {
                status: 'COMPLETED',
              },
              select: {
                id: true,
                amount: true,
                discountCodeUsage: {
                  select: {
                    discountCode: {
                      select: {
                        code: true,
                      },
                    },
                    discountAmount: true,
                    finalAmount: true,
                    originalAmount: true,
                  },
                },
              },
            },
        attendees: eventId
          ? {
              where: {
                eventId,
              },
            }
          : true,
      },
    });

    // Categorize users
    const passedOtpNotRegistered: any[] = [];
    const registered: any[] = [];
    const registeredAndPaid: any[] = [];

    for (const user of allUsers) {
      const profileComplete = isProfileComplete(user);
      const hasCompletedPayment = user.payments.length > 0;

      if (!profileComplete) {
        // Passed OTP but didn't complete registration
        passedOtpNotRegistered.push({
          id: user.id,
          phone: user.phone,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          company: user.company,
          jobTitle: user.jobTitle,
          createdAt: user.createdAt,
          hasPayment: hasCompletedPayment,
        });
      } else if (hasCompletedPayment) {
        // Registered and paid
        // Calculate total amount paid and check for discount codes
        let totalAmountPaid = 0;
        let usedDiscountCode = false;
        let discountCodesUsed: string[] = [];
        let totalDiscountAmount = 0;

        for (const payment of user.payments) {
          totalAmountPaid += parseFloat(payment.amount.toString());
          if (payment.discountCodeUsage) {
            usedDiscountCode = true;
            discountCodesUsed.push(payment.discountCodeUsage.discountCode.code);
            totalDiscountAmount += parseFloat(payment.discountCodeUsage.discountAmount.toString());
          }
        }

        registeredAndPaid.push({
          id: user.id,
          phone: user.phone,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          company: user.company,
          jobTitle: user.jobTitle,
          createdAt: user.createdAt,
          paymentCount: user.payments.length,
          attendeeCount: user.attendees.length,
          totalAmountPaid: totalAmountPaid,
          usedDiscountCode: usedDiscountCode,
          discountCodesUsed: discountCodesUsed.join('; '), // Join multiple codes with semicolon
          totalDiscountAmount: totalDiscountAmount,
        });
      } else {
        // Registered but not paid
        registered.push({
          id: user.id,
          phone: user.phone,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          company: user.company,
          jobTitle: user.jobTitle,
          createdAt: user.createdAt,
          attendeeCount: user.attendees.length,
        });
      }
    }

    return {
      success: true,
      statistics: {
        total: allUsers.length,
        passedOtpNotRegistered: {
          count: passedOtpNotRegistered.length,
          users: passedOtpNotRegistered,
        },
        registered: {
          count: registered.length,
          users: registered,
        },
        registeredAndPaid: {
          count: registeredAndPaid.length,
          users: registeredAndPaid,
        },
      },
      eventId: eventId || null,
    };
  }
}

import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException, Inject } from '@nestjs/common';
import { PrismaClient, DiscountType, DiscountCode } from '@prisma/client';
import { CreateDiscountCodeDto } from './dto/create-discount-code.dto';
import { UpdateDiscountCodeDto } from './dto/update-discount-code.dto';
import { ValidateDiscountCodeDto } from './dto/validate-discount-code.dto';

@Injectable()
export class DiscountCodesService {
  private readonly logger = new Logger(DiscountCodesService.name);

  constructor(@Inject('PRISMA') private readonly prisma: PrismaClient) {}

  /**
   * Create a new discount code
   */
  async create(createDto: CreateDiscountCodeDto, createdById?: string) {
    this.logger.log(`Creating discount code: ${createDto.code}`);

    // Check if code already exists
    const existing = await this.prisma.discountCode.findUnique({
      where: { code: createDto.code.toUpperCase() },
    });

    if (existing) {
      throw new ConflictException({
        success: false,
        message: 'کد تخفیف با این نام قبلاً ثبت شده است',
        error: 'DISCOUNT_CODE_EXISTS',
      });
    }

    // Validate discount value based on type
    if (createDto.discountType === DiscountType.PERCENTAGE && createDto.discountValue > 100) {
      throw new BadRequestException({
        success: false,
        message: 'درصد تخفیف نمی‌تواند بیشتر از 100 باشد',
        error: 'INVALID_DISCOUNT_VALUE',
      });
    }

    // Validate event exists if provided
    if (createDto.eventId) {
      const event = await this.prisma.event.findUnique({
        where: { id: createDto.eventId },
      });

      if (!event) {
        throw new NotFoundException({
          success: false,
          message: 'رویداد یافت نشد',
          error: 'EVENT_NOT_FOUND',
        });
      }
    }

    const discountCode = await this.prisma.discountCode.create({
      data: {
        code: createDto.code.toUpperCase(),
        discountType: createDto.discountType,
        discountValue: createDto.discountValue,
        expiresAt: createDto.expiresAt ? new Date(createDto.expiresAt) : null,
        maxUses: createDto.maxUses || null,
        singleUsePerUser: createDto.singleUsePerUser ?? false,
        minPurchaseAmount: createDto.minPurchaseAmount || null,
        eventId: createDto.eventId || null,
        description: createDto.description || null,
        createdById: createdById || null,
        isActive: true,
        currentUses: 0,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
          },
        },
      },
    });

    this.logger.log(`Discount code created: ${discountCode.id}`);
    return {
      success: true,
      message: 'کد تخفیف با موفقیت ایجاد شد',
      data: discountCode,
    };
  }

  /**
   * Validate a discount code and calculate discount
   */
  async validate(validateDto: ValidateDiscountCodeDto) {
    const { code, eventId, amount, userId } = validateDto;

    this.logger.log(`Validating discount code: ${code} for event: ${eventId}`);

    const discountCode = await this.prisma.discountCode.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!discountCode) {
      throw new NotFoundException({
        success: false,
        message: 'کد تخفیف یافت نشد',
        error: 'DISCOUNT_CODE_NOT_FOUND',
      });
    }

    // Check if code is active
    if (!discountCode.isActive) {
      throw new BadRequestException({
        success: false,
        message: 'کد تخفیف غیرفعال است',
        error: 'DISCOUNT_CODE_INACTIVE',
      });
    }

    // Check if code is expired
    if (discountCode.expiresAt && new Date() > discountCode.expiresAt) {
      throw new BadRequestException({
        success: false,
        message: 'کد تخفیف منقضی شده است',
        error: 'DISCOUNT_CODE_EXPIRED',
      });
    }

    // Check if code has reached max uses
    if (discountCode.maxUses !== null && discountCode.currentUses >= discountCode.maxUses) {
      throw new BadRequestException({
        success: false,
        message: 'کد تخفیف به حداکثر تعداد استفاده رسیده است',
        error: 'DISCOUNT_CODE_MAX_USES_REACHED',
      });
    }

    // Check if code is restricted to specific event
    if (discountCode.eventId && discountCode.eventId !== eventId) {
      throw new BadRequestException({
        success: false,
        message: 'این کد تخفیف برای این رویداد معتبر نیست',
        error: 'DISCOUNT_CODE_EVENT_MISMATCH',
      });
    }

    // Check minimum purchase amount
    if (discountCode.minPurchaseAmount && amount < parseFloat(discountCode.minPurchaseAmount.toString())) {
      throw new BadRequestException({
        success: false,
        message: `حداقل مبلغ خرید برای استفاده از این کد تخفیف ${discountCode.minPurchaseAmount} است`,
        error: 'MIN_PURCHASE_AMOUNT_NOT_MET',
      });
    }

    // Check if user has already used this code (when singleUsePerUser is true)
    if (discountCode.singleUsePerUser && userId) {
      const existingUsage = await this.prisma.discountCodeUsage.findFirst({
        where: {
          discountCodeId: discountCode.id,
          userId: userId,
        },
      });

      if (existingUsage) {
        throw new BadRequestException({
          success: false,
          message: 'شما قبلاً از این کد تخفیف استفاده کرده‌اید',
          error: 'DISCOUNT_CODE_ALREADY_USED_BY_USER',
        });
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (discountCode.discountType === DiscountType.PERCENTAGE) {
      discountAmount = (amount * parseFloat(discountCode.discountValue.toString())) / 100;
    } else {
      discountAmount = parseFloat(discountCode.discountValue.toString());
      // Ensure discount doesn't exceed the amount
      if (discountAmount > amount) {
        discountAmount = amount;
      }
    }

    const finalAmount = Math.max(0, amount - discountAmount);

    return {
      success: true,
      valid: true,
      data: {
        code: discountCode.code,
        discountType: discountCode.discountType,
        discountValue: discountCode.discountValue,
        originalAmount: amount,
        discountAmount,
        finalAmount,
        description: discountCode.description,
      },
    };
  }

  /**
   * Apply discount code to a payment (creates usage record)
   */
  async applyDiscountCode(
    code: string,
    userId: string,
    paymentId: string,
    eventId: string,
    originalAmount: number,
  ) {
    this.logger.log(`Applying discount code: ${code} to payment: ${paymentId}`);

    // Validate the discount code (include userId for singleUsePerUser check)
    const validation = await this.validate({
      code,
      eventId,
      amount: originalAmount,
      userId,
    });

    if (!validation.valid) {
      throw new BadRequestException(validation);
    }

    const discountCode = await this.prisma.discountCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!discountCode) {
      throw new NotFoundException({
        success: false,
        message: 'کد تخفیف یافت نشد',
        error: 'DISCOUNT_CODE_NOT_FOUND',
      });
    }

    // Check if this payment already has a discount code usage
    const existingUsage = await this.prisma.discountCodeUsage.findUnique({
      where: { paymentId },
    });

    if (existingUsage) {
      throw new ConflictException({
        success: false,
        message: 'این پرداخت قبلاً از کد تخفیف استفاده کرده است',
        error: 'DISCOUNT_CODE_ALREADY_APPLIED',
      });
    }

    // Create usage record and increment usage count in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create usage record
      const usage = await tx.discountCodeUsage.create({
        data: {
          discountCodeId: discountCode.id,
          userId,
          paymentId,
          eventId,
          originalAmount,
          discountAmount: validation.data.discountAmount,
          finalAmount: validation.data.finalAmount,
        },
      });

      // Increment usage count
      await tx.discountCode.update({
        where: { id: discountCode.id },
        data: {
          currentUses: {
            increment: 1,
          },
        },
      });

      return usage;
    });

    this.logger.log(`Discount code applied successfully: ${result.id}`);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Check if a user has used a specific discount code
   */
  async checkUserHasUsedCode(code: string, userId: string) {
    this.logger.log(`Checking if user ${userId} has used code: ${code}`);

    const discountCode = await this.prisma.discountCode.findUnique({
      where: { code: code.toUpperCase() },
      select: {
        id: true,
        code: true,
        singleUsePerUser: true,
      },
    });

    if (!discountCode) {
      throw new NotFoundException({
        success: false,
        message: 'کد تخفیف یافت نشد',
        error: 'DISCOUNT_CODE_NOT_FOUND',
      });
    }

    const usage = await this.prisma.discountCodeUsage.findFirst({
      where: {
        discountCodeId: discountCode.id,
        userId: userId,
      },
      include: {
        payment: {
          select: {
            id: true,
            status: true,
            amount: true,
            createdAt: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            name: true,
          },
        },
      },
      orderBy: {
        usedAt: 'desc',
      },
    });

    return {
      success: true,
      data: {
        code: discountCode.code,
        singleUsePerUser: discountCode.singleUsePerUser,
        hasUsed: !!usage,
        usage: usage ? {
          id: usage.id,
          usedAt: usage.usedAt,
          originalAmount: usage.originalAmount,
          discountAmount: usage.discountAmount,
          finalAmount: usage.finalAmount,
          payment: usage.payment,
          event: usage.event,
        } : null,
      },
    };
  }

  /**
   * Get all discount codes (admin)
   */
  async findAll() {
    const codes = await this.prisma.discountCode.findMany({
      include: {
        event: {
          select: {
            id: true,
            title: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
          },
        },
        _count: {
          select: {
            usages: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      data: codes,
    };
  }

  /**
   * Get a single discount code by ID
   */
  async findOne(id: string) {
    const code = await this.prisma.discountCode.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
          },
        },
        usages: {
          take: 10,
          orderBy: {
            usedAt: 'desc',
          },
          include: {
            user: {
              select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
                phone: true,
              },
            },
            payment: {
              select: {
                id: true,
                status: true,
                amount: true,
              },
            },
          },
        },
        _count: {
          select: {
            usages: true,
          },
        },
      },
    });

    if (!code) {
      throw new NotFoundException({
        success: false,
        message: 'کد تخفیف یافت نشد',
        error: 'DISCOUNT_CODE_NOT_FOUND',
      });
    }

    return {
      success: true,
      data: code,
    };
  }

  /**
   * Get a discount code by code string
   */
  async findByCode(code: string) {
    const discountCode = await this.prisma.discountCode.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            name: true,
          },
        },
      },
    });

    if (!discountCode) {
      throw new NotFoundException({
        success: false,
        message: 'کد تخفیف یافت نشد',
        error: 'DISCOUNT_CODE_NOT_FOUND',
      });
    }

    return {
      success: true,
      data: discountCode,
    };
  }

  /**
   * Update a discount code
   */
  async update(id: string, updateDto: UpdateDiscountCodeDto) {
    const existing = await this.prisma.discountCode.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException({
        success: false,
        message: 'کد تخفیف یافت نشد',
        error: 'DISCOUNT_CODE_NOT_FOUND',
      });
    }

    // If updating code, check for conflicts
    if (updateDto.code && updateDto.code.toUpperCase() !== existing.code) {
      const codeExists = await this.prisma.discountCode.findUnique({
        where: { code: updateDto.code.toUpperCase() },
      });

      if (codeExists) {
        throw new ConflictException({
          success: false,
          message: 'کد تخفیف با این نام قبلاً ثبت شده است',
          error: 'DISCOUNT_CODE_EXISTS',
        });
      }
    }

    // Validate discount value if updating
    if (updateDto.discountType === DiscountType.PERCENTAGE && updateDto.discountValue && updateDto.discountValue > 100) {
      throw new BadRequestException({
        success: false,
        message: 'درصد تخفیف نمی‌تواند بیشتر از 100 باشد',
        error: 'INVALID_DISCOUNT_VALUE',
      });
    }

    const updated = await this.prisma.discountCode.update({
      where: { id },
      data: {
        ...(updateDto.code && { code: updateDto.code.toUpperCase() }),
        ...(updateDto.discountType && { discountType: updateDto.discountType }),
        ...(updateDto.discountValue !== undefined && { discountValue: updateDto.discountValue }),
        ...(updateDto.expiresAt !== undefined && { expiresAt: updateDto.expiresAt ? new Date(updateDto.expiresAt) : null }),
        ...(updateDto.maxUses !== undefined && { maxUses: updateDto.maxUses }),
        ...(updateDto.singleUsePerUser !== undefined && { singleUsePerUser: updateDto.singleUsePerUser }),
        ...(updateDto.minPurchaseAmount !== undefined && { minPurchaseAmount: updateDto.minPurchaseAmount }),
        ...(updateDto.isActive !== undefined && { isActive: updateDto.isActive }),
        ...(updateDto.description !== undefined && { description: updateDto.description }),
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'کد تخفیف با موفقیت به‌روزرسانی شد',
      data: updated,
    };
  }

  /**
   * Delete a discount code
   */
  async remove(id: string) {
    const existing = await this.prisma.discountCode.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException({
        success: false,
        message: 'کد تخفیف یافت نشد',
        error: 'DISCOUNT_CODE_NOT_FOUND',
      });
    }

    await this.prisma.discountCode.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'کد تخفیف با موفقیت حذف شد',
    };
  }
}


import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DiscountCodesService } from './discount-codes.service';
import { CreateDiscountCodeDto } from './dto/create-discount-code.dto';
import { UpdateDiscountCodeDto } from './dto/update-discount-code.dto';
import { ValidateDiscountCodeDto } from './dto/validate-discount-code.dto';

@ApiTags('Discount Codes')
@Controller('api/v1/discount-codes')
export class DiscountCodesController {
  constructor(private readonly discountCodesService: DiscountCodesService) {}

  @Post('validate')
  @ApiOperation({ summary: 'Validate a discount code and get discount amount' })
  @ApiResponse({ status: 200, description: 'Discount code validated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid discount code or validation failed' })
  @ApiResponse({ status: 404, description: 'Discount code not found' })
  async validate(@Body() validateDto: ValidateDiscountCodeDto) {
    return this.discountCodesService.validate(validateDto);
  }

  @Get(':code/used-by-me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if current user has used a discount code' })
  @ApiResponse({ status: 200, description: 'Usage status retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Discount code not found' })
  async checkUsedByMe(@Param('code') code: string, @Req() req: any) {
    const userId = req.user?.sub;
    return this.discountCodesService.checkUserHasUsedCode(code, userId);
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get discount code details by code' })
  @ApiResponse({ status: 200, description: 'Discount code details' })
  @ApiResponse({ status: 404, description: 'Discount code not found' })
  async findByCode(@Param('code') code: string) {
    return this.discountCodesService.findByCode(code);
  }
}

@ApiTags('Discount Codes (Admin)')
@Controller('api/v1/admin/discount-codes')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class DiscountCodesAdminController {
  constructor(private readonly discountCodesService: DiscountCodesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new discount code (admin only)' })
  @ApiResponse({ status: 201, description: 'Discount code created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Discount code already exists' })
  async create(@Body() createDto: CreateDiscountCodeDto, @Req() req: any) {
    // TODO: Add admin role check
    const userId = req.user?.sub;
    return this.discountCodesService.create(createDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all discount codes (admin only)' })
  @ApiResponse({ status: 200, description: 'List of discount codes' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll() {
    // TODO: Add admin role check
    return this.discountCodesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get discount code by ID (admin only)' })
  @ApiResponse({ status: 200, description: 'Discount code details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Discount code not found' })
  async findOne(@Param('id') id: string) {
    // TODO: Add admin role check
    return this.discountCodesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a discount code (admin only)' })
  @ApiResponse({ status: 200, description: 'Discount code updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Discount code not found' })
  @ApiResponse({ status: 409, description: 'Discount code already exists' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateDiscountCodeDto) {
    // TODO: Add admin role check
    return this.discountCodesService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a discount code (admin only)' })
  @ApiResponse({ status: 200, description: 'Discount code deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Discount code not found' })
  async remove(@Param('id') id: string) {
    // TODO: Add admin role check
    return this.discountCodesService.remove(id);
  }
}


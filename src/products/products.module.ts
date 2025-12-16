import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { CategoriesTagsController } from './categories-tags.controller';
import { CategoriesService } from './categories.service';
import { TagsService } from './tags.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [ProductsController, CategoriesTagsController],
  providers: [ProductsService, CategoriesService, TagsService],
  exports: [ProductsService, CategoriesService, TagsService],
})
export class ProductsModule {}

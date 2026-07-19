import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';

@Module({
  imports: [PrismaModule, CategoriesModule, ProductsModule, CartModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

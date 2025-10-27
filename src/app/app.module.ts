import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { BlogsModule } from './blogs/blogs.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [UsersModule, BlogsModule, ProductsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

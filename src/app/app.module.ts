import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { BlogsModule } from './blogs/blogs.module';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileModule } from './profile/profile.module';
import { TweetModule } from './tweet/tweet.module';

@Module({
  imports: [
    UsersModule,
    BlogsModule,
    ProductsModule,
    AuthModule,
    TypeOrmModule.forRootAsync({
      imports: [],
      inject: [],
      useFactory: () => ({
        type: 'postgres',
        host: process.env.POSTGRES_HOST || 'localhost',
        port: process.env.POSTGRES_PORT
          ? parseInt(process.env.POSTGRES_PORT, 10)
          : 5432,
        username: process.env.POSTGRES_USER || 'nestjs_app_user',
        password: process.env.POSTGRES_PASSWORD || 'nestjs_app_password',
        database: process.env.POSTGRES_DB || 'nestjs_app_db',
        // entities: [User],
        autoLoadEntities: true,
        synchronize: true, // Note: set to false in production
        entityPrefix: 'nestjs_app_',
        logger: 'advanced-console',
        logging: 'all',
      }),
    }),
    ProfileModule,
    TweetModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { BlogsModule } from './blogs/blogs.module';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProfileModule } from './profile/profile.module';
import { TweetModule } from './tweet/tweet.module';
import { HashtagsModule } from './hashtags/hashtags.module';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
    }),
    UsersModule,
    BlogsModule,
    ProductsModule,
    AuthModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
        // DB_TYPE from .env (e.g. "postgres"). cast to satisfy TypeORM union type.
        type: configService.get<'postgres'>('DB_TYPE'),
        host: configService.get<string>('POSTGRES_HOST'),
        port: parseInt(configService.get<string>('POSTGRES_PORT', '5432'), 10),
        username: configService.get<string>('POSTGRES_USER', 'nestjs_app_user'),
        password: configService.get<string>(
          'POSTGRES_PASSWORD',
          'nestjs_app_password',
        ),
        database: configService.get<string>('POSTGRES_DB', 'nestjs_app_db'),
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
    HashtagsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

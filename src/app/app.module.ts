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
import databaseConfig from 'src/shared/config/database.config';
import appConfig from 'src/shared/config/appConfig';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
      load: [appConfig, databaseConfig],
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
        type: configService.get<'postgres'>('databaseConfig.type'),
        host: configService.get<string>('databaseConfig.host'),
        port: configService.get<number>('databaseConfig.port'),
        username: configService.get<string>('databaseConfig.username'),
        password: configService.get<string>('databaseConfig.password'),
        database: configService.get<string>('databaseConfig.database'),
        // entities: [User],
        autoLoadEntities: configService.get<boolean>(
          'databaseConfig.autoLoadEntities',
        ),
        synchronize: configService.get<boolean>('databaseConfig.synchronize'), // Note: set to false in production
        entityPrefix: configService.get<string>('databaseConfig.entityPrefix'),
        logger: configService.get('databaseConfig.logger'),
        logging: configService.get('databaseConfig.logging'),
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

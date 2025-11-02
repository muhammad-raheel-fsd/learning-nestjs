import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from './entities/profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Profile]), // Add your Profile entity here
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}

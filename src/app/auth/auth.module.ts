import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [forwardRef(() => UsersModule)], // Use forwardRef to resolve circular dependency
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService], // Export AuthService so UsersModule can use it
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UsersController } from '../controllers/users.controller';
import { UserDetails } from '../entities/user-details.entity';
@Module({
imports: [
    TypeOrmModule.forFeature([User, UserDetails]),
  ],
    controllers: [UsersController],
})
export class UsersModule {}

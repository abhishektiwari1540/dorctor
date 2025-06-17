import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersModule } from './users/users.module'; // ✅ Make sure this path is correct

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'auth-db1294.hstgr.io',
      port: 3306,
      username: 'u102942340_Doctor',
      password: 'Doctor@123#@123',
      database: 'u102942340_Doctor',
      entities: [User],
      synchronize: true,
      logging: true,
    }),
    UsersModule, // ✅ This registers your users controller and service
  ],
})
export class AppModule {}

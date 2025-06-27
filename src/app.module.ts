import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { User } from './entities/user.entity';
import { UserDetails } from './entities/user-details.entity';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // Path on your disk
      serveRoot: '/uploads',                      // Public URL prefix
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'auth-db1294.hstgr.io',
      port: 3306,
      username: 'u102942340_Doctor',
      password: 'Doctor@123#@123',
      database: 'u102942340_Doctor',
      entities: [User, UserDetails],
      synchronize: true,
      logging: true,
    }),
    UsersModule,
  ],
})
export class AppModule {}

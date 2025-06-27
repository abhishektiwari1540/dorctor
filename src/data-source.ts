import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { UserDetails } from './entities/user-details.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'auth-db1294.hstgr.io',
  port: 3306,
  username: 'u102942340_Doctor',
  password: 'Doctor@123#@123',
  database: 'u102942340_Doctor',
  synchronize: false,
  logging: true,
  entities: [User, UserDetails],
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
});

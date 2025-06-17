import * as crypto from 'crypto';
const generateRandomSecret = () => crypto.randomBytes(32).toString('hex');



export default {
  jwtSecret: process.env.JWT_SECRET || generateRandomSecret(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
    database: {
  type: 'mysql',
      host: 'auth-db1294.hstgr.io', // avoid 'localhost'
      port: 3306,
      username: 'u102942340_Doctor',
      password: 'Doctor@123#@123',
      database: 'u102942340_Doctor',
      synchronize: true,
      logging: true,
  },
};
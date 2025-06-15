import * as crypto from 'crypto';
const generateRandomSecret = () => crypto.randomBytes(32).toString('hex');



export default {
  jwtSecret: process.env.JWT_SECRET || generateRandomSecret(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
    database: {
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '',
    database: 'patient_planet',
  },
};
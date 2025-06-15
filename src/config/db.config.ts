import { createConnection, Connection } from 'typeorm';
import { User } from '../entities/user.entity';

export const testDBConnection = async (): Promise<Connection> => {
  try {
    const connection = await createConnection({
      type: 'mysql',
      host: 'localhost',
      port: 3306,  // default MySQL port
      username: 'root',
      password: '', 
      database: 'patient_planet',
      entities: [User],
      synchronize: true, // automatically creates database schema on each application launch
      logging: true, // enables logging of SQL queries
    });
    
    console.log('✅ MySQL DB connected successfully!');
    return connection;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error; // re-throw the error to handle it in the calling code
  }
};
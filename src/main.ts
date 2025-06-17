import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { testDBConnection } from './config/db.config';
import { Request, Response } from 'express';
import router from './routes/user.routes';

async function bootstrap() {
  // Test database connection first
  await testDBConnection();

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  // app.setGlobalPrefix('/api');
  const server = app.getHttpAdapter();
  server.use('/api/users', router);
  server.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
  });

  // Explicitly specify 'localhost' as the host
  await app.listen(3000, 'localhost');

  // Get the actual URL (works with any host binding)
  const url = await app.getUrl();
  console.log(
    `Application is running on: ${url.replace('[::1]', 'localhost')}`,
  );
}

bootstrap().catch((err) => {
  console.error('Application startup failed:', err);
  process.exit(1);
});

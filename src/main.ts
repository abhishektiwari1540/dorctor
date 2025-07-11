import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { testDBConnection } from './config/db.config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // Test database connection first
  await testDBConnection();

  const app = await NestFactory.create(AppModule);
app.enableCors({
    origin: [
      'http://localhost:8000',            // Local development
      'https://dorctor-oac7.vercel.app'   // Your Vercel deployment
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.setGlobalPrefix('/api'); // Optional, for cleaner API routes like /api/users

    app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Start the server
  await app.listen(8000, 'localhost');

  // Log the app URL
  const url = await app.getUrl();
  console.log(`Application is running on: ${url.replace('[::1]', 'localhost')}`);
}

bootstrap().catch((err) => {
  console.error('Application startup failed:', err);
  process.exit(1);
});

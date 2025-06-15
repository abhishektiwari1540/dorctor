import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { testDBConnection } from './config/db.config';

async function bootstrap() {
  // Test database connection first
  await testDBConnection();
  
   const app = await NestFactory.create(AppModule);
     app.enableCors();
  app.setGlobalPrefix('api');
  
  // Explicitly specify 'localhost' as the host
  await app.listen(3000, 'localhost');
  
  // Get the actual URL (works with any host binding)
  const url = await app.getUrl();
  console.log(`Application is running on: ${url.replace('[::1]', 'localhost')}`);
}

bootstrap().catch(err => {
  console.error('Application startup failed:', err);
  process.exit(1);
});
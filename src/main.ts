import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global validation pipe with custom error formatting
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => {
          const constraints = Object.values(error.constraints || {});
          return constraints.length > 0 ? constraints[0] : 'Validation failed';
        });
        
        // Check if it's a phone validation error
        const firstError = errors[0];
        const isPhoneError = firstError?.property === 'phone' && 
          Object.keys(firstError.constraints || {}).some(key => key === 'matches');
        
        const errorCode = isPhoneError ? 'INVALID_PHONE_FORMAT' : 'VALIDATION_ERROR';
        
        return new BadRequestException({
          success: false,
          message: messages[0] || 'Validation failed',
          error: errorCode,
          errors: messages,
        });
      },
    }),
  );

  // ✅ Use Nest's built-in enableCors, not app.use(cors())
  app.enableCors({
    origin: [
      'http://0.0.0.0:3000',
      'http://localhost:3000',
      'http://185.149.192.60:3000',
      'https://veventexpo.ir',
      'https://www.veventexpo.ir'
    ],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, Cache-Control',
  });

  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('vevent API')
    .setDescription('vevent backend API documentation')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Enter JWT access token' },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();

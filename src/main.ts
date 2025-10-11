import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS configuration for frontend
  app.enableCors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, Postman, curl)
      if (!origin) return callback(null, true);
      
      // List of allowed origins
      const allowedOrigins = [
        'http://localhost:3000',      // Nuxt dev server
        'http://localhost:3001',      // Backend (for testing)
        'http://127.0.0.1:3000',      // Alternative localhost
        'http://0.0.0.0:3000',        // Nuxt 0.0.0.0 binding
        'http://10.43.123.8:3000',    // Local network IP
        'http://185.149.192.60:3000', // Production frontend
        'http://185.149.192.60',      // Production frontend (without port)
        process.env.FRONTEND_URL,     // Environment variable
      ].filter(Boolean);
      
      // Allow all origins in development
      if (process.env.NODE_ENV === 'development' || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Allow-Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
    ],
    exposedHeaders: ['Set-Cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
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

  // Let Swagger scan the whole application so all controllers are included
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();

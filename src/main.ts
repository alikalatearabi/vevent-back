import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configure CORS to allow requests from any origin with credentials
  const corsOrigins = process.env.CORS_ORIGINS ? 
    process.env.CORS_ORIGINS.split(',') : 
    ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173', 'http://0.0.0.0:3000'];
    
  app.enableCors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl requests)
      if (!origin) return callback(null, true);
      
      // When using credentials, we MUST return the specific origin, not a wildcard
      // This is a browser security requirement for credentials mode
      console.log(`Origin requesting access: ${origin}`);
      
      // If the origin is in our allowed list, return that exact origin
      if (corsOrigins.indexOf(origin) !== -1) {
        callback(null, origin);
      } else if (corsOrigins.includes('*')) {
        // If we have a wildcard in our list, but we're getting a specific origin,
        // return that specific origin (not the wildcard)
        callback(null, origin);
      } else {
        // For development convenience, we'll add new origins dynamically
        console.log(`Adding new origin to allowed list: ${origin}`);
        corsOrigins.push(origin);
        callback(null, origin);
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // Allow credentials (cookies, authorization headers)
    allowedHeaders: 'Content-Type,Accept,Authorization,X-Requested-With,Referer,User-Agent',
    exposedHeaders: 'Content-Disposition',
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

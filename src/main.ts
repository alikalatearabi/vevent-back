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
      
      // If specific origins are defined, check against them
      if (corsOrigins.indexOf(origin) !== -1 || corsOrigins.includes('*')) {
        callback(null, true);
      } else {
        // For development convenience, you can enable all origins
        // This should be restricted in production
        console.log(`Origin ${origin} not allowed by CORS policy - adding it to allowed list`);
        corsOrigins.push(origin); // Dynamically add to allowed origins for this session
        callback(null, true); // Allow all origins for now to debug
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

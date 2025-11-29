"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cookieParser = require("cookie-parser");
const app_module_1 = require("./app.module");
async function bootstrap() {
    console.log('[Bootstrap] SMS Environment Variables:');
    console.log(`  SMS_MOCK="${process.env.SMS_MOCK}" (type: ${typeof process.env.SMS_MOCK}, length: ${process.env.SMS_MOCK?.length})`);
    console.log(`  SMS_IR_API_KEY="${process.env.SMS_IR_API_KEY ? process.env.SMS_IR_API_KEY.substring(0, 10) + '...' : 'NOT SET'}" (exists: ${!!process.env.SMS_IR_API_KEY})`);
    console.log(`  SMS_IR_TEMPLATE_ID="${process.env.SMS_IR_TEMPLATE_ID}" (exists: ${!!process.env.SMS_IR_TEMPLATE_ID})`);
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.getHttpAdapter().getInstance().set('trust proxy', true);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        exceptionFactory: (errors) => {
            const messages = errors.map((error) => {
                const constraints = Object.values(error.constraints || {});
                return constraints.length > 0 ? constraints[0] : 'Validation failed';
            });
            const firstError = errors[0];
            const isPhoneError = firstError?.property === 'phone' &&
                Object.keys(firstError.constraints || {}).some(key => key === 'matches');
            const errorCode = isPhoneError ? 'INVALID_PHONE_FORMAT' : 'VALIDATION_ERROR';
            return new common_1.BadRequestException({
                success: false,
                message: messages[0] || 'Validation failed',
                error: errorCode,
                errors: messages,
            });
        },
    }));
    app.enableCors({
        origin: [
            'http://0.0.0.0:3000',
            'http://0.0.0.0:3002',
            'http://0.0.0.0:3001',
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
    const config = new swagger_1.DocumentBuilder()
        .setTitle('vevent API')
        .setDescription('vevent backend API documentation')
        .setVersion('1.0')
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Enter JWT access token' }, 'access-token')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: { persistAuthorization: true },
    });
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();

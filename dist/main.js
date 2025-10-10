"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const cookieParser = require("cookie-parser");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const exhibitors_module_1 = require("./exhibitors/exhibitors.module");
const events_module_1 = require("./events/events.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule, users_module_1.UsersModule, exhibitors_module_1.ExhibitorsModule, events_module_1.EventsModule],
        controllers: [],
        providers: [],
    })
], AppModule);
async function bootstrap() {
    const app = await core_1.NestFactory.create(AppModule);
    app.enableCors();
    app.use(cookieParser());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('vevent API')
        .setDescription('vevent backend API documentation')
        .setVersion('1.0')
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Enter JWT access token' }, 'access-token')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });
    await app.listen(3000);
    console.log('Application is running on: http://localhost:3000');
}
bootstrap();

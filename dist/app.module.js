"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const products_module_1 = require("./products/products.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const exhibitors_module_1 = require("./exhibitors/exhibitors.module");
const events_module_1 = require("./events/events.module");
const prisma_module_1 = require("./prisma/prisma.module");
const common_module_1 = require("./common/common.module");
let AppController = class AppController {
    getRoot() {
        return { message: 'Hello from vevent-back' };
    }
    getHealth() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        };
    }
};
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getRoot", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getHealth", null);
AppController = __decorate([
    (0, common_1.Controller)()
], AppController);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            common_module_1.CommonModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            exhibitors_module_1.ExhibitorsModule,
            events_module_1.EventsModule,
            products_module_1.ProductsModule,
            prisma_module_1.PrismaModule
        ],
        controllers: [AppController]
    })
], AppModule);

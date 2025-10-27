"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateExhibitorDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_exhibitor_dto_1 = require("./create-exhibitor.dto");
class UpdateExhibitorDto extends (0, swagger_1.PartialType)(create_exhibitor_dto_1.CreateExhibitorDto) {
}
exports.UpdateExhibitorDto = UpdateExhibitorDto;

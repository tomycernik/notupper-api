"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const validateBody = (DtoClass) => async (req, res, next) => {
    const instance = (0, class_transformer_1.plainToInstance)(DtoClass, req.body);
    const errors = await (0, class_validator_1.validate)(instance);
    if (errors.length > 0) {
        const messages = errors.map(e => Object.values(e.constraints ?? {}).join(', '));
        res.status(400).json({ success: false, errors: messages });
        return;
    }
    req.body = instance;
    next();
};
exports.validateBody = validateBody;
//# sourceMappingURL=validate-body.middleware.js.map
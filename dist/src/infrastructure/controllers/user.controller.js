"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
class UserController {
    constructor(userService) {
        this.userService = userService;
    }
    async register(req, res) {
        try {
            const user = await this.userService.register(req.body);
            res.status(201).json({ success: true, data: user });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await this.userService.login(email, password);
            res.json({ success: true, data: user });
        }
        catch (error) {
            res.status(401).json({ success: false, message: error.message });
        }
    }
    async getMe(req, res) {
        try {
            const userId = req.userId;
            const user = await this.userService.getById(userId);
            res.json({ success: true, data: user });
        }
        catch (error) {
            res.status(404).json({ success: false, message: error.message });
        }
    }
    async getAll(req, res) {
        try {
            const users = await this.userService.getAll();
            res.json({ success: true, data: users });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    async update(req, res) {
        try {
            const userId = req.userId;
            const updated = await this.userService.update(userId, req.body);
            res.json({ success: true, data: updated });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async delete(req, res) {
        try {
            const id = req.params['id'];
            await this.userService.delete(id);
            res.json({ success: true, message: 'Usuario eliminado' });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map
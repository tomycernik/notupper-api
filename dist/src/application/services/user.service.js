"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async register(data) {
        const user = { ...data, rol: 'USER', coin_amount: 0 };
        return this.userRepository.register(user);
    }
    async login(email, password) {
        return this.userRepository.login(email, password);
    }
    async getById(id) {
        const user = await this.userRepository.findById(id);
        if (!user)
            throw new Error('Usuario no encontrado');
        return user;
    }
    async getAll() {
        return this.userRepository.findAll();
    }
    async update(id, data) {
        await this.getById(id); // valida que existe
        return this.userRepository.update(id, data);
    }
    async delete(id) {
        await this.getById(id);
        return this.userRepository.delete(id);
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map
import { Request, Response } from 'express';
import { UserService } from '@application/services/user.service';
import { RegisterUserDTO, LoginDTO, UpdateUserDTO } from '@infrastructure/dtos/user/user.dto';

export class UserController {
  constructor(private readonly userService: UserService) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.userService.register(req.body as RegisterUserDTO);
      res.status(201).json({ success: true, data: user });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body as LoginDTO;
      const user = await this.userService.login(email, password);
      res.json({ success: true, data: user });
    } catch (error: any) {
      res.status(401).json({ success: false, message: error.message });
    }
  }

  async getMe(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId as string;
      const user = await this.userService.getById(userId);
      res.json({ success: true, data: user });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userService.getAll();
      res.json({ success: true, data: users });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId as string;
      const updated = await this.userService.update(userId, req.body as UpdateUserDTO);
      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'] as string;
      await this.userService.delete(id);
      res.json({ success: true, message: 'Usuario eliminado' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

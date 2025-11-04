import { Request, Response } from "express";
import { UserService } from "../../application/services/user.service";
import { RegisterUserDTO } from "../dtos/user/register-user.dto";
import { LoginDTO } from "../dtos/user/login.dto";
import { SkinService } from "../../application/services/skin.service";
import { RoomService } from "../../application/services/room.service";

export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly skinService: SkinService,
    private readonly roomService: RoomService
  ) {}

  async register(req: Request, res: Response) {
    try {
      const user = await this.userService.register(req.body as RegisterUserDTO);
      res.json(user);
    } catch (error: any) {
      console.error("Error en UserController register:", error);
      res.status(500).json({
        errors: "Error al registrar el usuario",
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const user = await this.userService.login(req.body as LoginDTO);
      res.json(user);
    } catch (error: any) {
      console.error("Error en UserController login:", error);
      res.status(500).json({
        errors: "Error al iniciar sesión",
      });
    }
  }
  async getUserSkins(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      if (!userId || userId.trim() === "") {
        res.status(400).json({
          success: false,
          message: "ID de usuario no proporcionado",
        });
        return;
      }

      const response = await this.skinService.getUserSkins(userId);
      res.json(response);
    } catch (error) {
      console.error("Error en UserController getUserSkins:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener los skins del usuario",
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }
  async getUserRooms(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      if (!userId || userId.trim() === "") {
        res.status(400).json({
          success: false,
          message: "ID de usuario no proporcionado",
        });
        return;
      }

      const response = await this.roomService.getUserRooms(userId);
      res.json(response);
    } catch (error) {
      console.error("Error en UserController getUserRooms:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener las habitaciones del usuario",
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }

  async getUserAssets(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      if (!userId || userId.trim() === "") {
        res.status(400).json({
          success: false,
          message: "ID de usuario no proporcionado",
        });
        return;
      }

      const [roomsResponse, skinsResponse] = await Promise.all([
        this.roomService.getUserRooms(userId),
        this.skinService.getUserSkins(userId),
      ]);

      res.json({
        rooms: roomsResponse.data,
        skins: skinsResponse.data,
      });
    } catch (error) {
      console.error("Error en UserController getUserAssets:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener los assets del usuario",
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }

  async getActiveRoom(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      if (!userId || userId.trim() === "") {
        res.status(400).json({
          success: false,
          message: "ID de usuario no proporcionado",
        });
        return;
      }

      const activeRoom = await this.roomService.getActiveRoom(userId);

      if (!activeRoom) {
        res.status(404).json({
          success: false,
          message: "No hay habitación activa configurada",
        });
        return;
      }

      res.json({
        success: true,
        data: activeRoom,
        message: "Habitación activa obtenida exitosamente",
      });
    } catch (error) {
      console.error("Error en UserController getActiveRoom:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener la habitación activa",
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }

  async setActiveRoom(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      if (!userId || userId.trim() === "") {
        res.status(400).json({
          success: false,
          message: "ID de usuario no proporcionado",
        });
        return;
      }

      const { roomId } = req.body;
      if (!roomId || roomId.trim() === "") {
        res.status(400).json({
          success: false,
          message: "ID de habitación no proporcionado",
        });
        return;
      }

      await this.roomService.setActiveRoom(userId, roomId);

      res.json({
        success: true,
        message: "Habitación activa actualizada exitosamente",
      });
    } catch (error) {
      console.error("Error en UserController setActiveRoom:", error);
      res.status(500).json({
        success: false,
        message: "Error al actualizar la habitación activa",
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }

  async getUserInfo(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;

      const userInfo = await this.userService.getUserInfo(userId);
      userInfo.rooms = (await this.roomService.getUserRooms(userId)).data;

      res.status(200).json({
        userInfo,
      });
    } catch (error) {
      console.error("Error en UserController getUserInfo:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener la información del usuario",
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }
}

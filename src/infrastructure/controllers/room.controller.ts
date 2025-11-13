import { Request, Response } from 'express';
import { RoomService } from '@application/services/room.service';
import { MembershipService } from '@application/services/membership.service';

export class RoomController {
    constructor(
        private readonly roomService: RoomService,
        private readonly membershipService: MembershipService
    ) { }

    async getAllRooms(req: Request, res: Response) {
        try {
            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

            const result = await this.roomService.getAllRooms({ page, limit });

            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination
            });
        } catch (error: any) {
            console.error('Error en RoomController getAllRooms:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener las habitaciones',
                errors: [error.message || 'Error desconocido']
            });
        }
    }

    async addRoomToUser(req: Request, res: Response) {
        try {
            const userId = (req as any).userId;
            const { roomId } = req.body;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'No autorizado'
                });
            }

            if (!roomId) {
                return res.status(400).json({
                    success: false,
                    message: 'El ID de la habitación es requerido'
                });
            }

            // Verificar membresía Plus
            const membership = await this.membershipService.getUserMembership(userId);
            if (!membership || membership.name !== 'plus') {
                return res.status(403).json({
                    success: false,
                    message: 'Esta funcionalidad es exclusiva para miembros Oniria Plus'
                });
            }

            await this.roomService.addRoomToUser(userId, roomId);

            res.status(201).json({
                success: true,
                message: 'Habitación agregada exitosamente'
            });
        } catch (error: any) {
            console.error('Error en RoomController addRoomToUser:', error);

            const statusCode = error.message?.includes('ya tiene') ? 409 :
                error.message?.includes('no encontrada') ? 404 : 500;

            res.status(statusCode).json({
                success: false,
                message: error.message || 'Error al agregar la habitación',
                errors: [error.message || 'Error desconocido']
            });
        }
    }

        async buyRoom(req: Request, res: Response) {
        try {
            const userId = (req as any).userId;
            const { roomId } = req.body;
            if (!userId || !roomId) {
                return res.status(400).json({ success: false, message: 'Faltan datos obligatorios' });
            }
            await this.roomService.buyRoom(userId, roomId);
            res.status(200).json({ success: true, message: 'Habitación comprada correctamente' });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message || 'No se pudo comprar la habitación' });
        }
    }
}


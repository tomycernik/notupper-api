import { Request, Response } from 'express';
import { SkinService } from '@application/services/skin.service';
import { MembershipService } from '@application/services/membership.service';

export class SkinController {
    constructor(
        private readonly skinService: SkinService,
        private readonly membershipService: MembershipService
    ) { }

    async getAllSkins(req: Request, res: Response) {
        try {
            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

            const result = await this.skinService.getAllSkins({ page, limit });

            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination
            });
        } catch (error: any) {
            console.error('Error en SkinController getAllSkins:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener las skins',
                errors: [error.message || 'Error desconocido']
            });
        }
    }

    async addSkinToUser(req: Request, res: Response) {
        try {
            const userId = (req as any).userId;
            const { skinId } = req.body;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'No autorizado'
                });
            }

            if (!skinId) {
                return res.status(400).json({
                    success: false,
                    message: 'El ID del skin es requerido'
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

            await this.skinService.addSkinToUser(userId, skinId);

            res.status(201).json({
                success: true,
                message: 'Skin agregado exitosamente'
            });
        } catch (error: any) {
            console.error('Error en SkinController addSkinToUser:', error);

            const statusCode = error.message?.includes('ya tiene') ? 409 :
                error.message?.includes('no encontrada') ? 404 : 500;

            res.status(statusCode).json({
                success: false,
                message: error.message || 'Error al agregar el skin',
                errors: [error.message || 'Error desconocido']
            });
        }
    }

    async buySkin(req: Request, res: Response) {
        try {
            const userId = (req as any).userId;
            const { skinId } = req.body;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'No autorizado'
                });
            }

            if (!skinId) {
                return res.status(400).json({
                    success: false,
                    message: 'El ID del skin es requerido'
                });
            }

            await this.skinService.buySkin(userId, skinId);

            res.status(200).json({
                success: true,
                message: 'Skin comprado exitosamente'
            });
        } catch (error: any) {
            console.error('Error en SkinController buySkin:', error);

            const statusCode = error.message?.includes('Ya tienes') ? 409 :
                error.message?.includes('no encontrado') ? 404 :
                error.message?.includes('Saldo insuficiente') ? 400 : 500;

            res.status(statusCode).json({
                success: false,
                message: error.message || 'Error al comprar el skin',
                errors: [error.message || 'Error desconocido']
            });
        }
    }
}

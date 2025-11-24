import { Request, Response } from "express";
import "express-session";
import { InterpretationDreamService } from "@application/services/interpretation-dream.service";
import { DreamNodeService } from "@application/services/dream-node.service";
import { IllustrationDreamService } from "@application/services/illustration-dream.service";
import { SaveDreamNodeRequestDto } from "@infrastructure/dtos/dream-node";
import { DreamContextService } from "@application/services/dream-context.service";
import { UpdateDreamNodeRequestDto } from "@infrastructure/dtos/dream-node/update-dream-node.dto";
import { MembershipService } from "@application/services/membership.service";

export class DreamNodeController {
  constructor(
    private readonly interpretationDreamService: InterpretationDreamService,
    private readonly dreamNodeService: DreamNodeService,
    private readonly illustrationService: IllustrationDreamService,
    private readonly contextService: DreamContextService,
    private readonly membershipService: MembershipService
  ) {}

  async interpret(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { description } = req.body;
      const userDreamContext = await this.contextService.getUserDreamContext(
        userId
      );
      const interpretation =
        await this.interpretationDreamService.interpretDream(
          description,
          userDreamContext
        );

      if (interpretation.context && req.session) {
        try {
          (req.session as any).dreamContext = JSON.parse(
            JSON.stringify(interpretation.context)
          );

          await new Promise<void>((resolve, reject) => {
            req.session?.save((err?: Error) => {
              if (err) {
                console.error("Error saving session:", err);
                reject(err);
              } else {
                resolve();
              }
            });
          });
        } catch (error) {
          console.error("Error handling session:", error);
        }
      }

      res.json({
        description,
        interpretation: interpretation.interpretation,
        emotion: interpretation.emotion,
        title: interpretation.title,
        dreamType: interpretation.dreamType,
      });
    } catch (error: any) {
      console.error("Error en DreamNodeController:", error);
      res.status(500).json({
        errors: "Error al interpretar el sueño",
      });
    }
  }

  async illustrate(req: Request, res: Response): Promise<void> {
    try {
      const { description } = req.body;

      const illustrationUrl =
        await this.illustrationService.generateIllustration(description);

      res.json({ imageUrl: illustrationUrl });
    } catch (error: any) {
      console.error("Error en DreamNodeController:", error);
      res.status(500).json({
        errors: "Error al generar ilustración",
      });
    }
  }

      async getById(req: Request, res: Response) {
        try {
          const { id } = req.params;
          if (!id) {
            return res.status(400).json({
              message: "ID del nodo es requerido",
              errors: ["El parámetro 'id' es obligatorio"],
            });
          }
          const dreamNode = await this.dreamNodeService.getDreamNodeById(id);
          if (!dreamNode) {
            return res.status(404).json({
              message: "Nodo no encontrado",
              errors: ["No existe un nodo con ese ID"],
            });
          }
          res.json({
            message: "Nodo obtenido exitosamente",
            data: dreamNode,
            errors: [],
          });
        } catch (error: any) {
          console.error("Error en DreamNodeController getById:", error);
          res.status(500).json({
            message: "Error interno del servidor",
            errors: [error.message || "Error al obtener el nodo"],
          });
        }
      }
  async save(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const dreamNode: SaveDreamNodeRequestDto = req.body;
      dreamNode.imageUrl =
        dreamNode.imageUrl && dreamNode.imageUrl.includes("blockadelabs.com")
          ? await this.illustrationService.saveIllustrationFromUrl(
              dreamNode.imageUrl
            )
          : "";

      const session = req.session as any;
      const dreamContext = session.dreamContext
        ? JSON.parse(JSON.stringify(session.dreamContext))
        : {
          themes: [],
          people: [],
          locations: [],
          emotions_context: [],
        };

      if (session.dreamContext) {
        session.dreamContext = null;
        await new Promise<void>((resolve) => {
          req.session?.save(() => resolve());
        });
      }

      const { id, unlockedBadges } = await this.dreamNodeService.saveDreamNode(
        userId,
        dreamNode,
        dreamContext
      );

      return res.status(201).json({
        message: "Nodo de sueño guardado exitosamente",
        errors: [],
        data:{id},
        unlockedBadges: unlockedBadges,
      });
    } catch (error: any) {
      console.error("Error en DreamNodeController:", error);
      return res.status(500).json({
        message: "Error interno del servidor",
        errors: [error.message || "Error al guardar el nodo de sueño"],
      });
    }
  }

  async reinterpret(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { description, previousInterpretation, approach } = req.body;

      if (
        !approach ||
        !["psychological", "spiritual", "symbolic"].includes(approach)
      ) {
        return res.status(400).json({
          errors:
            "El parámetro 'approach' es obligatorio y debe ser uno de: psychological, spiritual, symbolic.",
        });
      }

      const userMembership = await this.membershipService.getUserMembership(
        userId
      );
      if (userMembership && userMembership.name !== "plus") {
        return res.status(403).json({
          errors: "No tienes permiso para reinterpretar el sueño",
        });
      }

      const userDreamContext = await this.contextService.getUserDreamContext(
        userId
      );
      let reinterpretedDream;
      try {
        reinterpretedDream =
          await this.interpretationDreamService.reinterpretDream(
            description,
            previousInterpretation,
            userDreamContext,
            approach
          );
        console.log(
          "[DreamNodeController] Reinterpretación exitosa:",
          reinterpretedDream
        );
      } catch (err) {
        console.error("[DreamNodeController] Error en reinterpretación:", err);
        return res.status(500).json({
          errors: "Error al reinterpretar el sueño (OpenAI)",
          details: err instanceof Error ? err.message : err,
        });
      }

      if (reinterpretedDream.context && req.session) {
        try {
          (req.session as any).dreamContext = JSON.parse(
            JSON.stringify(reinterpretedDream.context)
          );
          await new Promise<void>((resolve, reject) => {
            req.session?.save((err?: Error) => {
              if (err) {
                console.error("Error saving session:", err);
                reject(err);
              } else {
                resolve();
              }
            });
          });
        } catch (error) {
          console.error("Error handling session:", error);
        }
      }

      let unlockedBadges = null;
      unlockedBadges = await this.dreamNodeService.onDreamReinterpreted(userId);

      res.json({
        description,
        interpretation: reinterpretedDream.interpretation,
        emotion: reinterpretedDream.emotion,
        title: reinterpretedDream.title,
        dreamType: reinterpretedDream.dreamType,
        unlockedBadges,
      });
    } catch (error: any) {
      console.error("Error en DreamNodeController reinterpret:", error);
      res.status(500).json({
        errors: "Error al reinterpretar el sueño (general)",
        details: error instanceof Error ? error.message : error,
      });
    }
  }

  async getUserNodes(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const {
        state,
        privacy,
        emotion,
        dreamType,
        search,
        page,
        limit,
        from,
        to,
      } = (req as any).validatedQuery || {};
      const filters: any = {};
      if (state) filters.state = state;
      if (privacy) filters.privacy = privacy;
      if (emotion) filters.emotion = emotion;
      if (dreamType) filters.dreamType = dreamType;
      if (search) filters.search = search;
      if (from) filters.from = from;
      if (to) filters.to = to;

      const pagination: any = {};
      if (page) pagination.page = page;
      if (limit) pagination.limit = limit;

      if (!userId) {
        return res.status(400).json({
          errors: "El id del usuario es requerido",
        });
      } else {
        const paginatedResult = await this.dreamNodeService.getUserNodes(
          userId,
          filters,
          pagination
        );

        res.json(paginatedResult);
      }
    } catch (error: any) {
      console.error("Error en DreamNodeController getUserNodes:", error);
      res.status(500).json({
        errors: "Error al obtener los nodos de sueño del usuario",
      });
    }
  }

  async showUser(req: Request, res: Response) {
    try {
      const user = (req as any).userId;
      res.json(user);
    } catch (error: any) {
      console.error("Error en DreamNodeController showUser:", error);
      res.status(500).json({
        errors: "Error al obtener el usuario",
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { id, state, privacy } = req.body as UpdateDreamNodeRequestDto;

      const updates: {
        state?: "Activo" | "Archivado";
        privacy?: "Publico" | "Privado" | "Anonimo";
      } = {};
      if (state !== undefined) updates.state = state as "Activo" | "Archivado";
      if (privacy !== undefined)
        updates.privacy = privacy as "Publico" | "Privado" | "Anonimo";

      const updatedDreamNode = await this.dreamNodeService.updateDreamNode(
        userId,
        id,
        updates
      );

      res.json({
        message: "Nodo de sueño actualizado exitosamente",
        data: updatedDreamNode,
        errors: [],
      });
    } catch (error: any) {
      console.error("Error en DreamNodeController update:", error);
      res.status(500).json({
        message: "Error interno del servidor",
        errors: [error.message || "Error al actualizar el nodo de sueño"],
      });
    }
  }

  async share(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          message: "ID del sueño es requerido",
          errors: ["El parámetro 'id' es obligatorio"],
        });
      }

      const sharedDream = await this.dreamNodeService.shareDream(userId, id);

      res.json({
        message: "Sueño compartido exitosamente",
        data: sharedDream,
        errors: [],
      });
    } catch (error: any) {
      console.error("Error en DreamNodeController share:", error);
      res.status(500).json({
        message: "Error interno del servidor",
        errors: [error.message || "Error al compartir el sueño"],
      });
    }
  }

  async unshare(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          message: "ID del sueño es requerido",
          errors: ["El parámetro 'id' es obligatorio"],
        });
      }

      const unsharedDream = await this.dreamNodeService.unshareDream(
        userId,
        id
      );

      res.json({
        message: "Sueño descompartido exitosamente",
        data: unsharedDream,
        errors: [],
      });
    } catch (error: any) {
      console.error("Error en DreamNodeController unshare:", error);
      res.status(500).json({
        message: "Error interno del servidor",
        errors: [error.message || "Error al descompartir el sueño"],
      });
    }
  }

  async getPublicDreams(req: Request, res: Response) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const pagination = { page, limit };

      const paginatedResult = await this.dreamNodeService.getPublicDreams(
        pagination
      );

      res.json(paginatedResult);
    } catch (error: any) {
      console.error("Error en DreamNodeController getPublicDreams:", error);
      res.status(500).json({
        message: "Error interno del servidor",
        errors: [error.message || "Error al obtener los sueños públicos"],
      });
    }
  }

  async getUserMap(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const userMap = await this.dreamNodeService.getUserDreamMap(userId);
      res.json(userMap);
    } catch (error: any) {
      console.error("Error en DreamNodeController getUserMap:", error);
      res.status(500).json({
        message: "Error interno del servidor",
        errors: [
          error.message || "Error al obtener el mapa de sueños del usuario",
        ],
      });
    }
  }

  async getMyStats(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      if (!userId) {
        return res.status(400).json({ errors: "Usuario no autenticado" });
      }

      const stats = await this.dreamNodeService.getUserDreamStats(userId);

      return res.json(stats);
    } catch (error) {
      console.error("Error en DreamNodeController getMyStats:", error);
      return res.status(500).json({
        errors: "Error al obtener estadísticas del usuario",
      });
    }
  }
}

import { envs } from "@config/envs";
import { IDreamNodeFilters } from "@domain/interfaces/dream-node-filters.interface";
import { DreamContext } from "@domain/interfaces/interpretation-dream.interface";
import {
  IPaginationOptions,
  IPaginatedResult,
} from "@domain/interfaces/pagination.interface";
import {
  IDreamNode,
  Emotion,
  DreamTypeName,
} from "@domain/models/dream-node.model";
import { IDreamNodeRepository } from "@domain/repositories/dream-node.repository";
import { SaveDreamNodeRequestDto } from "@infrastructure/dtos/dream-node";
import { MissionService } from "@application/services/mission.service";
import { Badge } from "@domain/models/badge.model";
import { IPublicDream } from "@domain/interfaces/public-dream.interface";
import { DreamGraphResponse } from "@/domain/interfaces/dream-map-item.interface";

export class DreamNodeService {
  constructor(
    private dreamNodeRepository: IDreamNodeRepository,
    private missionService?: MissionService
  ) {
    this.dreamNodeRepository = dreamNodeRepository;
  }
  async saveDreamNode(
    userId: string,
    dream: SaveDreamNodeRequestDto,
    dreamContext: DreamContext
  ): Promise<Badge[]> {
    const { title, description, interpretation, emotion, imageUrl } = dream;

    const dreamNode: IDreamNode = {
      creationDate: new Date(),
      title,
      dream_description: description,
      interpretation,
      imageUrl: imageUrl,
      privacy: "Privado",
      state: "Activo",
      emotion: emotion as Emotion,
      type: dream.dreamType as DreamTypeName,
    };

    const { data, error } = await this.dreamNodeRepository.save(
      dreamNode,
      userId,
      dream.dreamType as DreamTypeName
    );

    if (error) {
      throw new Error(error.message);
    }

    if (!data?.id) {
      throw new Error("No se pudo crear el nodo de sueño");
    }
    
    console.log("[DreamNodeService] Nuevo sueño guardado:", data.id);
    this.dreamNodeRepository.addDreamContext(data.id, userId, dreamContext);

    let unlockedBadges: Badge[] = [];
    if (this.missionService) {
      try {
        unlockedBadges = await this.missionService.onDreamSaved(userId);
      } catch (e) {
        console.error("MissionService onDreamSaved error:", e);
      }
    }

    return unlockedBadges;
  }

  async onDreamReinterpreted(userId: string): Promise<Badge[]> {
    if (!this.missionService) return [];
    try {
      const badges = await this.missionService.onDreamReinterpreted(userId);
      return badges || [];
    } catch (e) {
      console.error("MissionService onDreamReinterpreted error:", e);
      return [];
    }
  }

  async getUserNodes(
    userId: string,
    filters: IDreamNodeFilters,
    pagination?: IPaginationOptions
  ): Promise<IPaginatedResult<IDreamNode>> {
    try {
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const offset = (page - 1) * limit;

      const paginationData: IPaginationOptions = {
        page,
        limit,
        offset,
      };

      const [nodes, total, emotions] = await Promise.all([
        this.dreamNodeRepository.getUserNodes(userId, filters, paginationData),
        this.dreamNodeRepository.countUserNodes(userId, filters),
        this.dreamNodeRepository.getAllEmotions(),
      ]);

      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      return {
        data: nodes,
        pagination: {
          currentPage: page,
          limit: limit,
          total: total,
          totalPages: totalPages,
          hasNext: hasNext,
          hasPrev: hasPrev,
        },
        options: {
          emotions,
        },
      };
    } catch (error) {
      throw new Error(
        "Error obteniendo los nodos de sueño del usuario: " + error
      );
    }
  }

  async updateDreamNode(
    userId: string,
    nodeId: string,
    updates: {
      state?: "Activo" | "Archivado" | undefined;
      privacy?: "Publico" | "Privado" | "Anonimo" | undefined;
    }
  ): Promise<IDreamNode> {
    try {
      const updateData: Partial<Pick<IDreamNode, "state" | "privacy">> = {};

      if (updates.state !== undefined) {
        updateData.state = updates.state;
      }

      if (updates.privacy !== undefined) {
        updateData.privacy = updates.privacy;
      }

      const { data, error } = await this.dreamNodeRepository.updateDreamNode(
        nodeId,
        userId,
        updateData
      );

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error(
          "No se encontró el nodo de sueño o no se pudo actualizar"
        );
      }

      return data;
    } catch (error: any) {
      throw new Error(`Error al actualizar el nodo de sueño: ${error.message}`);
    }
  }

  async shareDream(userId: string, nodeId: string): Promise<IDreamNode> {
    try {
      const { data, error } = await this.dreamNodeRepository.updateDreamNode(
        nodeId,
        userId,
        { privacy: "Publico" }
      );

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error(
          "No se encontró el nodo de sueño o no tienes permisos para compartirlo"
        );
      }

      return data;
    } catch (error: any) {
      throw new Error(`Error al compartir el sueño: ${error.message}`);
    }
  }

  async unshareDream(userId: string, nodeId: string): Promise<IDreamNode> {
    try {
      const { data, error } = await this.dreamNodeRepository.updateDreamNode(
        nodeId,
        userId,
        { privacy: "Privado" }
      );

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error(
          "No se encontró el nodo de sueño o no tienes permisos para descompartirlo"
        );
      }

      return data;
    } catch (error: any) {
      throw new Error(`Error al descompartir el sueño: ${error.message}`);
    }
  }

  async getPublicDreams(
    pagination?: IPaginationOptions
  ): Promise<IPaginatedResult<IPublicDream>> {
    try {
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const offset = (page - 1) * limit;

      const paginationData: IPaginationOptions = {
        page,
        limit,
        offset,
      };

      const [dreams, total] = await Promise.all([
        this.dreamNodeRepository.getPublicDreams(paginationData),
        this.dreamNodeRepository.countPublicDreams(),
      ]);

      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      return {
        data: dreams,
        pagination: {
          currentPage: page,
          limit: limit,
          total: total,
          totalPages: totalPages,
          hasNext: hasNext,
          hasPrev: hasPrev,
        },
      };
    } catch (error) {
      throw new Error("Error obteniendo los sueños públicos: " + error);
    }
  }

  async getUserDreamMap(userId: string): Promise<DreamGraphResponse> {
    try {
      return this.dreamNodeRepository.getUserDreamMap(userId);
    } catch (error) {
      throw new Error(
        "Error obteniendo el mapa de sueños del usuario: " + error
      );
    }
  }

  async getDreamNodeById(dreamNodeId: string): Promise<IDreamNode | null> {
    try {
      return this.dreamNodeRepository.getDreamNodeById(dreamNodeId);
    } catch (error) {
      throw new Error("Error obteniendo el nodo de sueño: " + error);
    }
  }
}

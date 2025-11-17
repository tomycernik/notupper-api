import { DreamTypeName, EmotionOption, IDreamNode } from "@domain/models/dream-node.model";
import { IDreamNodeFilters } from "@domain/interfaces/dream-node-filters.interface";
import { IPaginationOptions } from "@domain/interfaces/pagination.interface";
import { IDreamContext } from "@domain/interfaces/dream-context.interface";
import { IPublicDream } from "@domain/interfaces/public-dream.interface";
import { DreamGraphResponse } from "../interfaces/dream-map-item.interface";

export interface IDreamNodeRepository {
    save(dreamNode: IDreamNode, userId: string, dreamType: DreamTypeName): Promise<{ data: any; error: Error | null }>;
    getUserNodes(userId: string, filters: IDreamNodeFilters, pagination: IPaginationOptions): Promise<IDreamNode[]>;
    countUserNodes(userId: string, filters: IDreamNodeFilters): Promise<number>;
    addDreamContext(nodeId:string, userId: string, dreamContext : IDreamContext): Promise<void>;
    getUserDreamContext(userId: string): Promise<IDreamContext>;
    updateDreamNode(nodeId: string, userId: string, updates: Partial<Pick<IDreamNode, 'state' | 'privacy'>>): Promise<{ data: any | null; error: Error | null }>;
    getAllEmotions(): Promise<EmotionOption[]>;
    getDreamNodeById(dreamNodeId: string): Promise<IDreamNode | null>;

    countLikes(dreamNodeId: string): Promise<number>;
    isLikedByUser(dreamNodeId: string, profileId: string): Promise<boolean>;
    like(dreamNodeId: string, profileId: string): Promise<void>;
    unlike(dreamNodeId: string, profileId: string): Promise<void>;

    getPublicDreams(pagination: IPaginationOptions): Promise<IPublicDream[]>;
    countPublicDreams(): Promise<number>;
    getUserDreamMap(userId: string): Promise<DreamGraphResponse>;
}
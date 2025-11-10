export interface EmotionRepository {
    getAllByName(): Promise<string[]>;
}
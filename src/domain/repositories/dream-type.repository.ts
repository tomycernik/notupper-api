export interface DreamTypeRepository {
    getAllByName(): Promise<string[]>;
}
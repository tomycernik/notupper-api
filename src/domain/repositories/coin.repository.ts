export interface ICoinRepository {
  getUserCoins(profileId: string): Promise<number>;
  addCoins(profileId: string, amount: number): Promise<void>;
  deductCoins(profileId: string, amount: number): Promise<void>;
}
export interface ICoinRepository {
  getUserCoins(profileId: string): Promise<number>;
  addCoins(profileId: string, amount: number): Promise<void>;
  deductCoins(profileId: string, amount: number): Promise<void>;
  registerMovement(profileId: string, amount: number, type: 'ingreso' | 'egreso', description: string): Promise<void>;
  getMovements(profileId: string): Promise<Array<{ description: string; value: number; sign: '+' | '-'; date: string; time: string }>>;
}
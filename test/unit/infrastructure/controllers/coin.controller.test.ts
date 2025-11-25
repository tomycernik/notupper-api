import { CoinController } from '../../../../src/infrastructure/controllers/coin.controller';

describe('CoinController', () => {
  let coinController: any;
  let coinRepository: any;
  let req: any;
  let res: any;

  beforeEach(() => {
    coinRepository = {
      registerMovement: jest.fn(),
      getMovements: jest.fn()
    };
    coinController = new CoinController(coinRepository);
    req = { userId: 'user', body: { amount: 100, type: 'ingreso', description: 'Test' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  it('should register movement successfully', async () => {
    await coinController.registerMovement(req, res);
    expect(coinRepository.registerMovement).toHaveBeenCalledWith('user', 100, 'ingreso', 'Test');
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it('should return 400 for invalid data', async () => {
    req.body = { amount: 'invalid', type: 'ingreso', description: '' };
    await coinController.registerMovement(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Datos inválidos' });
  });

  it('should handle error on registerMovement', async () => {
    coinRepository.registerMovement.mockRejectedValue(new Error('fail'));
    await coinController.registerMovement(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error al registrar movimiento' });
  });

  it('should get movements successfully', async () => {
    coinRepository.getMovements.mockResolvedValue([
      { description: 'Test', value: 100, sign: '+', date: '2025-11-24', time: '10:00' }
    ]);
    await coinController.getMovements(req, res);
    expect(coinRepository.getMovements).toHaveBeenCalledWith('user');
    expect(res.json).toHaveBeenCalledWith({ movements: [
      { description: 'Test', value: 100, sign: '+', date: '2025-11-24', time: '10:00' }
    ] });
  });

  it('should handle error on getMovements', async () => {
    coinRepository.getMovements.mockRejectedValue(new Error('fail'));
    await coinController.getMovements(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener movimientos' });
  });
});

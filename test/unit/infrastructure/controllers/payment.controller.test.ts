import { PaymentController } from '../../../../src/infrastructure/controllers/payment.controller';

describe('PaymentController', () => {
  let paymentController: PaymentController;
  let paymentService: any;
  let userService: any;
  let req: any;
  let res: any;

  beforeEach(() => {
    paymentService = { createPayment: jest.fn() };
    userService = {
      updateMembership: jest.fn()
    };
    const packageService = {
      getPackageById: jest.fn(),
      getAllPackages: jest.fn()
    };
    const notificationService = {};
    const coinRepository = { registerMovement: jest.fn() };
    paymentController = new PaymentController(paymentService, userService, packageService as any, notificationService as any, coinRepository);
    req = { body: {}, userId: 'user' };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  it('should update membership if coin_amount is not present and payment approved', async () => {
    req.body = {};
    paymentService.createPayment.mockResolvedValue({ status: 'approved' });
    await paymentController.createPayment(req, res);
    expect(userService.updateMembership).toHaveBeenCalledWith('user', 'plus');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Pago aprobado y membresía actualizada' });
  });

  it('should return 202 if payment is in process', async () => {
    paymentService.createPayment.mockResolvedValue({ status: 'in_process' });
    await paymentController.createPayment(req, res);
    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.json).toHaveBeenCalledWith({ message: 'Pago en proceso de aprobación' });
  });

  it('should return 400 if payment is rejected', async () => {
    paymentService.createPayment.mockResolvedValue({ status: 'rejected', status_detail: 'Insufficient funds' });
    await paymentController.createPayment(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Pago rechazado', detail: 'Insufficient funds' });
  });

  it('should handle errors', async () => {
    paymentService.createPayment.mockRejectedValue(new Error('fail'));
    await paymentController.createPayment(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error al procesar el pago', error: 'fail' });
  });
});

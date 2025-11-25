import { PaymentController } from '../../../../src/infrastructure/controllers/payment.controller';
import { PaymentService } from '../../../../src/application/services/payment.service';
import { UserService } from '../../../../src/application/services/user.service';
import { CreatePaymentRequestDto } from '../../../../src/infrastructure/dtos/payment/create-payment-request.dto';

describe('PaymentController', () => {
  let paymentController: PaymentController;
  let paymentService: any;
  let userService: any;
  let req: any;
  let res: any;

  beforeEach(() => {
    paymentService = { createPayment: jest.fn() };
    userService = {
      coinRepository: {
        addCoins: jest.fn(),
        registerMovement: jest.fn()
      },
      updateMembership: jest.fn()
    };
    paymentController = new PaymentController(paymentService, userService);
    req = { body: {}, userId: 'user' };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  it('should credit coins and register movement if coin_amount is present and payment approved', async () => {
    req.body = { coin_amount: 100 };
    paymentService.createPayment.mockResolvedValue({ status: 'approved' });
    await paymentController.createPayment(req, res);
    expect(userService.coinRepository.addCoins).toHaveBeenCalledWith('user', 100);
    expect(userService.coinRepository.registerMovement).toHaveBeenCalledWith('user', 100, 'ingreso', 'Compra de monedas por Mercado Pago');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Pago aprobado y monedas acreditadas' });
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

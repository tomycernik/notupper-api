import { Request, Response } from "express";
import { PaymentService } from "@application/services/payment.service";
import { UserService } from "@application/services/user.service";
export class PaymentController {
  private paymentService: PaymentService;
  private userService: UserService;
  constructor(paymentService: PaymentService, userService: UserService) {
    this.paymentService = paymentService;
    this.userService = userService;
  }

  async createPayment(req: any, res: any) {
    try {
      const paymentResult = await this.paymentService.createPayment(req.body);
      if (paymentResult.status === 'approved') {
        await this.userService.updateMembership(req.userId, 'plus');
        return res.status(200).json({ message: 'Pago aprobado y membresía actualizada' });
      } else if (paymentResult.status === 'in_process') {
        return res.status(202).json({ message: 'Pago en proceso de aprobación' });
      } else if (paymentResult.status === 'rejected') {
        return res.status(400).json({ message: 'Pago rechazado', detail: paymentResult.status_detail });
      }
    } catch (error: any) {
      return res.status(500).json({ message: 'Error al procesar el pago', error: error.message });
    }
  }
}

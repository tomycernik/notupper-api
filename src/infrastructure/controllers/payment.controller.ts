import { Request, Response } from "express";
import { PaymentService } from "@application/services/payment.service";
import { UserService } from "@application/services/user.service";
import { CreatePaymentRequestDto } from "@infrastructure/dtos/payment/create-payment-request.dto";
import { PackageService } from "@/application/services/package.service";
import { NotificationService } from "@/application/services/notification.service";

export class PaymentController {
  private paymentService: PaymentService;
  private userService: UserService;
  private packageService: PackageService;
  private notificationService: NotificationService;
  private coinRepository: any;

  constructor(
    paymentService: PaymentService,
    userService: UserService,
    packageService: PackageService,
    notificationService: NotificationService,
    coinRepository: any
  ) {
    this.paymentService = paymentService;
    this.userService = userService;
    this.packageService = packageService;
    this.notificationService = notificationService;
    this.coinRepository = coinRepository;
  }
  async createPayment(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const dto = req.body as CreatePaymentRequestDto;
      const payment = await this.paymentService.createPayment(dto);

      switch (payment.status) {
        case "approved":
          await this.userService.updateMembership(userId, "plus");
          return res
            .status(200)
            .json({ message: "Pago aprobado y membresía actualizada" });

        case "in_process":
          return res
            .status(202)
            .json({ message: "Pago en proceso de aprobación" });

        default:
          return res.status(400).json({
            message: "Pago rechazado",
            detail: payment.status_detail,
          });
      }
    } catch (error: any) {
      console.error("Error al crear el pago:", error);
      return res.status(500).json({
        message: "Error al procesar el pago",
        error: error.message,
      });
    }
  }

  async buyCoins(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const dto = req.body as CreatePaymentRequestDto;
      if (dto.packageId == null)
        return res
          .status(400)
          .json({ message: "El paquete id del paquete es requerido" });
      const payment = await this.paymentService.createPayment(dto);

      switch (payment.status) {
        case "approved": {
          const packageBuyed = await this.packageService.getPackageById(
            dto.packageId
          );
          await this.userService.addCoins(userId, packageBuyed.coins);
          await this.coinRepository.registerMovement(
            userId,
            packageBuyed.coins,
            'ingreso',
            `Compra de paquete de monedas: ${packageBuyed.description || packageBuyed.id}`
          );
          await this.notificationService.buyPackageNotification(
            userId,
            packageBuyed
          );
          return res
            .status(200)
            .json({ message: "Pago aprobado y monedas actualizadas" });
        }
        case "in_process": {
          return res
            .status(202)
            .json({ message: "Pago en proceso de aprobación" });
        }
        default: {
          return res.status(400).json({
            message: "Pago rechazado",
            detail: payment.status_detail,
          });
        }
      }
    } catch (error: any) {
      console.error("Error al comprar monedas:", error);
      return res.status(500).json({
        message: "Error al procesar el pago",
        error: error.message,
      });
    }
  }
}

import { Router } from "express";
import { UserRepositorySupabase } from "@infrastructure/repositories/user.repository.supabase";
import { UserService } from "@application/services/user.service";
import { PaymentMercadoPagoProvider } from "@infrastructure/providers/payment-mercadopago.provider";
import { PaymentService } from "@application/services/payment.service";
import { CreatePaymentRequestDto } from "@infrastructure/dtos/payment/create-payment-request.dto";
import { validateBody } from "@infrastructure/middlewares/validate-class.middleware";
import { authenticateToken } from "@infrastructure/middlewares/auth.middleware";
import { PaymentController } from "@infrastructure/controllers/payment.controller";
import { MembershipRepositorySupabase } from "@infrastructure/repositories/membership.repository.supabase";
import { MembershipService } from "@application/services/membership.service";
import { PackageRepositorySupabase } from "@/infrastructure/repositories/package.repository.supabase";
import { PackageService } from "@/application/services/package.service";
import { NotificationRepositorySupabase } from "@/infrastructure/repositories/notification.repository.supabase";
import { NotificationService } from "@/application/services/notification.service";
import { CoinRepositorySupabase } from "@infrastructure/repositories/coin.repository.supabase";

const userRepository = new UserRepositorySupabase();
const membershipRepository = new MembershipRepositorySupabase();
const paymentProvider = new PaymentMercadoPagoProvider();
const packageRepository = new PackageRepositorySupabase();
const notificationRepository = new NotificationRepositorySupabase();

const membershipService = new MembershipService(membershipRepository);
const coinRepository = new CoinRepositorySupabase();
const userService = new UserService(userRepository, membershipService);
const paymentService = new PaymentService(paymentProvider);
const packageService = new PackageService(packageRepository);
const notificationService = new NotificationService(notificationRepository);

const paymentController = new PaymentController(
  paymentService,
  userService,
  packageService,
  notificationService,
  coinRepository
);

export const paymentRouter = Router();
paymentRouter.post(
  "/create",
  authenticateToken,
  validateBody(CreatePaymentRequestDto),
  (req, res) => paymentController.createPayment(req, res)
);
paymentRouter.post(
  "/package",
  authenticateToken,
  validateBody(CreatePaymentRequestDto),
  (req, res) => paymentController.buyCoins(req, res)
);
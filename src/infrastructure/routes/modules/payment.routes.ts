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
import { RoomRepositorySupabase } from "@infrastructure/repositories/room.repository.supabase";
import { RoomService } from "@application/services/room.service";
import { CoinRepositorySupabase } from "@infrastructure/repositories/coin.repository.supabase";

const userRepository = new UserRepositorySupabase();
const membershipRepository = new MembershipRepositorySupabase();
const roomRepository = new RoomRepositorySupabase();

const coinRepository = new CoinRepositorySupabase();
const roomService = new RoomService(roomRepository, coinRepository);
const membershipService = new MembershipService(membershipRepository);
const userService = new UserService(userRepository, membershipService, roomService);
const paymentProvider = new PaymentMercadoPagoProvider();
const paymentService = new PaymentService(paymentProvider);
const paymentController = new PaymentController(paymentService, userService);

export const paymentRouter = Router();
paymentRouter.post(
  "/create",
  authenticateToken,
  validateBody(CreatePaymentRequestDto),
  (req, res) => paymentController.createPayment(req, res)
);
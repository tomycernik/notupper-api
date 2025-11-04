import { Router } from "express";
import { UserRepositorySupabase } from "../../repositories/user.repository.supabase";
import { UserService } from "../../../application/services/user.service";
import { PaymentMercadoPagoProvider } from "../../providers/payment-mercadopago.provider";
import { PaymentService } from "../../../application/services/payment.service";
import { CreatePaymentRequestDto } from "../../dtos/payment/create-payment-request.dto";
import { validateBody } from "../../middlewares/validate-class.middleware";
import { authenticateToken } from "../../middlewares/auth.middleware";
import { PaymentController } from "../../controllers/payment.controller";
import { MembershipRepositorySupabase } from "../../repositories/membership.repository.supabase";
import { MembershipService } from "../../../application/services/membership.service";
import { RoomRepositorySupabase } from "../../repositories/room.repository.supabase";
import { RoomService } from "../../../application/services/room.service";

const userRepository = new UserRepositorySupabase();
const membershipRepository = new MembershipRepositorySupabase();
const roomRepository = new RoomRepositorySupabase();

const roomService = new RoomService(roomRepository);
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
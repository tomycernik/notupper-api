import { PaymentRequest, PaymentResponse } from "@domain/models/payment.model";

export interface PaymentProvider {
    createPayment(paymentData: PaymentRequest): Promise<PaymentResponse>;
}
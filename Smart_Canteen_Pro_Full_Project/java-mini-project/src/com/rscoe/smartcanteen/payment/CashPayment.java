package com.rscoe.smartcanteen.payment;

import java.util.UUID;

/**
 * CashPayment handles cash on collection counter payment.
 */
public class CashPayment implements PaymentMethod {
    private String transactionRef;

    @Override
    public boolean processPayment(double amount) {
        if (amount < 0) return false;
        this.transactionRef = "CASH-CTR-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return true;
    }

    @Override
    public String getMethodName() {
        return "Cash at Counter on Pickup";
    }

    @Override
    public String getTransactionReference() {
        return transactionRef;
    }
}

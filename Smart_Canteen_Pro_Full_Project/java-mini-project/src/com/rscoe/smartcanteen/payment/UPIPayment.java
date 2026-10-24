package com.rscoe.smartcanteen.payment;

import java.util.UUID;

/**
 * UPIPayment handles UPI QR and VPA payments.
 */
public class UPIPayment implements PaymentMethod {
    private String upiId;
    private String transactionRef;

    public UPIPayment(String upiId) {
        this.upiId = (upiId == null || upiId.trim().isEmpty()) ? "student@okaxis" : upiId.trim();
    }

    @Override
    public boolean processPayment(double amount) {
        if (amount < 0) return false;
        this.transactionRef = "UPI-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return true;
    }

    @Override
    public String getMethodName() {
        return "UPI (" + upiId + ")";
    }

    @Override
    public String getTransactionReference() {
        return transactionRef;
    }
}

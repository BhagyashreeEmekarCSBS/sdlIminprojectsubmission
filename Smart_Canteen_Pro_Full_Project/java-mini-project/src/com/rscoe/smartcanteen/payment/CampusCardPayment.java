package com.rscoe.smartcanteen.payment;

import java.util.UUID;

/**
 * CampusCardPayment simulates deducting funds from college smart RFID ID card.
 */
public class CampusCardPayment implements PaymentMethod {
    private String cardNumber;
    private double currentBalance;
    private String transactionRef;

    public CampusCardPayment(String cardNumber, double currentBalance) {
        this.cardNumber = cardNumber;
        this.currentBalance = currentBalance;
    }

    @Override
    public boolean processPayment(double amount) {
        if (amount <= currentBalance) {
            currentBalance -= amount;
            this.transactionRef = "CARD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            return true;
        }
        return false;
    }

    @Override
    public String getMethodName() {
        return "College Smart Card (" + cardNumber + ")";
    }

    @Override
    public String getTransactionReference() {
        return transactionRef;
    }

    public double getRemainingBalance() {
        return currentBalance;
    }
}

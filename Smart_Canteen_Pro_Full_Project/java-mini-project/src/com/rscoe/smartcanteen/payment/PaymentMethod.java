package com.rscoe.smartcanteen.payment;

/**
 * PaymentMethod interface demonstrating OOP Abstraction and Polymorphism.
 */
public interface PaymentMethod {
    /**
     * Process payment for the specified amount.
     * @param amount the total amount in INR
     * @return true if authorized/successful, false otherwise
     */
    boolean processPayment(double amount);

    /**
     * @return the name of the payment mode
     */
    String getMethodName();

    /**
     * @return receipt / authorization reference string
     */
    String getTransactionReference();
}

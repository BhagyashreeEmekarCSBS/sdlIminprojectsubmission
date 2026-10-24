package com.rscoe.smartcanteen.model;

/**
 * OrderStatus enum representing the complete lifecycle of a smart canteen order.
 */
public enum OrderStatus {
    PLACED("Placed - Order Received"),
    CONFIRMED("Confirmed - Kitchen Accepted"),
    PREPARING("Preparing - Chef Cooking"),
    READY("Ready for Pickup - Token Active"),
    COLLECTED("Collected - Order Completed"),
    CANCELLED("Cancelled - Order Voided"),
    REJECTED("Rejected - Kitchen Over capacity");

    private final String displayLabel;

    OrderStatus(String displayLabel) {
        this.displayLabel = displayLabel;
    }

    public String getDisplayLabel() {
        return displayLabel;
    }
}

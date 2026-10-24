package com.rscoe.smartcanteen.model;

import java.io.Serializable;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;

/**
 * Order encapsulates complete order state, items, pricing, token, and lifecycle timestamps.
 */
public class Order implements Serializable {
    private static final long serialVersionUID = 1L;

    private String orderId;
    private String tokenNumber;
    private String studentName;
    private String studentId;
    private List<OrderItem> items;
    private OrderStatus status;
    private double subtotal;
    private double discountAmount;
    private double totalAmount;
    private String paymentMethod;
    private String paymentStatus;
    private String pickupSlot;
    private String specialInstructions;
    private Date orderTime;
    private Date readyTime;
    private Date collectedTime;
    private String verifiedByStaff;

    public Order(String orderId, String tokenNumber, String studentName, String studentId,
                 List<OrderItem> items, double discountAmount, String paymentMethod,
                 String pickupSlot, String specialInstructions) {
        this.orderId = orderId;
        this.tokenNumber = tokenNumber;
        this.studentName = studentName;
        this.studentId = studentId;
        this.items = new ArrayList<OrderItem>(items);
        this.discountAmount = discountAmount;
        this.paymentMethod = paymentMethod;
        this.paymentStatus = "PAID";
        this.pickupSlot = pickupSlot;
        this.specialInstructions = specialInstructions;
        this.status = OrderStatus.PLACED;
        this.orderTime = new Date();

        calculateTotals();
    }

    public void calculateTotals() {
        double sum = 0.0;
        for (OrderItem item : items) {
            sum += item.getLineTotal();
        }
        this.subtotal = sum;
        this.totalAmount = Math.max(0.0, this.subtotal - this.discountAmount);
    }

    public String getOrderId() { return orderId; }
    public String getTokenNumber() { return tokenNumber; }
    public String getStudentName() { return studentName; }
    public String getStudentId() { return studentId; }
    public List<OrderItem> getItems() { return Collections.unmodifiableList(items); }
    public OrderStatus getStatus() { return status; }
    public double getSubtotal() { return subtotal; }
    public double getDiscountAmount() { return discountAmount; }
    public double getTotalAmount() { return totalAmount; }
    public String getPaymentMethod() { return paymentMethod; }
    public String getPaymentStatus() { return paymentStatus; }
    public String getPickupSlot() { return pickupSlot; }
    public String getSpecialInstructions() { return specialInstructions; }
    public Date getOrderTime() { return orderTime; }
    public Date getReadyTime() { return readyTime; }
    public Date getCollectedTime() { return collectedTime; }
    public String getVerifiedByStaff() { return verifiedByStaff; }

    public void setStatus(OrderStatus status) {
        this.status = status;
        if (status == OrderStatus.READY && this.readyTime == null) {
            this.readyTime = new Date();
        } else if (status == OrderStatus.COLLECTED && this.collectedTime == null) {
            this.collectedTime = new Date();
        }
    }

    public void markCollected(String staffName) {
        this.status = OrderStatus.COLLECTED;
        this.collectedTime = new Date();
        this.verifiedByStaff = staffName;
    }

    public int getEstimatedPrepTimeMinutes() {
        int maxPrep = 5;
        for (OrderItem item : items) {
            if (item.getFoodItem().getPrepTimeMinutes() > maxPrep) {
                maxPrep = item.getFoodItem().getPrepTimeMinutes();
            }
        }
        return maxPrep;
    }

    public String generateReceipt() {
        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
        StringBuilder sb = new StringBuilder();
        sb.append("====================================================\n");
        sb.append("        SMART CANTEEN PRO - RSCOE PUNE              \n");
        sb.append("               OFFICIAL ORDER RECEIPT               \n");
        sb.append("====================================================\n");
        sb.append(String.format("Order ID   : %s\n", orderId));
        sb.append(String.format("Token No.  : %s  <<< PRESENT AT COUNTER\n", tokenNumber));
        sb.append(String.format("Date & Time: %s\n", sdf.format(orderTime)));
        sb.append(String.format("Student    : %s (%s)\n", studentName, studentId));
        sb.append(String.format("Pickup Slot: %s\n", pickupSlot));
        sb.append(String.format("Status     : %s\n", status.getDisplayLabel()));
        sb.append("----------------------------------------------------\n");
        sb.append(String.format("%-24s %5s %9s %10s\n", "Item", "Qty", "Price", "Total"));
        sb.append("----------------------------------------------------\n");
        for (OrderItem item : items) {
            sb.append(String.format("%-24s %5d ₹%8.2f ₹%9.2f\n",
                    item.getFoodItem().getName(),
                    item.getQuantity(),
                    item.getFoodItem().getPrice(),
                    item.getLineTotal()));
            if (!item.getCustomizationNote().isEmpty()) {
                sb.append(String.format("   * Note: %s\n", item.getCustomizationNote()));
            }
        }
        sb.append("----------------------------------------------------\n");
        sb.append(String.format("Subtotal       : ₹%10.2f\n", subtotal));
        if (discountAmount > 0) {
            sb.append(String.format("Discount/Coupon: -₹%9.2f\n", discountAmount));
        }
        sb.append(String.format("FINAL TOTAL    : ₹%10.2f\n", totalAmount));
        sb.append(String.format("Payment Mode   : %s (%s)\n", paymentMethod, paymentStatus));
        if (specialInstructions != null && !specialInstructions.trim().isEmpty()) {
            sb.append(String.format("Instructions   : %s\n", specialInstructions));
        }
        sb.append("====================================================\n");
        sb.append("    Thank you for ordering at Smart Canteen!        \n");
        sb.append("====================================================\n");
        return sb.toString();
    }
}

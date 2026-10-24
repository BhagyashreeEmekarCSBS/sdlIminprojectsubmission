package com.rscoe.smartcanteen.service;

import com.rscoe.smartcanteen.exception.InvalidOrderException;
import com.rscoe.smartcanteen.exception.OutOfStockException;
import com.rscoe.smartcanteen.exception.TokenVerificationException;
import com.rscoe.smartcanteen.model.Order;
import com.rscoe.smartcanteen.model.OrderItem;
import com.rscoe.smartcanteen.model.OrderStatus;
import com.rscoe.smartcanteen.payment.PaymentMethod;

import java.util.List;

/**
 * OrderService defines abstract operations for order processing, tokens, and kitchen queues.
 */
public interface OrderService {
    Order placeOrder(String studentName, String studentId, List<OrderItem> items,
                     String couponCode, PaymentMethod paymentMethod,
                     String pickupSlot, String specialInstructions)
            throws InvalidOrderException, OutOfStockException;

    Order getOrderById(String orderId);
    Order getOrderByToken(String tokenNumber);
    List<Order> getActiveKitchenOrders();
    List<Order> getAllOrders();
    List<Order> getOrdersByStudent(String studentId);

    boolean updateOrderStatus(String orderId, OrderStatus newStatus);
    Order verifyAndCollectOrder(String tokenNumber, String staffMember)
            throws TokenVerificationException;
    boolean cancelOrder(String orderId, String reason);
    double applyCoupon(String couponCode, double subtotal);
}

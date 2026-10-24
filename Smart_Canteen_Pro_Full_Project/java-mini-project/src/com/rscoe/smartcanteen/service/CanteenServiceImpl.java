package com.rscoe.smartcanteen.service;

import com.rscoe.smartcanteen.exception.InvalidOrderException;
import com.rscoe.smartcanteen.exception.OutOfStockException;
import com.rscoe.smartcanteen.exception.TokenVerificationException;
import com.rscoe.smartcanteen.model.FoodItem;
import com.rscoe.smartcanteen.model.Order;
import com.rscoe.smartcanteen.model.OrderItem;
import com.rscoe.smartcanteen.model.OrderStatus;
import com.rscoe.smartcanteen.payment.PaymentMethod;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * CanteenServiceImpl manages in-memory business collections, coupon rules,
 * thread-safe token generation, stock management, and disk sync.
 */
public class CanteenServiceImpl implements MenuService, OrderService {
    private final Map<String, FoodItem> menuMap;
    private final Map<String, Order> orderMap;       // by orderId
    private final Map<String, Order> tokenOrderMap;  // by tokenNumber
    private final FileStorageService storageService;
    private final AtomicInteger tokenSequence;

    // Supported coupons
    private final Map<String, Double> percentageCoupons;
    private final Map<String, Double> flatCoupons;

    public CanteenServiceImpl(String dataDir) {
        this.menuMap = new LinkedHashMap<String, FoodItem>();
        this.orderMap = new LinkedHashMap<String, Order>();
        this.tokenOrderMap = new LinkedHashMap<String, Order>();
        this.storageService = new FileStorageService(dataDir);
        this.tokenSequence = new AtomicInteger(1001);

        this.percentageCoupons = new HashMap<String, Double>();
        this.percentageCoupons.put("WELCOME20", 0.20); // 20% off
        this.percentageCoupons.put("STUDENT15", 0.15); // 15% off

        this.flatCoupons = new HashMap<String, Double>();
        this.flatCoupons.put("HUNGRY50", 50.0); // Flat ₹50 off
        this.flatCoupons.put("CHAI10", 10.0);   // Flat ₹10 off

        initializeData();
    }

    private void initializeData() {
        // Try loading from file first
        List<FoodItem> loaded = storageService.loadMenu();
        if (!loaded.isEmpty()) {
            for (FoodItem item : loaded) {
                menuMap.put(item.getId(), item);
            }
            System.out.println("Loaded " + menuMap.size() + " items from local storage.");
        } else {
            // Seed default RSCOE canteen menu
            seedDefaultMenu();
            try {
                storageService.saveMenu(new ArrayList<FoodItem>(menuMap.values()));
            } catch (IOException e) {
                System.err.println("Could not write default menu: " + e.getMessage());
            }
        }
    }

    private void seedDefaultMenu() {
        addMenuItem(new FoodItem("F101", "Poha with Sev", 30.0, "Breakfast", true, 5, true, 40));
        addMenuItem(new FoodItem("F102", "Upma Chutney", 35.0, "Breakfast", true, 7, true, 30));
        addMenuItem(new FoodItem("F103", "Samosa (2 pc)", 25.0, "Snacks", true, 5, true, 50));
        addMenuItem(new FoodItem("F104", "Vada Pav (2 pc)", 30.0, "Snacks", true, 5, true, 45));
        addMenuItem(new FoodItem("F105", "Masala Dosa", 70.0, "South Indian", true, 12, true, 35));
        addMenuItem(new FoodItem("F106", "Idli Vada Combo", 55.0, "South Indian", true, 6, true, 40));
        addMenuItem(new FoodItem("F107", "Veg Dum Biryani", 110.0, "Main Course", true, 15, true, 25));
        addMenuItem(new FoodItem("F108", "Pav Bhaji Plate", 80.0, "Main Course", true, 10, true, 30));
        addMenuItem(new FoodItem("F109", "Paneer Butter Masala", 130.0, "North Indian", true, 15, true, 20));
        addMenuItem(new FoodItem("F110", "Veg Hakka Noodles", 85.0, "Chinese", true, 12, true, 30));
        addMenuItem(new FoodItem("F111", "Masala Chai", 20.0, "Beverages", true, 4, true, 80));
        addMenuItem(new FoodItem("F112", "Cold Coffee", 55.0, "Beverages", true, 5, true, 40));
        addMenuItem(new FoodItem("F113", "Fresh Lime Soda", 35.0, "Beverages", true, 4, true, 50));
        addMenuItem(new FoodItem("F114", "Chocolate Brownie", 45.0, "Desserts", true, 3, true, 25));
        addMenuItem(new FoodItem("F115", "Student Deluxe Thali", 140.0, "Combos", true, 15, true, 25));
    }

    // ---------------- MENU SERVICE IMPLEMENTATION ----------------

    @Override
    public List<FoodItem> getAllMenuItems() {
        return new ArrayList<FoodItem>(menuMap.values());
    }

    @Override
    public List<FoodItem> getAvailableMenuItems() {
        List<FoodItem> list = new ArrayList<FoodItem>();
        for (FoodItem item : menuMap.values()) {
            if (item.isAvailable()) {
                list.add(item);
            }
        }
        return list;
    }

    @Override
    public List<FoodItem> getItemsByCategory(String category) {
        List<FoodItem> list = new ArrayList<FoodItem>();
        for (FoodItem item : menuMap.values()) {
            if (item.getCategory().equalsIgnoreCase(category)) {
                list.add(item);
            }
        }
        return list;
    }

    @Override
    public FoodItem getItemById(String id) {
        return menuMap.get(id);
    }

    @Override
    public synchronized void addMenuItem(FoodItem item) {
        menuMap.put(item.getId(), item);
        try {
            storageService.saveMenu(new ArrayList<FoodItem>(menuMap.values()));
        } catch (IOException ignored) {}
    }

    @Override
    public synchronized boolean updateItemPrice(String id, double newPrice) {
        FoodItem item = menuMap.get(id);
        if (item != null) {
            item.setPrice(newPrice);
            try {
                storageService.saveMenu(new ArrayList<FoodItem>(menuMap.values()));
            } catch (IOException ignored) {}
            return true;
        }
        return false;
    }

    @Override
    public synchronized boolean setItemAvailability(String id, boolean isAvailable) {
        FoodItem item = menuMap.get(id);
        if (item != null) {
            item.setAvailable(isAvailable);
            try {
                storageService.saveMenu(new ArrayList<FoodItem>(menuMap.values()));
            } catch (IOException ignored) {}
            return true;
        }
        return false;
    }

    @Override
    public synchronized boolean updateItemStock(String id, int stockQuantity) {
        FoodItem item = menuMap.get(id);
        if (item != null) {
            item.setStockQuantity(stockQuantity);
            try {
                storageService.saveMenu(new ArrayList<FoodItem>(menuMap.values()));
            } catch (IOException ignored) {}
            return true;
        }
        return false;
    }

    @Override
    public synchronized boolean removeItem(String id) {
        if (menuMap.containsKey(id)) {
            menuMap.remove(id);
            try {
                storageService.saveMenu(new ArrayList<FoodItem>(menuMap.values()));
            } catch (IOException ignored) {}
            return true;
        }
        return false;
    }

    // ---------------- ORDER SERVICE IMPLEMENTATION ----------------

    @Override
    public double applyCoupon(String couponCode, double subtotal) {
        if (couponCode == null || couponCode.trim().isEmpty()) return 0.0;
        String cleanCode = couponCode.trim().toUpperCase();

        if (percentageCoupons.containsKey(cleanCode)) {
            double rate = percentageCoupons.get(cleanCode);
            double disc = subtotal * rate;
            return Math.min(disc, 50.0); // max ₹50 discount
        }

        if (flatCoupons.containsKey(cleanCode)) {
            double flat = flatCoupons.get(cleanCode);
            if (subtotal >= 100.0) {
                return flat;
            }
        }
        return 0.0;
    }

    @Override
    public synchronized Order placeOrder(String studentName, String studentId,
                                         List<OrderItem> items, String couponCode,
                                         PaymentMethod paymentMethod, String pickupSlot,
                                         String specialInstructions)
            throws InvalidOrderException, OutOfStockException {

        if (studentName == null || studentName.trim().isEmpty()) {
            throw new InvalidOrderException("Student name is required.");
        }
        if (studentId == null || studentId.trim().isEmpty()) {
            throw new InvalidOrderException("Student ID / Roll number is required.");
        }
        if (items == null || items.isEmpty()) {
            throw new InvalidOrderException("Order must contain at least one item.");
        }

        // Validate stock for all items before making any modifications
        for (OrderItem orderItem : items) {
            FoodItem food = menuMap.get(orderItem.getFoodItem().getId());
            if (food == null) {
                throw new InvalidOrderException("Item not found: " + orderItem.getFoodItem().getName());
            }
            if (!food.isAvailable() || food.getStockQuantity() < orderItem.getQuantity()) {
                throw new OutOfStockException(String.format("Item '%s' has insufficient stock (Requested: %d, Available: %d)",
                        food.getName(), orderItem.getQuantity(), food.getStockQuantity()));
            }
        }

        // Calculate subtotal
        double subtotal = 0.0;
        for (OrderItem oi : items) {
            subtotal += oi.getLineTotal();
        }

        // Discount
        double discount = applyCoupon(couponCode, subtotal);
        double finalAmount = Math.max(0.0, subtotal - discount);

        // Process payment
        if (paymentMethod != null) {
            boolean success = paymentMethod.processPayment(finalAmount);
            if (!success) {
                throw new InvalidOrderException("Payment authorization failed via " + paymentMethod.getMethodName());
            }
        }

        // Deduct inventory atomically
        for (OrderItem orderItem : items) {
            FoodItem food = menuMap.get(orderItem.getFoodItem().getId());
            food.deductStock(orderItem.getQuantity());
        }

        // Generate identifiers
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd-HHmmss");
        String orderId = "ORD-" + sdf.format(new Date());
        String tokenNumber = "SC-" + tokenSequence.getAndIncrement();

        String slot = (pickupSlot == null || pickupSlot.trim().isEmpty()) ? "Immediate" : pickupSlot.trim();
        String payName = (paymentMethod == null) ? "Cash on Counter" : paymentMethod.getMethodName();

        Order order = new Order(orderId, tokenNumber, studentName, studentId, items,
                discount, payName, slot, specialInstructions);

        orderMap.put(orderId, order);
        tokenOrderMap.put(tokenNumber, order);

        // Persist to file
        storageService.logOrder(order);
        try {
            storageService.saveMenu(new ArrayList<FoodItem>(menuMap.values()));
        } catch (IOException ignored) {}

        return order;
    }

    @Override
    public Order getOrderById(String orderId) {
        return orderMap.get(orderId);
    }

    @Override
    public Order getOrderByToken(String tokenNumber) {
        if (tokenNumber == null) return null;
        return tokenOrderMap.get(tokenNumber.trim().toUpperCase());
    }

    @Override
    public List<Order> getActiveKitchenOrders() {
        List<Order> active = new ArrayList<Order>();
        for (Order o : orderMap.values()) {
            if (o.getStatus() == OrderStatus.PLACED ||
                o.getStatus() == OrderStatus.CONFIRMED ||
                o.getStatus() == OrderStatus.PREPARING ||
                o.getStatus() == OrderStatus.READY) {
                active.add(o);
            }
        }
        return active;
    }

    @Override
    public List<Order> getAllOrders() {
        return new ArrayList<Order>(orderMap.values());
    }

    @Override
    public List<Order> getOrdersByStudent(String studentId) {
        List<Order> list = new ArrayList<Order>();
        if (studentId == null) return list;
        for (Order o : orderMap.values()) {
            if (studentId.equalsIgnoreCase(o.getStudentId())) {
                list.add(o);
            }
        }
        return list;
    }

    @Override
    public synchronized boolean updateOrderStatus(String orderId, OrderStatus newStatus) {
        Order order = orderMap.get(orderId);
        if (order != null) {
            order.setStatus(newStatus);
            storageService.logOrder(order);
            return true;
        }
        return false;
    }

    /**
     * Complete 5-step pickup verification strictly fulfilling Section 6:
     * 1. The order exists
     * 2. The token belongs to that order
     * 3. The order is paid / authorized
     * 4. The order is ready for pickup
     * 5. The order has not already been collected
     */
    @Override
    public synchronized Order verifyAndCollectOrder(String tokenNumber, String staffMember)
            throws TokenVerificationException {

        if (tokenNumber == null || tokenNumber.trim().isEmpty()) {
            throw new TokenVerificationException("Token number cannot be empty.");
        }

        String cleanToken = tokenNumber.trim().toUpperCase();
        Order order = tokenOrderMap.get(cleanToken);

        // Check 1 & 2: Order exists and token matches
        if (order == null) {
            throw new TokenVerificationException("No order found matching token: " + cleanToken);
        }

        // Check 5: Already collected check
        if (order.getStatus() == OrderStatus.COLLECTED) {
            throw new TokenVerificationException(String.format("Token %s has ALREADY been collected on %s (Verified by %s). Cannot reuse token!",
                    cleanToken, order.getCollectedTime(), order.getVerifiedByStaff()));
        }

        // Cancelled or rejected checks
        if (order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.REJECTED) {
            throw new TokenVerificationException(String.format("Token %s cannot be collected because order status is: %s",
                    cleanToken, order.getStatus().name()));
        }

        // Check 4: Must be marked READY for pickup
        if (order.getStatus() != OrderStatus.READY) {
            throw new TokenVerificationException(String.format("Order is not ready yet! Current status: %s. Please wait until kitchen marks it READY.",
                    order.getStatus().getDisplayLabel()));
        }

        // Check 3: Payment status check
        if (!"PAID".equalsIgnoreCase(order.getPaymentStatus())) {
            throw new TokenVerificationException("Order payment is not authorized. Counter payment required first.");
        }

        // Verification successful -> mark collected
        order.markCollected(staffMember == null ? "Staff Member" : staffMember);
        storageService.logOrder(order);

        return order;
    }

    @Override
    public synchronized boolean cancelOrder(String orderId, String reason) {
        Order order = orderMap.get(orderId);
        if (order == null) return false;

        // Can only cancel if PLACED or CONFIRMED (not yet preparing/ready/collected)
        if (order.getStatus() == OrderStatus.PLACED || order.getStatus() == OrderStatus.CONFIRMED) {
            order.setStatus(OrderStatus.CANCELLED);

            // Restore inventory
            for (OrderItem oi : order.getItems()) {
                FoodItem food = menuMap.get(oi.getFoodItem().getId());
                if (food != null) {
                    food.restoreStock(oi.getQuantity());
                }
            }
            try {
                storageService.saveMenu(new ArrayList<FoodItem>(menuMap.values()));
            } catch (IOException ignored) {}
            storageService.logOrder(order);
            return true;
        }
        return false;
    }
}

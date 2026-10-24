package com.rscoe.smartcanteen.test;

import com.rscoe.smartcanteen.exception.OutOfStockException;
import com.rscoe.smartcanteen.exception.TokenVerificationException;
import com.rscoe.smartcanteen.model.FoodItem;
import com.rscoe.smartcanteen.model.Order;
import com.rscoe.smartcanteen.model.OrderItem;
import com.rscoe.smartcanteen.model.OrderStatus;
import com.rscoe.smartcanteen.payment.UPIPayment;
import com.rscoe.smartcanteen.service.CanteenServiceImpl;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

/**
 * Automated test suite for Core Java Smart Canteen implementation.
 */
public class SmartCanteenTest {
    public static void main(String[] args) {
        System.out.println("Running Smart Canteen Core Java Verification Suite...");
        int passed = 0;
        int failed = 0;

        String testDataDir = "build/test-data";
        File dir = new File(testDataDir);
        if (dir.exists()) {
            File[] files = dir.listFiles();
            if (files != null) for (File f : files) f.delete();
            dir.delete();
        }

        CanteenServiceImpl service = new CanteenServiceImpl(testDataDir);

        // Test 1: Verify menu loaded
        try {
            List<FoodItem> items = service.getAllMenuItems();
            assert items.size() >= 10 : "Expected at least 10 default menu items";
            System.out.println("[PASS] Test 1: Default menu loaded with " + items.size() + " items");
            passed++;
        } catch (Throwable t) {
            System.err.println("[FAIL] Test 1: " + t.getMessage());
            failed++;
        }

        // Test 2: Place valid order with coupon and verify token
        Order order = null;
        try {
            FoodItem samosa = service.getItemById("F103");
            FoodItem chai = service.getItemById("F111");

            List<OrderItem> cart = new ArrayList<OrderItem>();
            cart.add(new OrderItem(samosa, 2, "Extra mint chutney"));
            cart.add(new OrderItem(chai, 2, "Kadak"));

            order = service.placeOrder("Yashraj Ghate", "RBT25CB042", cart,
                    "WELCOME20", new UPIPayment("yashraj@okaxis"), "Immediate", "No plastic");

            assert order != null : "Order should not be null";
            assert order.getTokenNumber().startsWith("SC-") : "Token format should start with SC-";
            assert order.getTotalAmount() > 0 : "Total should be positive";
            System.out.println("[PASS] Test 2: Order placed successfully with Token: " + order.getTokenNumber() +
                    " Total: Rs." + order.getTotalAmount());
            passed++;
        } catch (Throwable t) {
            System.err.println("[FAIL] Test 2: " + t.getMessage());
            failed++;
        }

        // Test 3: Reject pickup verification when NOT ready
        try {
            service.verifyAndCollectOrder(order.getTokenNumber(), "Staff Ramesh");
            System.err.println("[FAIL] Test 3: Should have rejected verification because status is PLACED");
            failed++;
        } catch (TokenVerificationException e) {
            System.out.println("[PASS] Test 3: Correctly rejected premature pickup: " + e.getMessage());
            passed++;
        } catch (Throwable t) {
            System.err.println("[FAIL] Test 3: Unexpected error: " + t.getMessage());
            failed++;
        }

        // Test 4: Move order to PREPARING then READY and verify pickup
        try {
            service.updateOrderStatus(order.getOrderId(), OrderStatus.PREPARING);
            service.updateOrderStatus(order.getOrderId(), OrderStatus.READY);

            Order collected = service.verifyAndCollectOrder(order.getTokenNumber(), "Staff Ramesh");
            assert collected.getStatus() == OrderStatus.COLLECTED : "Status should be COLLECTED";
            assert collected.getCollectedTime() != null : "Collected time should be set";
            System.out.println("[PASS] Test 4: Status workflow to READY -> Verified and COLLECTED successfully");
            passed++;
        } catch (Throwable t) {
            System.err.println("[FAIL] Test 4: " + t.getMessage());
            failed++;
        }

        // Test 5: Reject re-use of already collected token
        try {
            service.verifyAndCollectOrder(order.getTokenNumber(), "Staff Ramesh");
            System.err.println("[FAIL] Test 5: Re-used token was not rejected!");
            failed++;
        } catch (TokenVerificationException e) {
            System.out.println("[PASS] Test 5: Correctly rejected re-used token: " + e.getMessage());
            passed++;
        } catch (Throwable t) {
            System.err.println("[FAIL] Test 5: " + t.getMessage());
            failed++;
        }

        // Test 6: Out of stock validation
        try {
            FoodItem samosa = service.getItemById("F103");
            List<OrderItem> excessive = new ArrayList<OrderItem>();
            excessive.add(new OrderItem(samosa, 9999, ""));
            service.placeOrder("Piyush Lokhande", "RBT25CB043", excessive,
                    null, new UPIPayment("piyush@okaxis"), "Immediate", null);
            System.err.println("[FAIL] Test 6: Excessive quantity was not rejected!");
            failed++;
        } catch (OutOfStockException e) {
            System.out.println("[PASS] Test 6: Correctly rejected out-of-stock order: " + e.getMessage());
            passed++;
        } catch (Throwable t) {
            System.err.println("[FAIL] Test 6: " + t.getMessage());
            failed++;
        }

        System.out.println("=================================================");
        System.out.println("Core Java Test Summary: " + passed + " Passed, " + failed + " Failed");
        System.out.println("=================================================");

        if (failed > 0) {
            System.exit(1);
        }
    }
}

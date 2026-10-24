package com.rscoe.smartcanteen.ui;

import com.rscoe.smartcanteen.exception.InvalidOrderException;
import com.rscoe.smartcanteen.exception.OutOfStockException;
import com.rscoe.smartcanteen.exception.TokenVerificationException;
import com.rscoe.smartcanteen.model.FoodItem;
import com.rscoe.smartcanteen.model.Order;
import com.rscoe.smartcanteen.model.OrderItem;
import com.rscoe.smartcanteen.model.OrderStatus;
import com.rscoe.smartcanteen.payment.CampusCardPayment;
import com.rscoe.smartcanteen.payment.CashPayment;
import com.rscoe.smartcanteen.payment.PaymentMethod;
import com.rscoe.smartcanteen.payment.UPIPayment;
import com.rscoe.smartcanteen.service.CanteenServiceImpl;

import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

/**
 * SmartCanteenConsoleApp provides a complete interactive CLI demonstration.
 */
public class SmartCanteenConsoleApp {
    private final CanteenServiceImpl canteenService;
    private final Scanner scanner;

    public SmartCanteenConsoleApp(CanteenServiceImpl canteenService) {
        this.canteenService = canteenService;
        this.scanner = new Scanner(System.in);
    }

    public void start() {
        while (true) {
            System.out.println("\n=======================================================");
            System.out.println("   SMART CANTEEN PRE-ORDER & TOKEN SYSTEM (CORE JAVA)  ");
            System.out.println("     RSCOE Pune - Dept. of Computer Science & BS       ");
            System.out.println("=======================================================");
            System.out.println("1. Student Portal (Browse Menu, Order, View Tokens)");
            System.out.println("2. Canteen Staff Portal (Kitchen Queue, Token Verification)");
            System.out.println("3. Administrator Portal (Manage Menu, Stock, Reports)");
            System.out.println("4. Exit");
            System.out.print("Select an option (1-4): ");

            String choice = scanner.nextLine().trim();
            if ("1".equals(choice)) {
                handleStudentPortal();
            } else if ("2".equals(choice)) {
                handleStaffPortal();
            } else if ("3".equals(choice)) {
                handleAdminPortal();
            } else if ("4".equals(choice)) {
                System.out.println("\nExiting Smart Canteen System. Have a great day!");
                break;
            } else {
                System.out.println("Invalid option. Please enter 1, 2, 3, or 4.");
            }
        }
    }

    private void handleStudentPortal() {
        System.out.print("\nEnter Student Name [e.g. Yashraj Ghate]: ");
        String name = scanner.nextLine().trim();
        if (name.isEmpty()) name = "Yashraj Ghate";

        System.out.print("Enter Roll No / Student ID [e.g. RBT25CB042]: ");
        String studentId = scanner.nextLine().trim();
        if (studentId.isEmpty()) studentId = "RBT25CB042";

        List<OrderItem> cart = new ArrayList<OrderItem>();

        while (true) {
            System.out.println("\n--- STUDENT PORTAL [" + name + " - " + studentId + "] ---");
            System.out.println("1. View Menu");
            System.out.println("2. Add Item to Cart");
            System.out.println("3. View Cart (" + cart.size() + " items)");
            System.out.println("4. Checkout & Generate Token");
            System.out.println("5. Track Order by Token");
            System.out.println("6. Back to Main Menu");
            System.out.print("Choose: ");
            String subChoice = scanner.nextLine().trim();

            if ("1".equals(subChoice)) {
                displayMenu();
            } else if ("2".equals(subChoice)) {
                displayMenu();
                System.out.print("\nEnter Food Item ID to add: ");
                String itemId = scanner.nextLine().trim().toUpperCase();
                FoodItem item = canteenService.getItemById(itemId);
                if (item == null) {
                    System.out.println("Error: Item ID not found.");
                    continue;
                }
                if (!item.isAvailable()) {
                    System.out.println("Error: Sorry, this item is currently OUT OF STOCK.");
                    continue;
                }
                System.out.print("Enter quantity (Available " + item.getStockQuantity() + "): ");
                try {
                    int qty = Integer.parseInt(scanner.nextLine().trim());
                    if (qty <= 0) {
                        System.out.println("Error: Quantity must be greater than zero.");
                        continue;
                    }
                    if (qty > item.getStockQuantity()) {
                        System.out.println("Error: Requested quantity exceeds available stock (" + item.getStockQuantity() + ").");
                        continue;
                    }
                    System.out.print("Special customization (optional, press Enter to skip): ");
                    String custom = scanner.nextLine().trim();
                    cart.add(new OrderItem(item, qty, custom));
                    System.out.println("Added to cart: " + item.getName() + " x " + qty);
                } catch (NumberFormatException e) {
                    System.out.println("Error: Please enter a valid numeric quantity.");
                }
            } else if ("3".equals(subChoice)) {
                if (cart.isEmpty()) {
                    System.out.println("\nYour cart is currently empty.");
                } else {
                    System.out.println("\n--- CURRENT CART ---");
                    double sum = 0;
                    for (int i = 0; i < cart.size(); i++) {
                        OrderItem oi = cart.get(i);
                        System.out.println((i + 1) + ". " + oi.toString());
                        sum += oi.getLineTotal();
                    }
                    System.out.printf("Cart Subtotal: ₹%.2f\n", sum);
                }
            } else if ("4".equals(subChoice)) {
                if (cart.isEmpty()) {
                    System.out.println("Error: Your cart is empty! Please add items before checking out.");
                    continue;
                }
                System.out.print("\nEnter Coupon Code (e.g. WELCOME20, HUNGRY50, or press Enter to skip): ");
                String coupon = scanner.nextLine().trim();

                System.out.println("\nSelect Payment Method:");
                System.out.println("1. UPI (GPay / PhonePe / Paytm)");
                System.out.println("2. College Smart RFID Card (Campus Balance)");
                System.out.println("3. Cash at Pickup Counter");
                System.out.print("Choice (1-3): ");
                String payChoice = scanner.nextLine().trim();

                PaymentMethod paymentMethod;
                if ("1".equals(payChoice)) {
                    System.out.print("Enter UPI ID [e.g. student@okaxis]: ");
                    String upi = scanner.nextLine().trim();
                    paymentMethod = new UPIPayment(upi);
                } else if ("2".equals(payChoice)) {
                    paymentMethod = new CampusCardPayment("RFID-" + studentId, 500.0);
                } else {
                    paymentMethod = new CashPayment();
                }

                System.out.print("Select Pickup Slot (1. Immediate [10-15 mins], 2. Next Lunch Slot [13:15]): ");
                String slotChoice = scanner.nextLine().trim();
                String slot = "2".equals(slotChoice) ? "13:15 - 13:30 Lunch Break" : "Immediate (10-15 mins)";

                System.out.print("Special Cooking Instructions (optional): ");
                String instructions = scanner.nextLine().trim();

                try {
                    Order placed = canteenService.placeOrder(name, studentId, cart, coupon,
                            paymentMethod, slot, instructions);
                    System.out.println("\nSUCCESS! Order placed successfully!");
                    System.out.println(placed.generateReceipt());
                    cart.clear(); // Clear cart after successful placement
                } catch (InvalidOrderException e) {
                    System.out.println("Order Error: " + e.getMessage());
                } catch (OutOfStockException e) {
                    System.out.println("Stock Error: " + e.getMessage());
                }
            } else if ("5".equals(subChoice)) {
                System.out.print("\nEnter your Pickup Token [e.g. SC-1001]: ");
                String token = scanner.nextLine().trim().toUpperCase();
                Order order = canteenService.getOrderByToken(token);
                if (order == null) {
                    System.out.println("Error: No order found for token " + token);
                } else {
                    System.out.println("\n--- ORDER STATUS TRACKING ---");
                    System.out.println("Token Number: " + order.getTokenNumber());
                    System.out.println("Order ID    : " + order.getOrderId());
                    System.out.println("Current Status: >>> " + order.getStatus().getDisplayLabel() + " <<<");
                    System.out.printf("Total Amount: ₹%.2f (%s)\n", order.getTotalAmount(), order.getPaymentStatus());
                    System.out.println("Pickup Slot : " + order.getPickupSlot());
                }
            } else if ("6".equals(subChoice)) {
                break;
            }
        }
    }

    private void handleStaffPortal() {
        while (true) {
            System.out.println("\n--- CANTEEN STAFF & KITCHEN PORTAL ---");
            System.out.println("1. View Active Kitchen Orders");
            System.out.println("2. Update Order Status (Preparing / Ready)");
            System.out.println("3. Verify Pickup Token (Counter Pickup)");
            System.out.println("4. Toggle Item Stock / Availability");
            System.out.println("5. Back to Main Menu");
            System.out.print("Choose: ");
            String choice = scanner.nextLine().trim();

            if ("1".equals(choice)) {
                List<Order> active = canteenService.getActiveKitchenOrders();
                if (active.isEmpty()) {
                    System.out.println("\nNo active orders in the kitchen right now.");
                } else {
                    System.out.println("\n=== ACTIVE KITCHEN QUEUE (" + active.size() + " orders) ===");
                    for (Order o : active) {
                        System.out.printf("Token: %-8s | Order: %-16s | Student: %-16s | Status: %-18s\n",
                                o.getTokenNumber(), o.getOrderId(), o.getStudentName(), o.getStatus().name());
                        for (OrderItem oi : o.getItems()) {
                            System.out.println("   - " + oi.getFoodItem().getName() + " x " + oi.getQuantity());
                        }
                    }
                }
            } else if ("2".equals(choice)) {
                System.out.print("\nEnter Token Number to update: ");
                String token = scanner.nextLine().trim().toUpperCase();
                Order order = canteenService.getOrderByToken(token);
                if (order == null) {
                    System.out.println("Error: Token not found.");
                    continue;
                }
                System.out.println("Current Status: " + order.getStatus().name());
                System.out.println("1. Mark CONFIRMED");
                System.out.println("2. Mark PREPARING");
                System.out.println("3. Mark READY FOR PICKUP");
                System.out.println("4. Mark REJECTED (Kitchen Overloaded)");
                System.out.print("Select new status (1-4): ");
                String st = scanner.nextLine().trim();
                OrderStatus newStatus = null;
                if ("1".equals(st)) newStatus = OrderStatus.CONFIRMED;
                else if ("2".equals(st)) newStatus = OrderStatus.PREPARING;
                else if ("3".equals(st)) newStatus = OrderStatus.READY;
                else if ("4".equals(st)) newStatus = OrderStatus.REJECTED;

                if (newStatus != null) {
                    canteenService.updateOrderStatus(order.getOrderId(), newStatus);
                    System.out.println("Success: Token " + token + " updated to " + newStatus.getDisplayLabel());
                }
            } else if ("3".equals(choice)) {
                System.out.print("\nScan or Enter Student Pickup Token [e.g. SC-1001]: ");
                String token = scanner.nextLine().trim().toUpperCase();
                System.out.print("Staff Member Name: ");
                String staff = scanner.nextLine().trim();
                if (staff.isEmpty()) staff = "Counter Staff Ramesh";

                try {
                    Order collected = canteenService.verifyAndCollectOrder(token, staff);
                    System.out.println("\n[OK] TOKEN VERIFIED SUCCESSFULLY!");
                    System.out.println("Token Number   : " + collected.getTokenNumber());
                    System.out.println("Student        : " + collected.getStudentName() + " (" + collected.getStudentId() + ")");
                    System.out.printf("Total Amount   : Rs.%.2f (%s)\n", collected.getTotalAmount(), collected.getPaymentStatus());
                    System.out.println("Items to hand over:");
                    for (OrderItem oi : collected.getItems()) {
                        System.out.println("   [+] " + oi.getFoodItem().getName() + " x " + oi.getQuantity());
                    }
                    System.out.println("Order status updated to: " + collected.getStatus().getDisplayLabel());
                } catch (TokenVerificationException e) {
                    System.out.println("\n[X] TOKEN VERIFICATION FAILED: " + e.getMessage());
                }
            } else if ("4".equals(choice)) {
                displayMenu();
                System.out.print("\nEnter Food Item ID to toggle: ");
                String id = scanner.nextLine().trim().toUpperCase();
                FoodItem item = canteenService.getItemById(id);
                if (item == null) {
                    System.out.println("Error: Item not found.");
                    continue;
                }
                System.out.println("Current Availability: " + item.isAvailable() + ", Stock: " + item.getStockQuantity());
                System.out.print("Enter new stock quantity (0 to mark unavailable): ");
                try {
                    int stock = Integer.parseInt(scanner.nextLine().trim());
                    canteenService.updateItemStock(id, stock);
                    System.out.println("Stock updated to " + stock);
                } catch (NumberFormatException e) {
                    System.out.println("Invalid number.");
                }
            } else if ("5".equals(choice)) {
                break;
            }
        }
    }

    private void handleAdminPortal() {
        while (true) {
            System.out.println("\n--- CANTEEN ADMINISTRATOR PORTAL ---");
            System.out.println("1. View Complete Menu");
            System.out.println("2. Add New Menu Item");
            System.out.println("3. Update Menu Item Price");
            System.out.println("4. View All Orders & Revenue Summary");
            System.out.println("5. Back to Main Menu");
            System.out.print("Choose: ");
            String choice = scanner.nextLine().trim();

            if ("1".equals(choice)) {
                displayMenu();
            } else if ("2".equals(choice)) {
                try {
                    System.out.print("Enter Item ID [e.g. F120]: ");
                    String id = scanner.nextLine().trim().toUpperCase();
                    System.out.print("Enter Item Name: ");
                    String name = scanner.nextLine().trim();
                    System.out.print("Enter Price in ₹: ");
                    double price = Double.parseDouble(scanner.nextLine().trim());
                    System.out.print("Enter Category [Breakfast, Snacks, Main Course, etc.]: ");
                    String cat = scanner.nextLine().trim();
                    System.out.print("Is Vegetarian? (true/false): ");
                    boolean isVeg = Boolean.parseBoolean(scanner.nextLine().trim());
                    System.out.print("Prep time in minutes: ");
                    int prep = Integer.parseInt(scanner.nextLine().trim());
                    System.out.print("Initial stock quantity: ");
                    int stock = Integer.parseInt(scanner.nextLine().trim());

                    FoodItem newItem = new FoodItem(id, name, price, cat, isVeg, prep, true, stock);
                    canteenService.addMenuItem(newItem);
                    System.out.println("Menu item added successfully!");
                } catch (Exception e) {
                    System.out.println("Error adding item: " + e.getMessage());
                }
            } else if ("3".equals(choice)) {
                System.out.print("Enter Item ID: ");
                String id = scanner.nextLine().trim().toUpperCase();
                System.out.print("Enter new price in ₹: ");
                try {
                    double p = Double.parseDouble(scanner.nextLine().trim());
                    if (canteenService.updateItemPrice(id, p)) {
                        System.out.println("Price updated successfully!");
                    } else {
                        System.out.println("Item ID not found.");
                    }
                } catch (NumberFormatException e) {
                    System.out.println("Invalid price value.");
                }
            } else if ("4".equals(choice)) {
                List<Order> all = canteenService.getAllOrders();
                double totalRev = 0;
                int collectedCount = 0;
                for (Order o : all) {
                    if (o.getStatus() == OrderStatus.COLLECTED) {
                        totalRev += o.getTotalAmount();
                        collectedCount++;
                    }
                }
                System.out.println("\n=== SALES & REVENUE REPORT ===");
                System.out.println("Total Orders Placed    : " + all.size());
                System.out.println("Total Orders Collected : " + collectedCount);
                System.out.printf("Net Collected Revenue  : ₹%.2f\n", totalRev);
                if (collectedCount > 0) {
                    System.out.printf("Average Order Value    : ₹%.2f\n", (totalRev / collectedCount));
                }
            } else if ("5".equals(choice)) {
                break;
            }
        }
    }

    private void displayMenu() {
        System.out.println("\n----------------- CANTEEN MENU -----------------");
        for (FoodItem item : canteenService.getAllMenuItems()) {
            System.out.println(item.toString());
        }
        System.out.println("------------------------------------------------");
    }
}

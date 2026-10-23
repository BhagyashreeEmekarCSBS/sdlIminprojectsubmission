import java.util.*;

// Exception handling: custom checked exception
class CanteenException extends Exception {
    CanteenException(String m) { super(m); }
}

enum Status { PLACED, PREPARING, READY, COLLECTED }

// Interfaces
interface Billable { double total(); }
interface Manageable {
    void addItem(MenuItem i);
    void removeItem(int id) throws CanteenException;
}

// Encapsulation + Inheritance + Polymorphism: menu items
abstract class MenuItem {
    private static int counter = 100;
    private final int id = ++counter;
    private final String name;
    private double price;
    private int stock;

    MenuItem(String name, double price, int stock) {
        this.name = name; setPrice(price); setStock(stock);
    }
    int getId() { return id; }
    String getName() { return name; }
    double getPrice() { return price; }
    int getStock() { return stock; }
    void setPrice(double p) { if (p <= 0) throw new IllegalArgumentException("Price must be > 0"); price = p; }
    void setStock(int s) { if (s < 0) throw new IllegalArgumentException("Stock cannot be negative"); stock = s; }
    abstract double finalPrice();   // polymorphic pricing
    abstract String type();
    public String toString() {
        return String.format("%-5d %-16s %-9s Rs.%-7.2f Stock:%d", id, name, type(), finalPrice(), stock);
    }
}
class Beverage extends MenuItem {
    Beverage(String n, double p, int s) { super(n, p, s); }
    double finalPrice() { return getPrice(); }
    String type() { return "Beverage"; }
}
class Snack extends MenuItem {
    Snack(String n, double p, int s) { super(n, p, s); }
    double finalPrice() { return getPrice() + 5; }          // packing charge
    String type() { return "Snack"; }
}
class Meal extends MenuItem {
    Meal(String n, double p, int s) { super(n, p, s); }
    double finalPrice() { return getPrice() * 1.05; }       // 5% GST
    String type() { return "Meal"; }
}

// Inheritance + Polymorphism: users
abstract class User {
    private final String name;
    User(String name) { this.name = name; }
    String getName() { return name; }
    abstract String role();
}
class Student extends User {
    Student(String n) { super(n); }
    String role() { return "Student"; }
}
class Admin extends User {
    Admin(String n) { super(n); }
    String role() { return "Staff"; }
}

// Order implements Billable
class Order implements Billable {
    private static int counter = 0;
    private final int token = ++counter;
    private final Student student;
    private final Map<MenuItem, Integer> items = new LinkedHashMap<>();
    private Status status = Status.PLACED;

    Order(Student s) { student = s; }
    int getToken() { return token; }
    Student getStudent() { return student; }
    Status getStatus() { return status; }
    void add(MenuItem m, int qty) { items.put(m, qty); }

    public double total() {
        double t = 0;
        for (Map.Entry<MenuItem, Integer> e : items.entrySet()) t += e.getKey().finalPrice() * e.getValue();
        return t;
    }
    void advance() throws CanteenException {   // PLACED -> PREPARING -> READY -> COLLECTED
        if (status == Status.COLLECTED) throw new CanteenException("Order already collected");
        status = Status.values()[status.ordinal() + 1];
    }
    void bill() {
        System.out.println("\n===== BILL | Token #" + token + " | " + student.getName() + " =====");
        for (Map.Entry<MenuItem, Integer> e : items.entrySet())
            System.out.printf("%-16s %d x %.2f = %.2f%n", e.getKey().getName(), e.getValue(),
                    e.getKey().finalPrice(), e.getKey().finalPrice() * e.getValue());
        System.out.printf("TOTAL: Rs. %.2f | Status: %s%n", total(), status);
    }
}

// Collections: Map for menu and orders
class Canteen implements Manageable {
    private final Map<Integer, MenuItem> menu = new LinkedHashMap<>();
    private final Map<Integer, Order> orders = new TreeMap<>();

    public void addItem(MenuItem i) { menu.put(i.getId(), i); }
    public void removeItem(int id) throws CanteenException { find(id); menu.remove(id); }

    MenuItem find(int id) throws CanteenException {
        MenuItem m = menu.get(id);
        if (m == null) throw new CanteenException("No item with ID " + id);
        return m;
    }
    Order order(int token) throws CanteenException {
        Order o = orders.get(token);
        if (o == null) throw new CanteenException("No order with token #" + token);
        return o;
    }
    void showMenu() { menu.values().forEach(System.out::println); }
    Collection<Order> allOrders() { return orders.values(); }

    Order placeOrder(Student s, Map<Integer, Integer> cart) throws CanteenException {
        if (cart.isEmpty()) throw new CanteenException("Cart is empty");
        for (Map.Entry<Integer, Integer> e : cart.entrySet()) {      // validate first
            MenuItem m = find(e.getKey());
            if (e.getValue() <= 0) throw new CanteenException("Invalid quantity for " + m.getName());
            if (e.getValue() > m.getStock())
                throw new CanteenException("Only " + m.getStock() + " left for " + m.getName());
        }
        Order o = new Order(s);                                       // then commit
        for (Map.Entry<Integer, Integer> e : cart.entrySet()) {
            MenuItem m = menu.get(e.getKey());
            m.setStock(m.getStock() - e.getValue());
            o.add(m, e.getValue());
        }
        orders.put(o.getToken(), o);
        return o;
    }
}

public class SmartCanteen {
    static final Canteen canteen = new Canteen();
    static final Scanner sc = new Scanner(System.in);

    static int readInt(String p) {
        while (true) {
            System.out.print(p);
            try { return Integer.parseInt(sc.nextLine().trim()); }
            catch (NumberFormatException e) { System.out.println("Enter a valid number."); }
        }
    }

    public static void main(String[] args) {
        canteen.addItem(new Beverage("Tea", 10, 50));
        canteen.addItem(new Beverage("Cold Coffee", 40, 20));
        canteen.addItem(new Snack("Samosa", 15, 40));
        canteen.addItem(new Snack("Sandwich", 35, 25));
        canteen.addItem(new Meal("Veg Thali", 80, 30));
        while (true) {
            int ch = readInt("\n1.Student 2.Staff 0.Exit: ");
            if (ch == 0) break;
            if (ch == 1) student(); else if (ch == 2) admin(); else System.out.println("Invalid choice.");
        }
    }

    static void student() {
        System.out.print("Your name: ");
        Student s = new Student(sc.nextLine().trim());
        Map<Integer, Integer> cart = new LinkedHashMap<>();
        while (true) {
            int ch = readInt("\n[" + s.role() + "] 1.Menu 2.Add to cart 3.Place order 4.Track 0.Back: ");
            try {
                switch (ch) {
                    case 1: canteen.showMenu(); break;
                    case 2: {
                        MenuItem m = canteen.find(readInt("Item ID: "));
                        cart.merge(m.getId(), readInt("Qty: "), Integer::sum);
                        System.out.println("Added " + m.getName()); break;
                    }
                    case 3: { Order o = canteen.placeOrder(s, cart); cart.clear(); o.bill(); break; }
                    case 4: { Order o = canteen.order(readInt("Token: ")); System.out.println("Token #" + o.getToken() + " -> " + o.getStatus()); break; }
                    case 0: return;
                    default: System.out.println("Invalid choice.");
                }
            } catch (CanteenException e) { System.out.println("Error: " + e.getMessage()); }
        }
    }

    static void admin() {
        System.out.print("Password: ");
        if (!sc.nextLine().equals("admin123")) { System.out.println("Wrong password."); return; }
        User a = new Admin("Staff");
        while (true) {
            int ch = readInt("\n[" + a.role() + "] 1.Menu 2.Add item 3.Remove item 4.Orders 5.Advance status 0.Back: ");
            try {
                switch (ch) {
                    case 1: canteen.showMenu(); break;
                    case 2: {
                        int t = readInt("Type (1 Beverage, 2 Snack, 3 Meal): ");
                        System.out.print("Name: "); String n = sc.nextLine().trim();
                        int p = readInt("Price: "), st = readInt("Stock: ");
                        if (t == 1) canteen.addItem(new Beverage(n, p, st));
                        else if (t == 2) canteen.addItem(new Snack(n, p, st));
                        else if (t == 3) canteen.addItem(new Meal(n, p, st));
                        else System.out.println("Unknown type.");
                        break;
                    }
                    case 3: canteen.removeItem(readInt("Item ID: ")); System.out.println("Removed."); break;
                    case 4:
                        for (Order o : canteen.allOrders())
                            System.out.printf("Token #%d | %s | Rs.%.2f | %s%n", o.getToken(), o.getStudent().getName(), o.total(), o.getStatus());
                        break;
                    case 5: { Order o = canteen.order(readInt("Token: ")); o.advance(); System.out.println("Now: " + o.getStatus()); break; }
                    case 0: return;
                    default: System.out.println("Invalid choice.");
                }
            } catch (CanteenException | IllegalArgumentException e) { System.out.println("Error: " + e.getMessage()); }
        }
    }
}
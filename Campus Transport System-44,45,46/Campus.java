package project;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Scanner;

/**
 * Campus Transport Management System.
 * Paste this one file into package "project" in Eclipse and run Campus.
 *
 * Students : search routes, register, book/cancel seats, get a pass.
 * Admins   : manage buses, drivers, routes, schedules and assignments.
 */
public class Campus {
    private static final Scanner SCANNER = new Scanner(System.in);
    private static final TransportManager MANAGER = new TransportManager();

    public static void main(String[] args) {
        MANAGER.loadSampleData();
        System.out.println("========================================");
        System.out.println("   CAMPUS TRANSPORT MANAGEMENT SYSTEM");
        System.out.println("========================================");

        boolean running = true;
        while (running) {
            System.out.println("\n--------------- MAIN MENU ---------------");
            System.out.println(" 1. Student portal");
            System.out.println(" 2. Admin portal");
            System.out.println(" 0. Exit");
            System.out.println("-----------------------------------------");
            int choice = readInt("Choose an option: ");
            System.out.println();
            switch (choice) {
                case 1:
                    studentPortal();
                    break;
                case 2:
                    adminPortal();
                    break;
                case 0:
                    running = false;
                    System.out.println("Thank you for using the system.");
                    break;
                default:
                    System.out.println("Invalid option. Please try again.");
            }
        }
        SCANNER.close();
    }

    // ===================== STUDENT PORTAL =====================

    private static void studentPortal() {
        boolean back = false;
        while (!back) {
            System.out.println("\n------------- STUDENT PORTAL -------------");
            System.out.println(" 1. Register student");
            System.out.println(" 2. Search routes");
            System.out.println(" 3. View all routes");
            System.out.println(" 4. Book bus seat");
            System.out.println(" 5. Cancel seat booking");
            System.out.println(" 6. Generate student pass");
            System.out.println(" 7. View my details");
            System.out.println(" 0. Back");
            System.out.println("-----------------------------------------");
            int choice = readInt("Choose an option: ");
            System.out.println();
            switch (choice) {
                case 1:
                    addStudent();
                    break;
                case 2:
                    searchRoutes();
                    break;
                case 3:
                    MANAGER.displayRoutes();
                    break;
                case 4:
                    bookSeat();
                    break;
                case 5:
                    cancelSeat();
                    break;
                case 6:
                    issuePass();
                    break;
                case 7:
                    searchStudent();
                    break;
                case 0:
                    back = true;
                    break;
                default:
                    System.out.println("Invalid option. Please try again.");
            }
        }
    }

    // ===================== ADMIN PORTAL =====================

    private static void adminPortal() {
        String adminId = readText("Admin ID: ");
        Admin admin = MANAGER.findAdmin(adminId);
        if (admin == null) {
            System.out.println("Access denied. Admin not found.");
            return;
        }
        System.out.println("Welcome, " + admin.getName() + " (" + admin.getDesignation() + ").");

        boolean back = false;
        while (!back) {
            System.out.println("\n-------------- ADMIN PORTAL --------------");
            System.out.println(" 1. Add driver");
            System.out.println(" 2. Add bus");
            System.out.println(" 3. Add route");
            System.out.println(" 4. Assign bus and driver to route");
            System.out.println(" 5. Update route schedule");
            System.out.println(" 6. View all students");
            System.out.println(" 7. View all drivers");
            System.out.println(" 8. View all buses");
            System.out.println(" 9. View all routes");
            System.out.println("10. View all student passes");
            System.out.println(" 0. Back");
            System.out.println("-----------------------------------------");
            int choice = readInt("Choose an option: ");
            System.out.println();
            switch (choice) {
                case 1:
                    addDriver();
                    break;
                case 2:
                    addBus();
                    break;
                case 3:
                    addRoute();
                    break;
                case 4:
                    assignBusToRoute();
                    break;
                case 5:
                    updateSchedule();
                    break;
                case 6:
                    MANAGER.displayPeople(MANAGER.getStudents(), "STUDENTS");
                    break;
                case 7:
                    MANAGER.displayPeople(MANAGER.getDrivers(), "DRIVERS");
                    break;
                case 8:
                    MANAGER.displayBuses();
                    break;
                case 9:
                    MANAGER.displayRoutes();
                    break;
                case 10:
                    MANAGER.displayPasses();
                    break;
                case 0:
                    back = true;
                    break;
                default:
                    System.out.println("Invalid option. Please try again.");
            }
        }
    }

    // ===================== ACTIONS =====================

    private static void addStudent() {
        System.out.println("--- Register Student ---");
        String id = readText("Student ID: ");
        if (MANAGER.findStudent(id) != null) {
            System.out.println("A student with this ID already exists.");
            return;
        }
        String name = readText("Name: ");
        String phone = readText("Phone: ");
        String department = readText("Department: ");
        int year = readPositiveInt("Year of study: ");
        MANAGER.addStudent(new Student(id, name, phone, department, year));
        System.out.println("Student registered successfully.");
    }

    private static void addDriver() {
        System.out.println("--- Add Driver ---");
        String id = readText("Driver ID: ");
        if (MANAGER.findDriver(id) != null) {
            System.out.println("A driver with this ID already exists.");
            return;
        }
        String name = readText("Name: ");
        String phone = readText("Phone: ");
        String license = readText("Driving licence number: ");
        int experience = readPositiveInt("Experience in years: ");
        MANAGER.addDriver(new Driver(id, name, phone, license, experience));
        System.out.println("Driver added successfully.");
    }

    private static void addBus() {
        System.out.println("--- Add Bus ---");
        String number = readText("Bus number: ");
        if (MANAGER.findBus(number) != null) {
            System.out.println("A bus with this number already exists.");
            return;
        }
        String model = readText("Bus model: ");
        int seats = readPositiveInt("Total seats: ");
        MANAGER.addBus(new Bus(number, model, seats));
        System.out.println("Bus added successfully.");
    }

    private static void addRoute() {
        System.out.println("--- Add Route ---");
        String id = readText("Route ID: ");
        if (MANAGER.findRoute(id) != null) {
            System.out.println("A route with this ID already exists.");
            return;
        }
        String source = readText("Starting point: ");
        String destination = readText("Destination: ");
        double distance = readPositiveDouble("Distance in km: ");
        double fare = readPositiveDouble("Monthly fare: ");
        String time = readText("Departure time (e.g. 08:00 AM): ");
        MANAGER.addRoute(new Route(id, source, destination, distance, fare, time));
        System.out.println("Route added successfully.");
    }

    private static void assignBusToRoute() {
        System.out.println("--- Assign Bus and Driver ---");
        String routeId = readText("Route ID: ");
        String busNumber = readText("Bus number: ");
        String driverId = readText("Driver ID: ");
        System.out.println(MANAGER.assignBusAndDriver(routeId, busNumber, driverId));
    }

    private static void updateSchedule() {
        System.out.println("--- Update Route Schedule ---");
        String routeId = readText("Route ID: ");
        String time = readText("New departure time (e.g. 08:00 AM): ");
        System.out.println(MANAGER.updateSchedule(routeId, time));
    }

    private static void searchRoutes() {
        System.out.println("--- Search Routes ---");
        String keyword = readText("Enter starting point or destination: ");
        System.out.println(MANAGER.searchRoutes(keyword));
    }

    private static void bookSeat() {
        System.out.println("--- Book Seat ---");
        String studentId = readText("Student ID: ");
        String busNumber = readText("Bus number: ");
        System.out.println(MANAGER.bookSeat(studentId, busNumber));
    }

    private static void cancelSeat() {
        System.out.println("--- Cancel Booking ---");
        String studentId = readText("Student ID: ");
        String busNumber = readText("Bus number: ");
        System.out.println(MANAGER.cancelBooking(studentId, busNumber));
    }

    private static void issuePass() {
        System.out.println("--- Generate Student Pass ---");
        String studentId = readText("Student ID: ");
        String routeId = readText("Route ID: ");
        System.out.println(MANAGER.generatePass(studentId, routeId));
    }

    private static void searchStudent() {
        String id = readText("Student ID: ");
        Student student = MANAGER.findStudent(id);
        System.out.println(student == null ? "Student not found." : student.getDetails());
    }

    // ===================== INPUT HELPERS =====================

    private static String readText(String prompt) {
        System.out.print(prompt);
        String value = SCANNER.nextLine().trim();
        while (value.isEmpty()) {
            System.out.print("This field cannot be empty. " + prompt);
            value = SCANNER.nextLine().trim();
        }
        return value;
    }

    private static int readInt(String prompt) {
        while (true) {
            System.out.print(prompt);
            try {
                return Integer.parseInt(SCANNER.nextLine().trim());
            } catch (NumberFormatException ex) {
                System.out.println("Enter a valid whole number.");
            }
        }
    }

    private static int readPositiveInt(String prompt) {
        int value;
        do {
            value = readInt(prompt);
            if (value <= 0)
                System.out.println("Value must be greater than zero.");
        } while (value <= 0);
        return value;
    }

    private static double readPositiveDouble(String prompt) {
        while (true) {
            System.out.print(prompt);
            try {
                double value = Double.parseDouble(SCANNER.nextLine().trim());
                if (value > 0)
                    return value;
                System.out.println("Value must be greater than zero.");
            } catch (NumberFormatException ex) {
                System.out.println("Enter a valid number.");
            }
        }
    }
}

// Abstract class: common parent for all people in the system.
abstract class Person {
    private final String id;
    private final String name;
    private final String phone;

    public Person(String id, String name, String phone) {
        this.id = id;
        this.name = name;
        this.phone = phone;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getPhone() {
        return phone;
    }

    public abstract String getRole();

    public abstract String getDetails();

    @Override
    public String toString() {
        return getDetails();
    }
}

class Student extends Person {
    private final String department;
    private final int year;
    private String bookedBusNumber;

    public Student(String id, String name, String phone, String department, int year) {
        super(id, name, phone);
        this.department = department;
        this.year = year;
    }

    public String getDepartment() {
        return department;
    }

    public int getYear() {
        return year;
    }

    public String getBookedBusNumber() {
        return bookedBusNumber;
    }

    public void setBookedBusNumber(String bookedBusNumber) {
        this.bookedBusNumber = bookedBusNumber;
    }

    @Override
    public String getRole() {
        return "Student";
    }

    @Override
    public String getDetails() {
        return "Student [ID=" + getId() + ", Name=" + getName() + ", Phone=" + getPhone()
                + ", Department=" + department + ", Year=" + year + ", Bus="
                + (bookedBusNumber == null ? "Not booked" : bookedBusNumber) + "]";
    }
}

class Driver extends Person {
    private final String licenceNumber;
    private final int experienceYears;

    public Driver(String id, String name, String phone, String licenceNumber, int experienceYears) {
        super(id, name, phone);
        this.licenceNumber = licenceNumber;
        this.experienceYears = experienceYears;
    }

    @Override
    public String getRole() {
        return "Driver";
    }

    @Override
    public String getDetails() {
        return "Driver [ID=" + getId() + ", Name=" + getName() + ", Phone=" + getPhone()
                + ", Licence=" + licenceNumber + ", Experience=" + experienceYears + " years]";
    }
}

class Admin extends Person {
    private final String designation;

    public Admin(String id, String name, String phone, String designation) {
        super(id, name, phone);
        this.designation = designation;
    }

    public String getDesignation() {
        return designation;
    }

    @Override
    public String getRole() {
        return "Admin";
    }

    @Override
    public String getDetails() {
        return "Admin [ID=" + getId() + ", Name=" + getName() + ", Designation=" + designation + "]";
    }
}

// Interface: defines the transport operations implemented by TransportManager.
interface TransportService {
    void addStudent(Student student);

    void addDriver(Driver driver);

    void addBus(Bus bus);

    void addRoute(Route route);

    String searchRoutes(String keyword);

    String bookSeat(String studentId, String busNumber);

    String cancelBooking(String studentId, String busNumber);

    String generatePass(String studentId, String routeId);
}

class Bus {
    private final String busNumber;
    private final String model;
    private final int totalSeats;
    private final ArrayList<String> bookedStudentIds = new ArrayList<String>();
    private Driver driver;
    private Route route;

    public Bus(String busNumber, String model, int totalSeats) {
        this.busNumber = busNumber;
        this.model = model;
        this.totalSeats = totalSeats;
    }

    public String getBusNumber() {
        return busNumber;
    }

    public int getAvailableSeats() {
        return totalSeats - bookedStudentIds.size();
    }

    public Route getRoute() {
        return route;
    }

    public void setDriver(Driver driver) {
        this.driver = driver;
    }

    public void setRoute(Route route) {
        this.route = route;
    }

    public boolean bookSeat(String studentId) {
        if (getAvailableSeats() == 0 || bookedStudentIds.contains(studentId))
            return false;
        bookedStudentIds.add(studentId);
        return true;
    }

    public boolean cancelSeat(String studentId) {
        return bookedStudentIds.remove(studentId);
    }

    @Override
    public String toString() {
        return "Bus [Number=" + busNumber + ", Model=" + model + ", Seats=" + getAvailableSeats() + "/" + totalSeats
                + ", Driver=" + (driver == null ? "Not assigned" : driver.getName())
                + ", Route=" + (route == null ? "Not assigned" : route.getRouteId()) + "]";
    }
}

class Route {
    private final String routeId;
    private final String source;
    private final String destination;
    private final double distanceKm;
    private final double monthlyFare;
    private String departureTime;

    public Route(String routeId, String source, String destination, double distanceKm, double monthlyFare,
            String departureTime) {
        this.routeId = routeId;
        this.source = source;
        this.destination = destination;
        this.distanceKm = distanceKm;
        this.monthlyFare = monthlyFare;
        this.departureTime = departureTime;
    }

    public String getRouteId() {
        return routeId;
    }

    public double getMonthlyFare() {
        return monthlyFare;
    }

    public void setDepartureTime(String departureTime) {
        this.departureTime = departureTime;
    }

    public boolean matches(String keyword) {
        String key = keyword.toLowerCase();
        return source.toLowerCase().contains(key) || destination.toLowerCase().contains(key);
    }

    @Override
    public String toString() {
        return "Route [ID=" + routeId + ", " + source + " -> " + destination + ", Distance=" + distanceKm
                + " km, Fare=Rs. " + String.format("%.2f", monthlyFare) + ", Departure=" + departureTime + "]";
    }
}

class StudentPass {
    private final String passId;
    private final Student student;
    private final Route route;
    private final LocalDate issueDate;
    private final LocalDate expiryDate;

    public StudentPass(String passId, Student student, Route route) {
        this.passId = passId;
        this.student = student;
        this.route = route;
        issueDate = LocalDate.now();
        expiryDate = issueDate.plusMonths(1);
    }

    public String getStudentId() {
        return student.getId();
    }

    public boolean isExpired() {
        return LocalDate.now().isAfter(expiryDate);
    }

    @Override
    public String toString() {
        DateTimeFormatter format = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        return "Pass [ID=" + passId + ", Student=" + student.getName() + " (" + student.getId() + ")"
                + ", Route=" + route.getRouteId() + ", Fee=Rs. " + String.format("%.2f", route.getMonthlyFare())
                + ", Issued=" + issueDate.format(format) + ", Expires=" + expiryDate.format(format) + "]";
    }
}

class TransportManager implements TransportService {
    private final ArrayList<Student> students = new ArrayList<Student>();
    private final ArrayList<Driver> drivers = new ArrayList<Driver>();
    private final ArrayList<Admin> admins = new ArrayList<Admin>();
    private final ArrayList<Bus> buses = new ArrayList<Bus>();
    private final ArrayList<Route> routes = new ArrayList<Route>();
    private final ArrayList<StudentPass> passes = new ArrayList<StudentPass>();
    private int nextPassNumber = 1;

    @Override
    public void addStudent(Student student) {
        students.add(student);
    }

    @Override
    public void addDriver(Driver driver) {
        drivers.add(driver);
    }

    public void addAdmin(Admin admin) {
        admins.add(admin);
    }

    @Override
    public void addBus(Bus bus) {
        buses.add(bus);
    }

    @Override
    public void addRoute(Route route) {
        routes.add(route);
    }

    public ArrayList<Student> getStudents() {
        return students;
    }

    public ArrayList<Driver> getDrivers() {
        return drivers;
    }

    public Student findStudent(String id) {
        for (Student s : students)
            if (s.getId().equalsIgnoreCase(id))
                return s;
        return null;
    }

    public Driver findDriver(String id) {
        for (Driver d : drivers)
            if (d.getId().equalsIgnoreCase(id))
                return d;
        return null;
    }

    public Admin findAdmin(String id) {
        for (Admin a : admins)
            if (a.getId().equalsIgnoreCase(id))
                return a;
        return null;
    }

    public Bus findBus(String number) {
        for (Bus b : buses)
            if (b.getBusNumber().equalsIgnoreCase(number))
                return b;
        return null;
    }

    public Route findRoute(String id) {
        for (Route r : routes)
            if (r.getRouteId().equalsIgnoreCase(id))
                return r;
        return null;
    }

    public String assignBusAndDriver(String routeId, String busNumber, String driverId) {
        Route route = findRoute(routeId);
        Bus bus = findBus(busNumber);
        Driver driver = findDriver(driverId);
        if (route == null)
            return "Route not found.";
        if (bus == null)
            return "Bus not found.";
        if (driver == null)
            return "Driver not found.";
        bus.setRoute(route);
        bus.setDriver(driver);
        return "Bus " + bus.getBusNumber() + " and driver " + driver.getName() + " assigned to route "
                + route.getRouteId() + ".";
    }

    public String updateSchedule(String routeId, String time) {
        Route route = findRoute(routeId);
        if (route == null)
            return "Route not found.";
        route.setDepartureTime(time);
        return "Schedule updated for route " + route.getRouteId() + ".";
    }

    // Students search routes by starting point or destination.
    @Override
    public String searchRoutes(String keyword) {
        StringBuilder result = new StringBuilder();
        for (Route route : routes) {
            if (!route.matches(keyword))
                continue;
            result.append(route).append("\n");
            boolean busFound = false;
            for (Bus bus : buses) {
                if (bus.getRoute() == route) {
                    result.append("    ").append(bus).append("\n");
                    busFound = true;
                }
            }
            if (!busFound)
                result.append("    No bus assigned yet.\n");
        }
        return result.length() == 0 ? "No routes found for \"" + keyword + "\"." : result.toString().trim();
    }

    @Override
    public String bookSeat(String studentId, String busNumber) {
        Student student = findStudent(studentId);
        Bus bus = findBus(busNumber);
        if (student == null)
            return "Student not found.";
        if (bus == null)
            return "Bus not found.";
        if (bus.getRoute() == null)
            return "This bus is not assigned to any route yet.";
        if (student.getBookedBusNumber() != null)
            return "Student already has a booking on bus " + student.getBookedBusNumber() + ".";
        // Store the real ID (not the typed text) so lookups are never case-sensitive.
        if (!bus.bookSeat(student.getId()))
            return "Booking failed: bus is full or seat is already booked.";
        student.setBookedBusNumber(bus.getBusNumber());
        return "Seat booked successfully for " + student.getName() + " on bus " + bus.getBusNumber() + ".";
    }

    @Override
    public String cancelBooking(String studentId, String busNumber) {
        Student student = findStudent(studentId);
        Bus bus = findBus(busNumber);
        if (student == null || bus == null)
            return "Student or bus not found.";
        if (!bus.cancelSeat(student.getId()))
            return "No booking found for this student on this bus.";
        student.setBookedBusNumber(null);
        return "Booking cancelled successfully.";
    }

    @Override
    public String generatePass(String studentId, String routeId) {
        Student student = findStudent(studentId);
        Route route = findRoute(routeId);
        if (student == null)
            return "Student not found.";
        if (route == null)
            return "Route not found.";
        StudentPass existing = null;
        for (StudentPass pass : passes)
            if (pass.getStudentId().equalsIgnoreCase(student.getId()))
                existing = pass;
        if (existing != null) {
            if (!existing.isExpired())
                return "This student already has an active pass.";
            passes.remove(existing); // expired pass: allow renewal
        }
        StudentPass pass = new StudentPass("PASS-" + nextPassNumber++, student, route);
        passes.add(pass);
        return "Student pass generated successfully: " + pass;
    }

    // Polymorphism: list contains Person references; each subclass supplies its own
    // details.
    public void displayPeople(ArrayList<? extends Person> people, String heading) {
        System.out.println("--- " + heading + " ---");
        if (people.isEmpty()) {
            System.out.println("No records available.");
            return;
        }
        for (Person person : people)
            System.out.println(person.getDetails());
    }

    public void displayBuses() {
        displayList("BUSES", buses);
    }

    public void displayRoutes() {
        displayList("ROUTES", routes);
    }

    public void displayPasses() {
        displayList("STUDENT PASSES", passes);
    }

    private void displayList(String heading, ArrayList<?> list) {
        System.out.println("--- " + heading + " ---");
        if (list.isEmpty()) {
            System.out.println("No records available.");
            return;
        }
        for (Object item : list)
            System.out.println(item);
    }

    public void loadSampleData() {
        addAdmin(new Admin("A101", "Sunita Kulkarni", "9000011111", "Transport Officer"));
        addStudent(new Student("S101", "Aarav Sharma", "9876543210", "Computer Engineering", 2));
        addDriver(new Driver("D101", "Ramesh Patil", "9123456780", "MH12-20120012345", 8));
        addDriver(new Driver("D102", "Suresh Jadhav", "9123456781", "MH12-20100054321", 12));
        addBus(new Bus("MH12AB1234", "Tata Starbus", 40));
        addBus(new Bus("MH12CD5678", "Ashok Leyland Viking", 30));
        addRoute(new Route("R101", "City Centre", "Campus", 18.5, 1200, "07:45 AM"));
        addRoute(new Route("R102", "Railway Station", "Campus", 12.0, 900, "08:15 AM"));
        addRoute(new Route("R103", "Hinjewadi", "Campus", 25.0, 1500, "07:30 AM"));
        assignBusAndDriver("R101", "MH12AB1234", "D101");
        assignBusAndDriver("R102", "MH12CD5678", "D102");
    }
}

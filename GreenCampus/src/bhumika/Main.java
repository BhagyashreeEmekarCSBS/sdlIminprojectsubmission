package bhumika;

import java.util.Scanner;

public class Main {
    static Scanner sc = new Scanner(System.in);
    static WasteManager manager = new WasteManager();
    static String[] locations = {"Library", "Canteen", "Hostel", "Lab"};

    public static void main(String[] args) {
        System.out.println("Welcome to Green Campus Waste Management System");

        // Workers must be added BEFORE loading
        manager.addWorker(new Worker("W301", "Ramesh"));
        manager.addWorker(new Worker("W302", "Suresh"));
        manager.loadFromFile();

        boolean running = true;
        while (running) {
            System.out.println("\n===== MAIN MENU =====");
            System.out.println("1. User");
            System.out.println("2. Admin");
            System.out.println("3. Worker");
            System.out.println("4. Save and Exit");
            int choice = readInt("Enter choice: ");

            switch (choice) {
                case 1: userMenu(); break;
                case 2: adminMenu(); break;
                case 3: workerMenu(); break;
                case 4:
                    manager.saveToFile();
                    System.out.println("Goodbye!");
                    running = false;
                    break;
                default: System.out.println("Invalid choice.");
            }
        }
    }

    // ---------- USER ----------
    static void userMenu() {
        String id = readText("Enter your ID: ");
        String name = readText("Enter your name: ");
        User u = new User(id, name);

        boolean back = false;
        while (!back) {
            System.out.println("\n--- User Menu (" + name + ") ---");
            System.out.println("1. Report waste");
            System.out.println("2. View my reports");
            System.out.println("3. Back");
            int choice = readInt("Enter choice: ");

            switch (choice) {
                case 1: reportWaste(u); break;
                case 2: manager.showReportsByUser(u); break;
                case 3: back = true; break;
                default: System.out.println("Invalid choice.");
            }
        }
    }

    static void reportWaste(User u) {
        System.out.println("Waste type: 1. Recyclable  2. Non-recyclable  3. Organic");
        int type = readInt("Enter type: ");

        System.out.println("Location:");
        for (int i = 0; i < locations.length; i++) {
            System.out.println((i + 1) + ". " + locations[i]);
        }
        int loc = readInt("Enter location: ");

        if (type < 1 || type > 3 || loc < 1 || loc > locations.length) {
            System.out.println("Invalid type or location. Report cancelled.");
            return;
        }

        double qty = readDouble("Quantity in kg: ");
        if (qty <= 0) {
            System.out.println("Quantity must be more than 0. Report cancelled.");
            return;
        }

        String location = locations[loc - 1];
        Waste w;
        if (type == 1) {
            w = new RecyclableWaste(location, qty);
        } else if (type == 2) {
            w = new NonRecyclableWaste(location, qty);
        } else {
            w = new OrganicWaste(location, qty);
        }

        WasteReport r = new WasteReport(u, w);
        manager.addReport(r);
        System.out.println("Report submitted! Your report ID is #" + r.reportId);
    }

    // ---------- ADMIN ----------
    static void adminMenu() {
        boolean back = false;
        while (!back) {
            System.out.println("\n--- Admin Menu ---");
            System.out.println("1. View all reports");
            System.out.println("2. Assign a task to a worker");
            System.out.println("3. Back");
            int choice = readInt("Enter choice: ");

            switch (choice) {
                case 1: manager.showAllReports(); break;
                case 2:
                    manager.showAllReports();
                    int reportId = readInt("Enter report ID: ");
                    System.out.println("Available workers:");
                    manager.showWorkers();
                    String workerId = readText("Enter worker ID: ");
                    manager.assignTask(reportId, workerId);
                    break;
                case 3: back = true; break;
                default: System.out.println("Invalid choice.");
            }
        }
    }

    // ---------- WORKER ----------
    static void workerMenu() {
        String workerId = readText("Enter your worker ID: ");

        boolean back = false;
        while (!back) {
            System.out.println("\n--- Worker Menu ---");
            System.out.println("1. View my tasks");
            System.out.println("2. Mark a task as collected");
            System.out.println("3. Back");
            int choice = readInt("Enter choice: ");

            switch (choice) {
                case 1: manager.showTasksForWorker(workerId); break;
                case 2:
                    int reportId = readInt("Enter report ID: ");
                    manager.completeTask(reportId, workerId);
                    break;
                case 3: back = true; break;
                default: System.out.println("Invalid choice.");
            }
        }
    }

    // ---------- INPUT HELPERS ----------
    static int readInt(String message) {
        while (true) {
            System.out.print(message);
            try {
                return Integer.parseInt(sc.nextLine().trim());
            } catch (NumberFormatException e) {
                System.out.println("Please enter a number.");
            }
        }
    }

    static double readDouble(String message) {
        while (true) {
            System.out.print(message);
            try {
                return Double.parseDouble(sc.nextLine().trim());
            } catch (NumberFormatException e) {
                System.out.println("Please enter a valid number.");
            }
        }
    }

    static String readText(String message) {
        System.out.print(message);
        return sc.nextLine().trim().replace(",", "");
    }
}

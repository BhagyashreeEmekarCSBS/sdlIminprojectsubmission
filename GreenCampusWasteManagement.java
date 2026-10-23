
import java.io.*;
import java.util.*;

// Interface
interface Collectable {
    void updateStatus(String status);
    String getStatus();
}

// Abstract class for people
abstract class Person {
    protected String name;
    protected String id;

    Person(String name, String id) {
        this.name = name;
        this.id = id;
    }

    abstract void showRole();

    public String getName() {
        return name;
    }

    public String getId() {
        return id;
    }
}


class CampusUser extends Person {
    CampusUser(String name, String id) {
        super(name, id);
    }

    @Override
    void showRole() {
        System.out.println("Role: Campus User");
    }
}


class Worker extends Person {
    Worker(String name, String id) {
        super(name, id);
    }

    @Override
    void showRole() {
        System.out.println("Role: Waste Collection Worker");
    }
}


class Admin extends Person {
    Admin(String name, String id) {
        super(name, id);
    }

    @Override
    void showRole() {
        System.out.println("Role: Administrator");
    }
}


abstract class WasteRequest implements Collectable {
    protected int requestId;
    protected String userName;
    protected String location;
    protected String status;
    protected String assignedWorker;

    WasteRequest(int requestId, String userName, String location) {
        this.requestId = requestId;
        this.userName = userName;
        this.location = location;
        this.status = "Pending";
        this.assignedWorker = "Not Assigned";
    }

    
    abstract String getCategory();

    @Override
    public void updateStatus(String status) {
        this.status = status;
    }

    @Override
    public String getStatus() {
        return status;
    }

    public void assignWorker(String workerName) {
        assignedWorker = workerName;
    }

    public int getRequestId() {
        return requestId;
    }

    public String getAssignedWorker() {
        return assignedWorker;
    }

    public void display() {
        System.out.println("\nRequest ID: " + requestId);
        System.out.println("Reported By: " + userName);
        System.out.println("Location: " + location);
        System.out.println("Category: " + getCategory());
        System.out.println("Worker: " + assignedWorker);
        System.out.println("Status: " + status);
    }

    public String toFileString() {
        return requestId + "|" + userName + "|" + location + "|"
                + getCategory() + "|" + assignedWorker + "|" + status;
    }
}

// Polymorphism: different waste categories
class RecyclableWaste extends WasteRequest {
    RecyclableWaste(int id, String user, String location) {
        super(id, user, location);
    }

    @Override
    String getCategory() {
        return "Recyclable";
    }
}

class NonRecyclableWaste extends WasteRequest {
    NonRecyclableWaste(int id, String user, String location) {
        super(id, user, location);
    }

    @Override
    String getCategory() {
        return "Non-Recyclable";
    }
}

class OrganicWaste extends WasteRequest {
    OrganicWaste(int id, String user, String location) {
        super(id, user, location);
    }

    @Override
    String getCategory() {
        return "Organic";
    }
}

// Main application
public class GreenCampusWasteManagement {

    static Scanner sc = new Scanner(System.in);

    // Collections
    static ArrayList<WasteRequest> requests = new ArrayList<>();
    static ArrayList<Worker> workers = new ArrayList<>();

    static final String REQUEST_FILE = "waste_requests.txt";
    static final String WORKER_FILE = "workers.txt";

    static int nextRequestId = 1;

    static Admin admin = new Admin("Campus Admin", "A101");

    public static void main(String[] args) {
        loadWorkers();
        loadRequests();

        // Add default workers if the file is empty
        if (workers.isEmpty()) {
            workers.add(new Worker("Rahul", "W101"));
            workers.add(new Worker("Priya", "W102"));
            saveWorkers();
        }

        System.out.println("==================================");
        System.out.println(" GREEN CAMPUS WASTE MANAGEMENT");
        System.out.println("==================================");

        boolean running = true;

        while (running) {
            System.out.println("\n1. Report Waste");
            System.out.println("2. View All Requests");
            System.out.println("3. Track Request");
            System.out.println("4. Assign Worker (Admin)");
            System.out.println("5. Update Collection Status (Worker)");
            System.out.println("6. View Workers");
            System.out.println("7. Exit");
            System.out.print("Enter your choice: ");

            int choice = readInt();

            switch (choice) {
                case 1:
                    reportWaste();
                    break;
                case 2:
                    viewRequests();
                    break;
                case 3:
                    trackRequest();
                    break;
                case 4:
                    assignWorker();
                    break;
                case 5:
                    updateCollectionStatus();
                    break;
                case 6:
                    viewWorkers();
                    break;
                case 7:
                    saveRequests();
                    saveWorkers();
                    System.out.println("Data saved. Thank you!");
                    running = false;
                    break;
                default:
                    System.out.println("Invalid choice. Try again.");
            }
        }

        sc.close();
    }

    static int readInt() {
        while (!sc.hasNextInt()) {
            System.out.print("Enter a valid number: ");
            sc.nextLine();
        }
        int value = sc.nextInt();
        sc.nextLine();
        return value;
    }

    static String readText(String message) {
        System.out.print(message);
        return sc.nextLine().trim().replace("|", "/");
    }

    // Create a waste collection request
    static void reportWaste() {
        String name = readText("Enter your name: ");
        String location = readText(
                "Enter campus location (e.g. Library): ");

        System.out.println("Select waste category:");
        System.out.println("1. Recyclable");
        System.out.println("2. Non-Recyclable");
        System.out.println("3. Organic");
        System.out.print("Choice: ");

        int category = readInt();

        WasteRequest request;
        int id = nextRequestId++;

        switch (category) {
            case 1:
                request = new RecyclableWaste(id, name, location);
                break;
            case 2:
                request = new NonRecyclableWaste(id, name, location);
                break;
            case 3:
                request = new OrganicWaste(id, name, location);
                break;
            default:
                System.out.println("Invalid category.");
                nextRequestId--;
                return;
        }

        requests.add(request);
        saveRequests();

        System.out.println("Waste reported successfully!");
        System.out.println("Your request ID is: " + id);
    }

    // View every request
    static void viewRequests() {
        if (requests.isEmpty()) {
            System.out.println("No waste requests found.");
            return;
        }

        for (WasteRequest request : requests) {
            request.display();
        }
    }

    // Track a particular request
    static void trackRequest() {
        System.out.print("Enter request ID: ");
        int id = readInt();

        WasteRequest request = findRequest(id);

        if (request == null) {
            System.out.println("Request not found.");
        } else {
            request.display();
        }
    }

    // Admin assigns a worker
    static void assignWorker() {
        admin.showRole();

        if (requests.isEmpty() || workers.isEmpty()) {
            System.out.println("No requests or workers available.");
            return;
        }

        viewRequests();
        viewWorkers();

        System.out.print("Enter request ID: ");
        int id = readInt();

        WasteRequest request = findRequest(id);

        if (request == null) {
            System.out.println("Request not found.");
            return;
        }

        System.out.print("Enter worker ID: ");
        String workerId = sc.nextLine().trim();

        Worker selectedWorker = null;

        for (Worker worker : workers) {
            if (worker.getId().equalsIgnoreCase(workerId)) {
                selectedWorker = worker;
                break;
            }
        }

        if (selectedWorker == null) {
            System.out.println("Worker not found.");
            return;
        }

        request.assignWorker(selectedWorker.getName());
        request.updateStatus("In Progress");

        saveRequests();
        System.out.println("Worker assigned successfully!");
    }

    // Worker updates the task status
    static void updateCollectionStatus() {
        System.out.print("Enter request ID: ");
        int id = readInt();

        WasteRequest request = findRequest(id);

        if (request == null) {
            System.out.println("Request not found.");
            return;
        }

        if (request.getAssignedWorker().equals("Not Assigned")) {
            System.out.println("Assign a worker before updating status.");
            return;
        }

        System.out.println("1. Pending");
        System.out.println("2. In Progress");
        System.out.println("3. Collected");
        System.out.print("Choose new status: ");

        int choice = readInt();
        String status;

        switch (choice) {
            case 1:
                status = "Pending";
                break;
            case 2:
                status = "In Progress";
                break;
            case 3:
                status = "Collected";
                break;
            default:
                System.out.println("Invalid status.");
                return;
        }

        request.updateStatus(status);
        saveRequests();

        System.out.println("Collection status updated successfully!");
    }

    static void viewWorkers() {
        System.out.println("\n--- Available Workers ---");

        for (Worker worker : workers) {
            System.out.println(
                    worker.getId() + " - " + worker.getName());
        }
    }

    static WasteRequest findRequest(int id) {
        for (WasteRequest request : requests) {
            if (request.getRequestId() == id) {
                return request;
            }
        }
        return null;
    }

    // File handling: save requests
    static void saveRequests() {
        try (PrintWriter writer =
                     new PrintWriter(new FileWriter(REQUEST_FILE))) {
            for (WasteRequest request : requests) {
                writer.println(request.toFileString());
            }
        } catch (IOException e) {
            System.out.println("Error saving requests: " + e.getMessage());
        }
    }

    // File handling: load requests
    static void loadRequests() {
        File file = new File(REQUEST_FILE);

        if (!file.exists()) {
            return;
        }

        try (BufferedReader reader =
                     new BufferedReader(new FileReader(file))) {
            String line;

            while ((line = reader.readLine()) != null) {
                String[] data = line.split("\\|", -1);

                if (data.length != 6) {
                    continue;
                }

                int id = Integer.parseInt(data[0]);
                WasteRequest request;

                switch (data[3]) {
                    case "Recyclable":
                        request = new RecyclableWaste(
                                id, data[1], data[2]);
                        break;
                    case "Non-Recyclable":
                        request = new NonRecyclableWaste(
                                id, data[1], data[2]);
                        break;
                    case "Organic":
                        request = new OrganicWaste(
                                id, data[1], data[2]);
                        break;
                    default:
                        continue;
                }

                request.assignWorker(data[4]);
                request.updateStatus(data[5]);
                requests.add(request);

                if (id >= nextRequestId) {
                    nextRequestId = id + 1;
                }
            }
        } catch (IOException | NumberFormatException e) {
            System.out.println("Error loading requests: " + e.getMessage());
        }
    }

    // Add a worker and save the updated worker list.
    // Returns false if the worker ID already exists or input is invalid.
    static boolean addWorker(String name, String id) {
        if (name == null || id == null) {
            return false;
        }

        name = name.trim();
        id = id.trim();

        if (name.isEmpty() || id.isEmpty()
                || name.contains("|") || id.contains("|")) {
            return false;
        }

        for (Worker worker : workers) {
            if (worker.getId().equalsIgnoreCase(id)) {
                return false;
            }
        }

        workers.add(new Worker(name, id));
        saveWorkers();
        return true;
    }

    // Save workers
    static void saveWorkers() {
        try (PrintWriter writer =
                     new PrintWriter(new FileWriter(WORKER_FILE))) {
            for (Worker worker : workers) {
                writer.println(
                        worker.getId() + "|" + worker.getName());
            }
        } catch (IOException e) {
            System.out.println("Error saving workers: " + e.getMessage());
        }
    }

    // Load workers
    static void loadWorkers() {
        File file = new File(WORKER_FILE);

        if (!file.exists()) {
            return;
        }

        try (BufferedReader reader =
                     new BufferedReader(new FileReader(file))) {
            String line;

            while ((line = reader.readLine()) != null) {
                String[] data = line.split("\\|", -1);

                if (data.length == 2) {
                    workers.add(new Worker(data[1], data[0]));
                }
            }
        } catch (IOException e) {
            System.out.println("Error loading workers: " + e.getMessage());
        }
    }
}
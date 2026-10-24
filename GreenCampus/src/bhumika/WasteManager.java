package bhumika;

import java.util.ArrayList;
import java.util.HashMap;
import java.io.*;

public class WasteManager {
    ArrayList<WasteReport> reports = new ArrayList<>();
    HashMap<String, Worker> workers = new HashMap<>();

    void addWorker(Worker w) {
        workers.put(w.id, w);
    }

    void addReport(WasteReport r) {
        reports.add(r);
    }

    void showAllReports() {
        if (reports.isEmpty()) {
            System.out.println("No reports yet.");
            return;
        }
        for (WasteReport r : reports) {
            r.showReport();
        }
    }

    void showReportsByUser(User u) {
        for (WasteReport r : reports) {
            if (r.reportedBy.id.equals(u.id)) {
                r.showReport();
            }
        }
    }

    WasteReport findReport(int id) {
        for (WasteReport r : reports) {
            if (r.reportId == id) {
                return r;
            }
        }
        return null;
    }

    void assignTask(int reportId, String workerId) {
        WasteReport r = findReport(reportId);
        Worker w = workers.get(workerId);

        if (r == null) {
            System.out.println("Report not found.");
            return;
        }
        if (w == null) {
            System.out.println("Worker not found.");
            return;
        }
        r.assignWorker(w);
        System.out.println("Report #" + reportId + " assigned to " + w.name);
    }
    
    void saveToFile() {
        try (PrintWriter pw = new PrintWriter(new FileWriter("reports.txt"))) {
            for (WasteReport r : reports) {
                pw.println(r.toFileString());
            }
            System.out.println("Data saved.");
        } catch (IOException e) {
            System.out.println("Could not save data: " + e.getMessage());
        }
    }

    void loadFromFile() {
        File file = new File("reports.txt");
        if (!file.exists()) {
            System.out.println("No saved data found. Starting fresh.");
            return;
        }

        try (BufferedReader br = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = br.readLine()) != null) {
                String[] p = line.split(",");

                int id = Integer.parseInt(p[0]);
                User u = new User(p[1], p[2]);
                double qty = Double.parseDouble(p[5]);

                Waste w;
                if (p[3].equals("RecyclableWaste")) {
                    w = new RecyclableWaste(p[4], qty);
                } else if (p[3].equals("OrganicWaste")) {
                    w = new OrganicWaste(p[4], qty);
                } else {
                    w = new NonRecyclableWaste(p[4], qty);
                }

                WasteReport r = new WasteReport(id, u, w, p[6]);
                if (!p[7].equals("none")) {
                    r.assignedWorker = workers.get(p[7]);
                }
                reports.add(r);
            }
        } catch (IOException e) {
            System.out.println("Could not read data: " + e.getMessage());
        }
    }
    
    void showWorkers() {
        for (Worker w : workers.values()) {
            System.out.println(w.id + " - " + w.name);
        }
    }

    void showTasksForWorker(String workerId) {
        boolean found = false;
        for (WasteReport r : reports) {
            if (r.assignedWorker != null && r.assignedWorker.id.equals(workerId)) {
                r.showReport();
                found = true;
            }
        }
        if (!found) {
            System.out.println("No tasks assigned.");
        }
    }

    void completeTask(int reportId, String workerId) {
        WasteReport r = findReport(reportId);
        if (r == null || r.assignedWorker == null || !r.assignedWorker.id.equals(workerId)) {
            System.out.println("This task is not assigned to you.");
            return;
        }
        r.updateStatus("Collected");
        System.out.println("Report #" + reportId + " marked as Collected.");
    }
}

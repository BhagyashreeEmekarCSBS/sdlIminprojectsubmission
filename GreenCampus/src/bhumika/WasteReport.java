package bhumika;

public class WasteReport implements Trackable {
    static int counter = 1;   // shared by all reports, used to make IDs

    int reportId;
    User reportedBy;
    Waste waste;
    String status;
    Worker assignedWorker;    // empty (null) until the admin assigns someone

    WasteReport(User reportedBy, Waste waste) {
        this.reportId = counter++;
        this.reportedBy = reportedBy;
        this.waste = waste;
        this.status = "Pending";
    }

    @Override
    public String getStatus() {
        return status;
    }

    @Override
    public void updateStatus(String newStatus) {
        this.status = newStatus;
    }

    void assignWorker(Worker worker) {
        this.assignedWorker = worker;
        this.status = "Assigned";
    }

    void showReport() {
        String workerName = (assignedWorker == null) ? "Not assigned" : assignedWorker.name;
        System.out.println("Report #" + reportId
                + " | By: " + reportedBy.name
                + " | " + waste.getClass().getSimpleName() + " at " + waste.location
                + " | Status: " + status
                + " | Worker: " + workerName);
        
         }
    
    WasteReport(int reportId, User reportedBy, Waste waste, String status) {
        this.reportId = reportId;
        this.reportedBy = reportedBy;
        this.waste = waste;
        this.status = status;
        if (reportId >= counter) {
            counter = reportId + 1;   // new reports continue after the last saved ID
        }
    }
    
    String toFileString() {
        String workerId = (assignedWorker == null) ? "none" : assignedWorker.id;
        return reportId + "," + reportedBy.id + "," + reportedBy.name + ","
                + waste.getClass().getSimpleName() + "," + waste.location + ","
                + waste.quantityKg + "," + status + "," + workerId;
    }
    
}

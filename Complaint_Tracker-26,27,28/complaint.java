
package mini;

public class complaint {

    private int complaintId;
    private campusMember complainant;
    private String category;
    private String description;
    private String department;
    private complaintStatus status;

    public complaint(int complaintId, campusMember complainant,
                     String category, String description,
                     String department) {

        this.complaintId = complaintId;
        this.complainant = complainant;
        this.category = category;
        this.description = description;
        this.department = department;
        this.status = complaintStatus.OPEN;
    }

    public int getComplaintId() {
        return complaintId;
    }

    public campusMember getComplainant() {
        return complainant;
    }

    public String getCategory() {
        return category;
    }

    public String getDescription() {
        return description;
    }

    public String getDepartment() {
        return department;
    }

    public complaintStatus getStatus() {
        return status;
    }

    public void setStatus(complaintStatus status) {
        this.status = status;
    }
}

package CampusLostFound;


import java.time.LocalDate;

public abstract class Item {
    private String itemName;
    private String description;
    private String location;
    private LocalDate date;
    private String reporterName;
    private String contact;
    
    public Item(String itemName, String description,
                String location, LocalDate date,
                String reporterName, String contact) {
        this.itemName = itemName;
        this.description = description;
        this.location = location;
        this.date = date;
        this.reporterName = reporterName;
        this.contact = contact;
    }

    public String getItemName() {
        return itemName;
    }

    public String getDescription() {
        return description;
    }

    public String getLocation() {
        return location;
    }

    public LocalDate getDate() {
        return date;
    }

    public String getReporterName() {
        return reporterName;
    }

    public String getContact() {
        return contact;
    }
}
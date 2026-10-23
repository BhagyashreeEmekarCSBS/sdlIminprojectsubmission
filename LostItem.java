package CampusLostFound;


import java.time.LocalDate;

public class LostItem extends Item implements Reportable {

    public LostItem(String name, String description,
                    String location, LocalDate date,
                    String reporter, String contact) {
        super(name, description, location, date,
              reporter, contact);
    }

    @Override
    public void displayDetails() {
        System.out.println("Type: LOST");
        System.out.println("Item: " + getItemName());
        System.out.println("Description: " + getDescription());
        System.out.println("Location: " + getLocation());
        System.out.println("Date: " + getDate());
        System.out.println("Reported by: " + getReporterName());
    }
}

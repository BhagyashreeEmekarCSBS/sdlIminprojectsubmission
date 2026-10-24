package CampusTransportManagement;

public class Driver extends Person {
    private final String licenseNumber;

    public Driver(String name, String phone, String licenseNumber) {
        super(name, phone);
        this.licenseNumber = licenseNumber;
    }

    public String getLicenseNumber() { return licenseNumber; }

    @Override
    public void displayDetails() {
        System.out.println("Driver: " + name + " | License: "
                + licenseNumber + " | Phone: " + phone);
    }
}

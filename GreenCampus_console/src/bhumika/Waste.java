package bhumika;

public abstract class Waste {
    String location;
    double quantityKg;

    Waste(String location, double quantityKg) {
        this.location = location;
        this.quantityKg = quantityKg;
    }

    // No body here. Each waste type must write its own.
    abstract String getDisposalMethod();

    void showDetails() {
        System.out.println(getClass().getSimpleName() + " | Location: " + location
                + " | Quantity: " + quantityKg + " kg"
                + " | Disposal: " + getDisposalMethod());
    }
}

package bhumika;

public class OrganicWaste extends Waste {

    OrganicWaste(String location, double quantityKg) {
        super(location, quantityKg);
    }

    @Override
    String getDisposalMethod() {
        return "Send to compost unit";
    }
}

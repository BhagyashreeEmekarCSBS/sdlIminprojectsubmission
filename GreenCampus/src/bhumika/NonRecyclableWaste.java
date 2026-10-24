package bhumika;

public class NonRecyclableWaste extends Waste {

    NonRecyclableWaste(String location, double quantityKg) {
        super(location, quantityKg);
    }

    @Override
    String getDisposalMethod() {
        return "Send to landfill";
    }
}

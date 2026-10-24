package bhumika;

public class RecyclableWaste extends Waste {

    RecyclableWaste(String location, double quantityKg) {
        super(location, quantityKg);
    }

    @Override
    String getDisposalMethod() {
        return "Send to recycling plant";
    }
}

public class OrganicWaste extends Waste {
    public OrganicWaste(int id, String loc, String desc, double qty) { super(id, loc, desc, qty); }
    public String getCategory()    { return "Organic"; }
    public String getDisposalTip() { return "Send to the campus compost pit / biogas plant."; }
}

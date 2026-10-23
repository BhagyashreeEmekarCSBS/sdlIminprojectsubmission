public class NonRecyclableWaste extends Waste {
    public NonRecyclableWaste(int id, String loc, String desc, double qty) { super(id, loc, desc, qty); }
    public String getCategory()    { return "Non-Recyclable"; }
    public String getDisposalTip() { return "Dispose at the designated landfill / incineration point."; }
}

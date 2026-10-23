/** Inheritance: Recyclable waste IS-A Waste. */
public class RecyclableWaste extends Waste {
    public RecyclableWaste(int id, String loc, String desc, double qty) { super(id, loc, desc, qty); }
    public String getCategory()    { return "Recyclable"; }
    public String getDisposalTip() { return "Send to the recycling unit (paper, plastic, metal, glass)."; }
}

/** Abstract base class for all waste types (Abstraction). */
public abstract class Waste implements Collectable {
    protected int id;
    protected String location;
    protected String description;
    protected double quantity;                 // in kg
    protected String status = "PENDING";       // PENDING -> ASSIGNED -> COLLECTED
    protected String worker = "-";

    public Waste(int id, String location, String description, double quantity) {
        this.id = id;
        this.location = location;
        this.description = description;
        this.quantity = quantity;
    }

    // Abstract methods: each subclass defines its own behaviour (Polymorphism)
    public abstract String getCategory();
    public abstract String getDisposalTip();

    // Interface methods
    public void assignTo(String worker) { this.worker = worker; this.status = "ASSIGNED"; }
    public void markCollected()         { this.status = "COLLECTED"; }
    public String getStatus()           { return status; }

    public int getId()                  { return id; }
    public double getQuantity()         { return quantity; }
    public void setStatus(String s)     { this.status = s; }
    public void setWorker(String w)     { this.worker = w; }

    /** One line of text for saving to file. */
    public String toFileString() {
        return getCategory() + "|" + id + "|" + location + "|" + description + "|"
                + quantity + "|" + status + "|" + worker;
    }

    @Override
    public String toString() {
        return String.format("%-5d %-14s %-12s %-20s %6.1f kg  %-10s %s",
                id, getCategory(), location, description, quantity, status, worker);
    }
}

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * ABSTRACTION: common blueprint for every kind of campus emergency.
 * Subclasses decide their own category and how severity is classified (POLYMORPHISM).
 * Implements Comparable so incidents can sit in a PriorityQueue (most severe first).
 */
public abstract class Incident implements Comparable<Incident> {

    private static int idCounter = 1000;
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("dd-MMM HH:mm");

    private final int id;
    private final String reporterName;
    private final String location;
    private final String description;
    private final LocalDateTime reportedAt;
    private final Severity severity;
    private Status status;
    private String assignedTeam;
    private int etaMinutes;

    protected Incident(String reporterName, String location, String description) {
        this.id = ++idCounter;
        this.reporterName = reporterName;
        this.location = location;
        this.description = description;
        this.reportedAt = LocalDateTime.now();
        this.status = Status.REPORTED;
        this.assignedTeam = "-";
        this.severity = assessSeverity(); // each subclass classifies in its own way
    }

    /** Category name, e.g. "Medical" or "Fire". */
    public abstract String getCategory();

    /** Classify how serious the incident is, based on the description. */
    protected abstract Severity assessSeverity();

    /** Helper for subclasses: does the description contain any of these keywords? */
    protected boolean containsAny(String... keywords) {
        String text = description.toLowerCase();
        for (String keyword : keywords) {
            if (text.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    // ---------- getters ----------
    public int getId() { return id; }
    public String getReporterName() { return reporterName; }
    public String getLocation() { return location; }
    public String getDescription() { return description; }
    public Severity getSeverity() { return severity; }
    public Status getStatus() { return status; }
    public String getAssignedTeam() { return assignedTeam; }
    public int getEtaMinutes() { return etaMinutes; }
    public String getReportedAtText() { return reportedAt.format(TIME_FORMAT); }

    // ---------- setters (only the mutable parts) ----------
    public void setStatus(Status status) { this.status = status; }
    public void setAssignedTeam(String assignedTeam) { this.assignedTeam = assignedTeam; }
    public void setEtaMinutes(int etaMinutes) { this.etaMinutes = etaMinutes; }

    /** Most severe first; for equal severity, the earlier report comes first. */
    @Override
    public int compareTo(Incident other) {
        int bySeverity = Integer.compare(other.severity.getLevel(), this.severity.getLevel());
        if (bySeverity != 0) {
            return bySeverity;
        }
        return Integer.compare(this.id, other.id);
    }

    @Override
    public String toString() {
        return "#" + id + " [" + getCategory() + "/" + severity.getLabel() + "] at " + location;
    }
}

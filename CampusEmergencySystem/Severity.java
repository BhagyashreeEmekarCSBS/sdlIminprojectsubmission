/**
 * Severity levels used to classify incidents.
 * Higher level = more urgent. Used for priority ordering in the waiting queue.
 */
public enum Severity {
    LOW(1, "LOW"),
    MEDIUM(2, "MEDIUM"),
    HIGH(3, "HIGH"),
    CRITICAL(4, "CRITICAL");

    private final int level;
    private final String label;

    Severity(int level, String label) {
        this.level = level;
        this.label = label;
    }

    public int getLevel() {
        return level;
    }

    public String getLabel() {
        return label;
    }
}

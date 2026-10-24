/**
 * Life-cycle of an incident:
 * REPORTED -> (QUEUED if the team is busy) -> ASSIGNED -> RESOLVED
 */
public enum Status {
    REPORTED("REPORTED"),
    QUEUED("QUEUED"),
    ASSIGNED("ASSIGNED"),
    RESOLVED("RESOLVED");

    private final String label;

    Status(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}

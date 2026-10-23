/** Interface: anything that can be assigned to a worker and collected. */
public interface Collectable {
    void assignTo(String worker);
    void markCollected();
    String getStatus();
}

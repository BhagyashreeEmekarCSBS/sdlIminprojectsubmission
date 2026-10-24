/**
 * INTERFACE: contract that every response team must follow.
 * The manager only talks to this contract, not to concrete team classes.
 */
public interface Responder {

    String getTeamName();

    String getContact();

    /** Can this team handle the given kind of incident? */
    boolean canHandle(Incident incident);

    /** Does the team have free capacity right now? */
    boolean isAvailable();

    /** Assign an incident to this team. */
    void assign(Incident incident) throws NoTeamAvailableException;

    /** Free up capacity once an incident is resolved. */
    void release(Incident incident);

    int getActiveCount();

    int getCapacity();
}

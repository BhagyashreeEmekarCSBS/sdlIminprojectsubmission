import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * ABSTRACTION: partial implementation of Responder.
 * Shared logic (capacity, assigning, releasing) lives here;
 * team-specific details are left abstract for subclasses.
 */
public abstract class ResponseTeam implements Responder {

    private final String teamName;
    private final String contact;
    private final int capacity;
    private final List<Incident> activeIncidents = new ArrayList<>();

    protected ResponseTeam(String teamName, String contact, int capacity) {
        this.teamName = teamName;
        this.contact = contact;
        this.capacity = capacity;
    }

    /** Which incident class does this team respond to? */
    protected abstract Class<? extends Incident> getHandledType();

    /** Estimated time of arrival in minutes (differs per team and severity). */
    public abstract int getEtaMinutes(Severity severity);

    /** Short description of the equipment this team carries. */
    public abstract String getEquipment();

    @Override
    public boolean canHandle(Incident incident) {
        return getHandledType().isInstance(incident);
    }

    @Override
    public boolean isAvailable() {
        return activeIncidents.size() < capacity;
    }

    @Override
    public void assign(Incident incident) throws NoTeamAvailableException {
        if (!canHandle(incident)) {
            throw new NoTeamAvailableException(teamName + " cannot handle " + incident.getCategory() + " incidents");
        }
        if (!isAvailable()) {
            throw new NoTeamAvailableException(teamName + " is at full capacity (" + capacity + "/" + capacity + ")");
        }
        activeIncidents.add(incident);
        incident.setStatus(Status.ASSIGNED);
        incident.setAssignedTeam(teamName);
        incident.setEtaMinutes(getEtaMinutes(incident.getSeverity()));
    }

    @Override
    public void release(Incident incident) {
        activeIncidents.remove(incident);
    }

    @Override
    public String getTeamName() {
        return teamName;
    }

    @Override
    public String getContact() {
        return contact;
    }

    @Override
    public int getActiveCount() {
        return activeIncidents.size();
    }

    @Override
    public int getCapacity() {
        return capacity;
    }

    public List<Incident> getActiveIncidents() {
        return Collections.unmodifiableList(activeIncidents);
    }
}

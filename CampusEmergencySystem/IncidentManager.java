import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.PriorityQueue;

/**
 * Core logic: validates reports, classifies incidents, assigns them to teams,
 * queues them when teams are busy, and re-dispatches when capacity frees up.
 *
 * COLLECTIONS used:
 *  - LinkedHashMap<Integer, Incident> : all incidents by ID (keeps report order)
 *  - PriorityQueue<Incident>          : waiting incidents, most severe first
 *  - ArrayList<ResponseTeam>          : available response teams
 *  - EnumMap / LinkedHashMap          : statistics
 */
public class IncidentManager {

    private final Map<Integer, Incident> allIncidents = new LinkedHashMap<>();
    private final PriorityQueue<Incident> waitingQueue = new PriorityQueue<>();
    private final List<ResponseTeam> teams = new ArrayList<>();

    public IncidentManager() {
        teams.add(new MedicalTeam(2));
        teams.add(new FireSafetyTeam(1));
        teams.add(new SecurityTeam(2));
        teams.add(new MaintenanceTeam(2));
    }

    // ------------------------------------------------------------------
    // Reporting
    // ------------------------------------------------------------------

    public Incident report(int category, String reporter, String location, String description)
            throws InvalidIncidentException {

        requireText(reporter, "Reporter name", 2);
        requireText(location, "Location", 2);
        requireText(description, "Description", 5);

        Incident incident = createIncident(category, reporter.trim(), location.trim(), description.trim());
        allIncidents.put(incident.getId(), incident);

        try {
            dispatch(incident);
        } catch (NoTeamAvailableException e) {
            incident.setStatus(Status.QUEUED);
            waitingQueue.add(incident);
        }
        return incident;
    }

    private void requireText(String value, String field, int minLength) throws InvalidIncidentException {
        if (value == null || value.trim().length() < minLength) {
            throw new InvalidIncidentException(field + " must have at least " + minLength + " characters.");
        }
    }

    /** Factory method: picks the right Incident subclass (polymorphism). */
    private Incident createIncident(int category, String reporter, String location, String description)
            throws InvalidIncidentException {
        switch (category) {
            case 1: return new MedicalIncident(reporter, location, description);
            case 2: return new FireIncident(reporter, location, description);
            case 3: return new SecurityIncident(reporter, location, description);
            case 4: return new InfrastructureIncident(reporter, location, description);
            default: throw new InvalidIncidentException("Unknown incident category: " + category);
        }
    }

    private void dispatch(Incident incident) throws NoTeamAvailableException {
        for (ResponseTeam team : teams) {
            if (team.canHandle(incident)) {
                team.assign(incident); // throws if the team is full
                return;
            }
        }
        throw new NoTeamAvailableException("No team configured for " + incident.getCategory() + " incidents");
    }

    // ------------------------------------------------------------------
    // Resolving
    // ------------------------------------------------------------------

    /**
     * Marks an incident resolved and returns the list of queued incidents
     * that were automatically dispatched because capacity became free.
     */
    public List<Incident> resolve(int id) throws IncidentNotFoundException, InvalidIncidentException {
        Incident incident = findById(id);

        if (incident.getStatus() == Status.RESOLVED) {
            throw new InvalidIncidentException("Incident #" + id + " is already resolved.");
        }

        if (incident.getStatus() == Status.QUEUED) {
            waitingQueue.remove(incident);
        } else {
            for (ResponseTeam team : teams) {
                if (team.getTeamName().equals(incident.getAssignedTeam())) {
                    team.release(incident);
                }
            }
        }
        incident.setStatus(Status.RESOLVED);
        return processQueue();
    }

    private List<Incident> processQueue() {
        List<Incident> dispatched = new ArrayList<>();
        List<Incident> stillWaiting = new ArrayList<>();

        while (!waitingQueue.isEmpty()) {
            Incident next = waitingQueue.poll(); // most severe first
            try {
                dispatch(next);
                dispatched.add(next);
            } catch (NoTeamAvailableException e) {
                stillWaiting.add(next);
            }
        }
        waitingQueue.addAll(stillWaiting);
        return dispatched;
    }

    // ------------------------------------------------------------------
    // Queries
    // ------------------------------------------------------------------

    public Incident findById(int id) throws IncidentNotFoundException {
        Incident incident = allIncidents.get(id);
        if (incident == null) {
            throw new IncidentNotFoundException(id);
        }
        return incident;
    }

    public Collection<Incident> getAllIncidents() {
        return Collections.unmodifiableCollection(allIncidents.values());
    }

    public List<Incident> getWaitingQueue() {
        List<Incident> copy = new ArrayList<>(waitingQueue);
        Collections.sort(copy); // PriorityQueue iteration order is not sorted
        return copy;
    }

    public List<ResponseTeam> getTeams() {
        return Collections.unmodifiableList(teams);
    }

    public Map<Severity, Integer> countBySeverity() {
        Map<Severity, Integer> counts = new EnumMap<>(Severity.class);
        for (Severity s : Severity.values()) {
            counts.put(s, 0);
        }
        for (Incident i : allIncidents.values()) {
            counts.merge(i.getSeverity(), 1, Integer::sum);
        }
        return counts;
    }

    public Map<String, Integer> countByCategory() {
        Map<String, Integer> counts = new LinkedHashMap<>();
        counts.put("Medical", 0);
        counts.put("Fire", 0);
        counts.put("Security", 0);
        counts.put("Infrastructure", 0);
        for (Incident i : allIncidents.values()) {
            counts.merge(i.getCategory(), 1, Integer::sum);
        }
        return counts;
    }

    public int countByStatus(Status status) {
        int count = 0;
        for (Incident i : allIncidents.values()) {
            if (i.getStatus() == status) {
                count++;
            }
        }
        return count;
    }
}

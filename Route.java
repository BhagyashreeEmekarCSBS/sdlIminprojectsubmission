package CampusTransportManagement;

public class Route {
    private final String routeId;
    private final String source;
    private final String destination;
    private final String departureTime;

    public Route(String routeId, String source, String destination, String departureTime) {
        this.routeId = routeId;
        this.source = source;
        this.destination = destination;
        this.departureTime = departureTime;
    }

    public String getRouteId() { return routeId; }
    public String getSource() { return source; }
    public String getDestination() { return destination; }
    public String getDepartureTime() { return departureTime; }

    @Override
    public String toString() {
        return routeId + ": " + source + " → " + destination + " (" + departureTime + ")";
    }
}

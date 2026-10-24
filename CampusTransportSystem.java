package CampusTransportManagement;

import java.util.ArrayList;

public class CampusTransportSystem implements TransportService {
    public static final ArrayList<Bus> buses = new ArrayList<>();
    public static final ArrayList<Route> routes = new ArrayList<>();

    @Override
    public boolean addBus(Bus bus) {
        if (bus == null) return false;
        for (Bus existing : buses) {
            if (existing.getBusNumber().equalsIgnoreCase(bus.getBusNumber())) return false;
        }
        buses.add(bus);
        if (!routes.contains(bus.getRoute())) routes.add(bus.getRoute());
        return true;
    }

    @Override
    public boolean registerStudent(Student student, String busNumber) {
        if (student == null || busNumber == null) return false;
        for (Bus bus : buses) {
            for (Student existing : bus.getStudents()) {
                if (existing.getStudentId().equalsIgnoreCase(student.getStudentId())) return false;
            }
        }
        for (Bus bus : buses) {
            if (bus.getBusNumber().equalsIgnoreCase(busNumber)) {
                return bus.addStudent(student);
            }
        }
        return false;
    }

    // Console method retained for compatibility with earlier project versions.
    public void registerStudent() {
        System.out.println("Use the CampusRide GUI to register a student.");
    }

    @Override
    public ArrayList<Route> searchRoutes(String source, String destination) {
        ArrayList<Route> matches = new ArrayList<>();
        String from = source == null ? "" : source.trim();
        String to = destination == null ? "" : destination.trim();

        for (Route route : routes) {
            boolean sourceMatches = from.isEmpty()
                    || route.getSource().equalsIgnoreCase(from);
            boolean destinationMatches = to.isEmpty()
                    || route.getDestination().equalsIgnoreCase(to);
            if (sourceMatches && destinationMatches) matches.add(route);
        }
        return matches;
    }

    public static void loadDemoData() {
        if (!buses.isEmpty()) return;
        Route r1 = new Route("R01", "Pimpri", "College", "08:00 AM");
        Route r2 = new Route("R02", "Akurdi", "College", "08:15 AM");
        Driver d1 = new Driver("Rahul Patil", "9876543210", "MH-DL-1001");
        Driver d2 = new Driver("Amit Shinde", "9876501234", "MH-DL-1002");
        buses.add(new Bus("BUS-101", 40, r1, d1));
        buses.add(new Bus("BUS-102", 35, r2, d2));
        routes.add(r1);
        routes.add(r2);
    }
}

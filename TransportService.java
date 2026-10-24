package CampusTransportManagement;

import java.util.ArrayList;

public interface TransportService {
    boolean addBus(Bus bus);
    boolean registerStudent(Student student, String busNumber);
    ArrayList<Route> searchRoutes(String source, String destination);
}

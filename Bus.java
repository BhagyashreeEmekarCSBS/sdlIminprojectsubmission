package CampusTransportManagement;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Bus {
    private final String busNumber;
    private final int capacity;
    private final Route route;
    private final Driver driver;
    private final ArrayList<Student> students = new ArrayList<>();

    public Bus(String busNumber, int capacity, Route route, Driver driver) {
        if (capacity <= 0) throw new IllegalArgumentException("Capacity must be positive.");
        this.busNumber = busNumber;
        this.capacity = capacity;
        this.route = route;
        this.driver = driver;
    }

    public String getBusNumber() { return busNumber; }
    public int getCapacity() { return capacity; }
    public Route getRoute() { return route; }
    public Driver getDriver() { return driver; }
    public int getAvailableSeats() { return capacity - students.size(); }
    public ArrayList<Student> getStudents() { return new ArrayList<>(students); }

    public boolean addStudent(Student student) {
        if (student == null || getAvailableSeats() <= 0) return false;
        for (Student existing : students) {
            if (existing.getStudentId().equalsIgnoreCase(student.getStudentId())) return false;
        }
        students.add(student);
        return true;
    }
}

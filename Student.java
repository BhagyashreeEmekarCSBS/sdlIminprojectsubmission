package CampusTransportManagement;

public class Student extends Person {
    private final String studentId;
    private final String course;

    public Student(String name, String phone, String studentId, String course) {
        super(name, phone);
        this.studentId = studentId;
        this.course = course;
    }

    public String getStudentId() { return studentId; }
    public String getCourse() { return course; }

    @Override
    public void displayDetails() {
        System.out.println("Student: " + name + " | ID: " + studentId
                + " | Course: " + course + " | Phone: " + phone);
    }
}

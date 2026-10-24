package Collageevent;


import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.io.*;
import java.util.ArrayList;
import java.util.HashMap;

// Interface
interface Manageable {
    void performAction();
}

// Abstract class
abstract class User {
    protected String name;
    protected String role;

    User(String name, String role) {
        this.name = name;
        this.role = role;
    }

    abstract String getDashboardMessage();
}

// Student class
class Student extends User implements Manageable {
    Student(String name) {
        super(name, "Student");
    }

    @Override
    String getDashboardMessage() {
        return "Welcome Student! Register for college events.";
    }

    @Override
    public void performAction() {
        System.out.println("Student action performed.");
    }
}

// Volunteer class
class Volunteer extends User implements Manageable {
    Volunteer(String name) {
        super(name, "Volunteer");
    }

    @Override
    String getDashboardMessage() {
        return "Welcome Volunteer! Manage your assignments.";
    }

    @Override
    public void performAction() {
        System.out.println("Volunteer action performed.");
    }
}

// Coordinator class
class Coordinator extends User implements Manageable {
    Coordinator(String name) {
        super(name, "Coordinator");
    }

    @Override
    String getDashboardMessage() {
        return "Welcome Coordinator! Manage events and volunteers.";
    }

    @Override
    public void performAction() {
        System.out.println("Coordinator action performed.");
    }
}

// Admin class
class Admin extends User implements Manageable {
    Admin(String name) {
        super(name, "Admin");
    }

    @Override
    String getDashboardMessage() {
        return "Welcome Admin! Manage system records.";
    }

    @Override
    public void performAction() {
        System.out.println("Admin action performed.");
    }
}

// Event class
class CollegeEvent {
    String title;
    String date;
    String venue;

    CollegeEvent(String title, String date, String venue) {
        this.title = title;
        this.date = date;
        this.venue = venue;
    }

    @Override
    public String toString() {
        return title + " | " + date + " | " + venue;
    }
}

// Main application
public class CollegeEventManagement extends JFrame {

    private JComboBox<String> roleBox;
    private JTextField nameField;
    private JComboBox<String> eventBox;
    private JLabel welcomeLabel;
    private JTextArea outputArea;
    private DefaultTableModel tableModel;

    private JButton registerButton;
    private JButton addEventButton;
    private JButton allocateButton;
    private JButton markButton;
    private JButton recordsButton;

    private ArrayList<CollegeEvent> events = new ArrayList<>();
    private ArrayList<String> registrations = new ArrayList<>();
    private ArrayList<String> participation = new ArrayList<>();

    private HashMap<String, ArrayList<String>> assignments =
            new HashMap<>();

    private User currentUser;

    private final String DATA_DIR = "college_data";

    public CollegeEventManagement() {
        loadData();
        createInterface();
    }

    private void createInterface() {
        setTitle("College Event & Volunteer Management System");
        setSize(950, 650);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout(10, 10));

        Color navy = new Color(24, 42, 85);
        Color blue = new Color(48, 100, 210);
        Color background = new Color(243, 246, 252);

        getContentPane().setBackground(background);

        // Header
        JLabel title = new JLabel(
                "COLLEGE EVENT & VOLUNTEER MANAGEMENT",
                SwingConstants.CENTER);

        title.setFont(new Font("Arial", Font.BOLD, 23));
        title.setForeground(Color.WHITE);
        title.setOpaque(true);
        title.setBackground(navy);
        title.setBorder(
                BorderFactory.createEmptyBorder(22, 10, 22, 10));

        add(title, BorderLayout.NORTH);

        // Main panel
        JPanel mainPanel = new JPanel(new BorderLayout(10, 10));
        mainPanel.setBackground(background);
        mainPanel.setBorder(
                BorderFactory.createEmptyBorder(5, 15, 15, 15));

        // User selection
        JPanel loginPanel = new JPanel(new GridLayout(2, 4, 10, 10));
        loginPanel.setBackground(Color.WHITE);
        loginPanel.setBorder(
                BorderFactory.createTitledBorder("Select User"));

        nameField = new JTextField();

        roleBox = new JComboBox<>(new String[] {
                "Student", "Volunteer", "Coordinator", "Admin"
        });

        JButton loginButton = new JButton("Open Dashboard");

        loginPanel.add(new JLabel("Name:"));
        loginPanel.add(nameField);
        loginPanel.add(new JLabel("Role:"));
        loginPanel.add(roleBox);

        loginPanel.add(new JLabel("Current User:"));

        welcomeLabel = new JLabel("Select your role");
        loginPanel.add(welcomeLabel);
        loginPanel.add(loginButton);

        mainPanel.add(loginPanel, BorderLayout.NORTH);

        // Event table
        String[] columns = {"Event Name", "Date", "Venue"};

        tableModel = new DefaultTableModel(columns, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };

        JTable eventTable = new JTable(tableModel);
        eventTable.setRowHeight(28);

        JScrollPane tableScroll = new JScrollPane(eventTable);
        tableScroll.setBorder(
                BorderFactory.createTitledBorder("College Events"));

        // Action buttons
        JPanel actionsPanel = new JPanel(new GridLayout(0, 2, 10, 10));
        actionsPanel.setBackground(background);

        eventBox = new JComboBox<>();

        registerButton = new JButton("Register for Event");
        addEventButton = new JButton("Add New Event");
        allocateButton = new JButton("Allocate Volunteer");
        markButton = new JButton("Mark Participation");
        recordsButton = new JButton("View Records");

        JButton refreshButton = new JButton("Refresh Events");

        actionsPanel.add(new JLabel("Choose Event:"));
        actionsPanel.add(eventBox);
        actionsPanel.add(registerButton);
        actionsPanel.add(addEventButton);
        actionsPanel.add(allocateButton);
        actionsPanel.add(markButton);
        actionsPanel.add(recordsButton);
        actionsPanel.add(refreshButton);

        JPanel centerPanel = new JPanel(new BorderLayout(10, 10));
        centerPanel.setBackground(background);

        centerPanel.add(tableScroll, BorderLayout.CENTER);
        centerPanel.add(actionsPanel, BorderLayout.SOUTH);

        mainPanel.add(centerPanel, BorderLayout.CENTER);

        // System messages
        outputArea = new JTextArea(5, 30);
        outputArea.setEditable(false);

        JScrollPane outputScroll = new JScrollPane(outputArea);
        outputScroll.setBorder(
                BorderFactory.createTitledBorder("System Messages"));

        mainPanel.add(outputScroll, BorderLayout.SOUTH);

        add(mainPanel, BorderLayout.CENTER);

        // Button actions
        loginButton.addActionListener(e -> login());

        registerButton.addActionListener(e -> registerEvent());
        addEventButton.addActionListener(e -> addEvent());
        allocateButton.addActionListener(e -> allocateVolunteer());
        markButton.addActionListener(e -> markParticipation());
        recordsButton.addActionListener(e -> viewRecords());

        refreshButton.addActionListener(e -> refreshEvents());

        styleButton(registerButton, blue);
        styleButton(addEventButton, navy);
        styleButton(allocateButton, navy);
        styleButton(markButton, blue);
        styleButton(recordsButton, navy);
        styleButton(refreshButton, blue);

        refreshEvents();
        updateButtons(0);

        setVisible(true);
    }

    private void styleButton(JButton button, Color color) {
        button.setBackground(color);
        button.setForeground(Color.WHITE);
        button.setFocusPainted(false);
        button.setFont(new Font("Arial", Font.BOLD, 12));
    }

    // Fixed: no component casting required
    private void updateButtons(int permissions) {
        registerButton.setEnabled(permissions >= 1);
        addEventButton.setEnabled(permissions >= 3);
        allocateButton.setEnabled(permissions >= 3);
        markButton.setEnabled(permissions >= 2);
        recordsButton.setEnabled(permissions >= 1);
    }

    // Polymorphism
    private void login() {
        String name = nameField.getText().trim();

        if (name.isEmpty()) {
            message("Please enter your name.");
            return;
        }

        String role = (String) roleBox.getSelectedItem();

        switch (role) {
            case "Student":
                currentUser = new Student(name);
                break;

            case "Volunteer":
                currentUser = new Volunteer(name);
                break;

            case "Coordinator":
                currentUser = new Coordinator(name);
                break;

            default:
                currentUser = new Admin(name);
        }

        welcomeLabel.setText(role + ": " + name);
        message(currentUser.getDashboardMessage());

        int permissions = 1;

        if (role.equals("Volunteer")) {
            permissions = 2;
        } else if (role.equals("Coordinator")
                || role.equals("Admin")) {
            permissions = 3;
        }

        updateButtons(permissions);
    }

    private boolean allowed(String... roles) {
        if (currentUser == null) {
            message("Please open a dashboard first.");
            return false;
        }

        for (String role : roles) {
            if (currentUser.role.equals(role)) {
                return true;
            }
        }

        message("Access denied for role: " + currentUser.role);
        return false;
    }

    // Student registration
    private void registerEvent() {
        if (!allowed("Student")) {
            return;
        }

        CollegeEvent event = selectedEvent();

        if (event == null) {
            return;
        }

        String record = currentUser.name + "|" + event.title;

        if (registrations.contains(record)) {
            message("You are already registered for this event.");
            return;
        }

        registrations.add(record);
        saveData();

        message("Successfully registered for " + event.title);
    }

    // Add event
    private void addEvent() {
        if (!allowed("Coordinator", "Admin")) {
            return;
        }

        JTextField title = new JTextField();
        JTextField date = new JTextField();
        JTextField venue = new JTextField();

        Object[] fields = {
                "Event Name:", title,
                "Date (DD-MM-YYYY):", date,
                "Venue:", venue
        };

        int result = JOptionPane.showConfirmDialog(
                this, fields, "Add College Event",
                JOptionPane.OK_CANCEL_OPTION);

        if (result != JOptionPane.OK_OPTION) {
            return;
        }

        String eventName = title.getText().trim();
        String eventDate = date.getText().trim();
        String eventVenue = venue.getText().trim();

        if (eventName.isEmpty() || eventDate.isEmpty()
                || eventVenue.isEmpty()
                || eventName.contains("|")
                || eventDate.contains("|")
                || eventVenue.contains("|")) {
            message("Please enter valid event details.");
            return;
        }

        events.add(new CollegeEvent(
                eventName, eventDate, eventVenue));

        saveData();
        refreshEvents();

        message("New event added successfully.");
    }

    // Volunteer allocation
    private void allocateVolunteer() {
        if (!allowed("Coordinator", "Admin")) {
            return;
        }

        CollegeEvent event = selectedEvent();

        if (event == null) {
            return;
        }

        String volunteer = JOptionPane.showInputDialog(
                this, "Enter volunteer name:");

        if (volunteer == null || volunteer.trim().isEmpty()) {
            return;
        }

        volunteer = volunteer.trim();

        if (volunteer.contains("|")) {
            message("Invalid volunteer name.");
            return;
        }

        ArrayList<String> list = assignments.get(volunteer);

        if (list == null) {
            list = new ArrayList<>();
            assignments.put(volunteer, list);
        }

        if (!list.contains(event.title)) {
            list.add(event.title);
            saveData();
        }

        message("Volunteer allocated to " + event.title);
    }

    // Participation record
    private void markParticipation() {
        if (!allowed("Volunteer", "Coordinator", "Admin")) {
            return;
        }

        CollegeEvent event = selectedEvent();

        if (event == null) {
            return;
        }

        String person = currentUser.name;

        if (currentUser.role.equals("Volunteer")) {
            ArrayList<String> assigned = assignments.get(person);

            if (assigned == null || !assigned.contains(event.title)) {
                message("You are not allocated to this event.");
                return;
            }
        } else {
            String entered = JOptionPane.showInputDialog(
                    this, "Enter participant/volunteer name:");

            if (entered == null || entered.trim().isEmpty()) {
                return;
            }

            person = entered.trim();
        }

        String record = person + "|" + event.title;

        if (participation.contains(record)) {
            message("Participation is already marked.");
            return;
        }

        participation.add(record);
        saveData();

        message("Participation marked for " + person);
    }

    // View records
    private void viewRecords() {
        if (!allowed("Student", "Volunteer", "Coordinator", "Admin")) {
            return;
        }

        StringBuilder report = new StringBuilder();

        report.append("EVENTS\n");

        for (CollegeEvent event : events) {
            report.append(event).append("\n");
        }

        report.append("\nREGISTRATIONS\n");

        for (String record : registrations) {
            if (currentUser.role.equals("Admin")
                    || currentUser.role.equals("Coordinator")
                    || record.startsWith(currentUser.name + "|")) {
                report.append(record.replace("|", " - ")).append("\n");
            }
        }

        report.append("\nVOLUNTEER ASSIGNMENTS\n");

        for (String volunteer : assignments.keySet()) {
            if (currentUser.role.equals("Admin")
                    || currentUser.role.equals("Coordinator")
                    || volunteer.equals(currentUser.name)) {
                report.append(volunteer).append(": ")
                        .append(assignments.get(volunteer))
                        .append("\n");
            }
        }

        report.append("\nPARTICIPATION\n");

        for (String record : participation) {
            if (currentUser.role.equals("Admin")
                    || currentUser.role.equals("Coordinator")
                    || record.startsWith(currentUser.name + "|")) {
                report.append(record.replace("|", " - ")).append("\n");
            }
        }

        outputArea.setText(report.toString());
    }

    private CollegeEvent selectedEvent() {
        int index = eventBox.getSelectedIndex();

        if (index < 0 || index >= events.size()) {
            message("Please select an event first.");
            return null;
        }

        return events.get(index);
    }

    private void refreshEvents() {
        tableModel.setRowCount(0);
        eventBox.removeAllItems();

        for (CollegeEvent event : events) {
            tableModel.addRow(new Object[] {
                    event.title, event.date, event.venue
            });

            eventBox.addItem(event.title);
        }
    }

    private void message(String text) {
        outputArea.append(text + "\n");
    }

    // File handling: load saved events and records
    private void loadData() {
        File folder = new File(DATA_DIR);

        if (!folder.exists()) {
            folder.mkdirs();
        }

        File eventFile = new File(folder, "events.txt");

        if (!eventFile.exists()) {
            events.add(new CollegeEvent(
                    "Tech Fest", "20-10-2026", "Auditorium"));

            events.add(new CollegeEvent(
                    "Coding Competition", "25-10-2026", "Lab 3"));

            events.add(new CollegeEvent(
                    "Cultural Fest", "30-10-2026", "Main Ground"));

            saveData();
        } else {
            try (BufferedReader reader =
                    new BufferedReader(new FileReader(eventFile))) {

                String line;

                while ((line = reader.readLine()) != null) {
                    String[] parts = line.split("\\|", -1);

                    if (parts.length == 3) {
                        events.add(new CollegeEvent(
                                parts[0], parts[1], parts[2]));
                    }
                }

            } catch (IOException e) {
                System.out.println("Could not load events: "
                        + e.getMessage());
            }
        }

        loadLines("registrations.txt", registrations);
        loadLines("participation.txt", participation);

        File assignmentFile =
                new File(DATA_DIR, "assignments.txt");

        try (BufferedReader reader =
                new BufferedReader(new FileReader(assignmentFile))) {

            String line;

            while ((line = reader.readLine()) != null) {
                String[] parts = line.split("\\|", 2);

                if (parts.length == 2) {
                    if (!assignments.containsKey(parts[0])) {
                        assignments.put(
                                parts[0], new ArrayList<String>());
                    }

                    assignments.get(parts[0]).add(parts[1]);
                }
            }

        } catch (IOException ignored) {
            // Assignment file may not exist initially.
        }
    }

    private void loadLines(String fileName, ArrayList<String> list) {
        File file = new File(DATA_DIR, fileName);

        try (BufferedReader reader =
                new BufferedReader(new FileReader(file))) {

            String line;

            while ((line = reader.readLine()) != null) {
                list.add(line);
            }

        } catch (IOException ignored) {
            // File may not exist initially.
        }
    }

    // File handling: save all records
    private void saveData() {
        File folder = new File(DATA_DIR);

        if (!folder.exists()) {
            folder.mkdirs();
        }

        try {
            PrintWriter writer = new PrintWriter(
                    new FileWriter(new File(folder, "events.txt")));

            for (CollegeEvent event : events) {
                writer.println(event.title + "|" +
                        event.date + "|" + event.venue);
            }

            writer.close();

            saveLines("registrations.txt", registrations);
            saveLines("participation.txt", participation);

            writer = new PrintWriter(
                    new FileWriter(new File(folder, "assignments.txt")));

            for (String volunteer : assignments.keySet()) {
                for (String event : assignments.get(volunteer)) {
                    writer.println(volunteer + "|" + event);
                }
            }

            writer.close();

        } catch (IOException e) {
            message("Error saving data: " + e.getMessage());
        }
    }

    private void saveLines(String fileName, ArrayList<String> list)
            throws IOException {

        PrintWriter writer = new PrintWriter(
                new FileWriter(new File(DATA_DIR, fileName)));

        for (String item : list) {
            writer.println(item);
        }

        writer.close();
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(new Runnable() {
            @Override
            public void run() {
                new CollegeEventManagement();
            }
        });
    }
}

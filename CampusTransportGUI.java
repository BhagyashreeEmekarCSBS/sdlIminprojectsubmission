package CampusTransportManagement;

import javax.swing.*;
import javax.swing.border.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.util.ArrayList;

public class CampusTransportGUI extends JFrame {
    private final Color navy = new Color(22, 31, 58);
    private final Color blue = new Color(75, 103, 230);
    private final Color background = new Color(244, 247, 252);
    private final Color ink = new Color(38, 47, 72);
    private final Color muted = new Color(119, 130, 151);
    private final CampusTransportSystem system = new CampusTransportSystem();

    private final CardLayout cardLayout = new CardLayout();
    private final JPanel pageHolder = new JPanel(cardLayout);
    private JLabel pageTitle, busCount, studentCount, seatCount, freeCount;
    private DefaultTableModel busModel, studentModel, routeModel, driverModel;
    private JTable dashboardTable, busTable, studentTable, routeTable, driverTable;

    public CampusTransportGUI() {
        CampusTransportSystem.loadDemoData();
        setTitle("CampusRide | College Transport Management");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(1220, 760);
        setMinimumSize(new Dimension(980, 620));
        setLocationRelativeTo(null);
        getContentPane().setBackground(background);
        setLayout(new BorderLayout());

        add(buildSidebar(), BorderLayout.WEST);

        JPanel main = new JPanel(new BorderLayout());
        main.setBackground(background);
        main.add(buildTopbar(), BorderLayout.NORTH);

        pageHolder.setBackground(background);
        pageHolder.add(buildDashboard(), "Dashboard");
        pageHolder.add(buildBusesPage(), "Buses");
        pageHolder.add(buildStudentsPage(), "Students");
        pageHolder.add(buildRoutesPage(), "Routes");
        pageHolder.add(buildDriversPage(), "Drivers");
        main.add(pageHolder, BorderLayout.CENTER);
        add(main, BorderLayout.CENTER);

        refreshTables();
        showPage("Dashboard");
    }

    private JPanel buildSidebar() {
        JPanel side = new JPanel();
        side.setBackground(navy);
        side.setPreferredSize(new Dimension(230, 0));
        side.setBorder(new EmptyBorder(24, 15, 20, 15));
        side.setLayout(new BoxLayout(side, BoxLayout.Y_AXIS));

        JLabel logo = new JLabel("  🚌 CampusRide");
        logo.setForeground(Color.WHITE);
        logo.setFont(new Font("SansSerif", Font.BOLD, 22));
        JLabel sub = new JLabel("   SMART TRANSPORT PORTAL");
        sub.setForeground(new Color(168, 181, 218));
        sub.setFont(new Font("SansSerif", Font.PLAIN, 10));
        side.add(logo);
        side.add(Box.createVerticalStrut(5));
        side.add(sub);
        side.add(Box.createVerticalStrut(35));

        JLabel menu = new JLabel("  MAIN MENU");
        menu.setForeground(new Color(145, 160, 200));
        menu.setFont(new Font("SansSerif", Font.BOLD, 11));
        side.add(menu);
        side.add(Box.createVerticalStrut(12));

        addNav(side, "▦   Dashboard", "Dashboard");
        addNav(side, "🚌   Bus Management", "Buses");
        addNav(side, "♙   Students", "Students");
        addNav(side, "⌖   Routes", "Routes");
        addNav(side, "♧   Drivers", "Drivers");

        side.add(Box.createVerticalGlue());
        JLabel footer = new JLabel("<html><font color='#b2c8f4'>Travel smarter.<br>Arrive safely.</font></html>");
        footer.setFont(new Font("SansSerif", Font.BOLD, 14));
        footer.setBorder(new EmptyBorder(12, 10, 20, 10));
        side.add(footer);
        return side;
    }

  


private void addNav(JPanel side, String text, String page) {
    JButton button = new JButton(text);

    button.setMaximumSize(new Dimension(215, 45));
    button.setPreferredSize(new Dimension(215, 45));
    button.setAlignmentX(Component.LEFT_ALIGNMENT);
    button.setHorizontalAlignment(SwingConstants.LEFT);

    button.setFont(new Font("SansSerif", Font.BOLD, 14));
  final Color textColor =
        page.equals("Dashboard") ? Color.YELLOW : Color.BLACK;

button.setForeground(textColor);
    button.setBackground(new Color(22, 31, 58));

    button.setOpaque(true);
    button.setContentAreaFilled(true);
    button.setBorderPainted(false);
    button.setFocusPainted(false);
   // button.setRolloverEnabled(false);
    button.setBorder(new EmptyBorder(10, 13, 10, 5));

    // Prevent the Look and Feel from overriding button colors
    button.setUI(new javax.swing.plaf.basic.BasicButtonUI());

    button.addMouseListener(new java.awt.event.MouseAdapter() {
        @Override
        public void mouseEntered(java.awt.event.MouseEvent e) {
            button.setBackground(new Color(65, 83, 135));
            button.setForeground(Color.WHITE);
        }

        @Override
        public void mouseExited(java.awt.event.MouseEvent e) {
            button.setBackground(new Color(22, 31, 58));
            button.setForeground(Color.WHITE);
        }
    });

    button.addActionListener(e -> showPage(page));

    side.add(button);
    side.add(Box.createVerticalStrut(6));
}



    private JPanel buildTopbar() {
        JPanel bar = new JPanel(new BorderLayout());
        bar.setBackground(Color.WHITE);
        bar.setBorder(new CompoundBorder(
                new MatteBorder(0, 0, 1, 0, new Color(225, 230, 240)),
                new EmptyBorder(16, 24, 16, 24)));
        pageTitle = new JLabel("Dashboard");
        pageTitle.setForeground(ink);
        pageTitle.setFont(new Font("SansSerif", Font.BOLD, 21));

        JButton refresh = secondaryButton("↻ Refresh");
        refresh.addActionListener(e -> refreshTables());
        JLabel admin = new JLabel("  👤 Administrator  ");
        admin.setForeground(ink);
        admin.setFont(new Font("SansSerif", Font.BOLD, 12));
        JPanel right = new JPanel(new FlowLayout(FlowLayout.RIGHT, 5, 0));
        right.setOpaque(false);
        right.add(refresh);
        right.add(admin);
        bar.add(pageTitle, BorderLayout.WEST);
        bar.add(right, BorderLayout.EAST);
        return bar;
    }

    private JPanel buildDashboard() {
        JPanel page = pagePanel();
        JPanel body = new JPanel();
        body.setOpaque(false);
        body.setLayout(new BoxLayout(body, BoxLayout.Y_AXIS));

        JPanel banner = new JPanel(new BorderLayout(15, 10));
        banner.setBackground(new Color(67, 86, 202));
        banner.setBorder(new EmptyBorder(22, 24, 22, 24));
        banner.setMaximumSize(new Dimension(Integer.MAX_VALUE, 135));
        JPanel copy = new JPanel();
        copy.setOpaque(false);
        copy.setLayout(new BoxLayout(copy, BoxLayout.Y_AXIS));
        JLabel title = new JLabel("Your journey, simplified. ✨");
        title.setForeground(Color.WHITE);
        title.setFont(new Font("SansSerif", Font.BOLD, 24));
        JLabel text = new JLabel("Manage buses, routes and student transport in one place.");
        text.setForeground(new Color(229, 233, 255));
        text.setFont(new Font("SansSerif", Font.PLAIN, 13));
        copy.add(title);
        copy.add(Box.createVerticalStrut(9));
        copy.add(text);
        JLabel busEmoji = new JLabel("🚌");
        busEmoji.setFont(new Font("SansSerif", Font.PLAIN, 54));
        banner.add(copy, BorderLayout.CENTER);
        banner.add(busEmoji, BorderLayout.EAST);
        body.add(banner);
        body.add(Box.createVerticalStrut(22));
        body.add(section("Transport Overview"));
        body.add(Box.createVerticalStrut(12));

        JPanel stats = new JPanel(new GridLayout(1, 4, 12, 0));
        stats.setOpaque(false);
        busCount = new JLabel("0");
        studentCount = new JLabel("0");
        seatCount = new JLabel("0");
        freeCount = new JLabel("0");
        stats.add(statCard("🚌  TOTAL BUSES", busCount, new Color(75, 103, 230)));
        stats.add(statCard("🎓  STUDENTS", studentCount, new Color(30, 155, 115)));
        stats.add(statCard("💺  TOTAL SEATS", seatCount, new Color(145, 92, 210)));
        stats.add(statCard("✓  FREE SEATS", freeCount, new Color(225, 150, 45)));
        body.add(stats);
        body.add(Box.createVerticalStrut(22));
        body.add(section("Bus Overview"));
        body.add(Box.createVerticalStrut(10));

        dashboardTable = new JTable(model("Bus No.", "Source", "Destination",
                "Departure", "Driver", "Capacity", "Available"));
        styleTable(dashboardTable);
        JPanel tableCard = whiteCard(new JScrollPane(dashboardTable));
        tableCard.setPreferredSize(new Dimension(850, 230));
        body.add(tableCard);
        page.add(body, BorderLayout.CENTER);
        return page;
    }

    private JPanel statCard(String title, JLabel value, Color accent) {
        JPanel p = new JPanel(new BorderLayout(4, 12));
        p.setBackground(Color.WHITE);
        p.setBorder(new CompoundBorder(new MatteBorder(0, 4, 0, 0, accent),
                new EmptyBorder(14, 12, 14, 10)));
        JLabel label = new JLabel(title);
        label.setForeground(muted);
        label.setFont(new Font("SansSerif", Font.BOLD, 10));
        value.setForeground(ink);
        value.setFont(new Font("SansSerif", Font.BOLD, 28));
        p.add(label, BorderLayout.NORTH);
        p.add(value, BorderLayout.CENTER);
        return p;
    }

    private JPanel buildBusesPage() {
        JPanel p = pagePanel();
        busModel = model("Bus No.", "Source", "Destination", "Departure", "Driver", "Capacity", "Available");
        busTable = new JTable(busModel);
        styleTable(busTable);
        JButton add = primaryButton("+ Add Bus & Driver");
        add.addActionListener(e -> addBusDialog());
        JButton demo = secondaryButton("Load Demo Data");
        demo.addActionListener(e -> {
            CampusTransportSystem.loadDemoData();
            refreshTables();
        });
        JPanel actions = new JPanel(new FlowLayout(FlowLayout.RIGHT, 8, 0));
        actions.setOpaque(false);
        actions.add(demo);
        actions.add(add);
        p.add(actions, BorderLayout.NORTH);
        p.add(new JScrollPane(busTable), BorderLayout.CENTER);
        return p;
    }

    private void addBusDialog() {
        JTextField busNo = new JTextField();
        JTextField routeId = new JTextField();
        JTextField source = new JTextField();
        JTextField destination = new JTextField();
        JTextField departure = new JTextField("08:00 AM");
        JTextField capacity = new JTextField("40");
        JTextField driverName = new JTextField();
        JTextField phone = new JTextField();
        JTextField license = new JTextField();
        Object[] fields = {"Bus number:", busNo, "Route ID:", routeId,
                "Source:", source, "Destination:", destination, "Departure time:", departure,
                "Seat capacity:", capacity, "Driver name:", driverName, "Driver phone:", phone,
                "License number:", license};
        int result = JOptionPane.showConfirmDialog(this, fields, "Add Bus and Driver",
                JOptionPane.OK_CANCEL_OPTION, JOptionPane.PLAIN_MESSAGE);
        if (result != JOptionPane.OK_OPTION) return;

        if (busNo.getText().trim().isEmpty() || routeId.getText().trim().isEmpty()
                || source.getText().trim().isEmpty() || destination.getText().trim().isEmpty()
                || departure.getText().trim().isEmpty() || capacity.getText().trim().isEmpty()
                || driverName.getText().trim().isEmpty() || phone.getText().trim().isEmpty()
                || license.getText().trim().isEmpty()) {
            message("Please fill in every field.");
            return;
        }
        try {
            int seats = Integer.parseInt(capacity.getText().trim());
            Route route = new Route(routeId.getText().trim(), source.getText().trim(),
                    destination.getText().trim(), departure.getText().trim());
            Driver driver = new Driver(driverName.getText().trim(), phone.getText().trim(),
                    license.getText().trim());
            Bus bus = new Bus(busNo.getText().trim(), seats, route, driver);
            if (system.addBus(bus)) {
                refreshTables();
                message("Bus and driver added successfully!");
            } else {
                message("Bus number already exists.");
            }
        } catch (NumberFormatException ex) {
            message("Seat capacity must be a whole number.");
        } catch (IllegalArgumentException ex) {
            message(ex.getMessage());
        }
    }

    private JPanel buildStudentsPage() {
        JPanel p = pagePanel();
        studentModel = model("Student ID", "Name", "Phone", "Course", "Bus No.");
        studentTable = new JTable(studentModel);
        styleTable(studentTable);
        JButton add = primaryButton("+ Register Student");
        add.addActionListener(e -> registerStudentDialog());
        p.add(actionBar(add), BorderLayout.NORTH);
        p.add(new JScrollPane(studentTable), BorderLayout.CENTER);
        return p;
    }

    private void registerStudentDialog() {
        if (CampusTransportSystem.buses.isEmpty()) {
            message("Please add a bus before registering a student.");
            return;
        }
        JTextField id = new JTextField();
        JTextField name = new JTextField();
        JTextField phone = new JTextField();
        JTextField course = new JTextField();
        ArrayList<String> busNumbers = new ArrayList<>();
        for (Bus b : CampusTransportSystem.buses) {
            busNumbers.add(b.getBusNumber() + "  (" + b.getAvailableSeats() + " seats left)");
        }
        JComboBox<String> busChoice = new JComboBox<>(busNumbers.toArray(new String[0]));
        Object[] fields = {"Student ID:", id, "Full name:", name, "Phone:", phone,
                "Course / Department:", course, "Choose bus:", busChoice};
        int result = JOptionPane.showConfirmDialog(this, fields, "Student Registration",
                JOptionPane.OK_CANCEL_OPTION, JOptionPane.PLAIN_MESSAGE);
        if (result != JOptionPane.OK_OPTION) return;

        String studentId = id.getText().trim();
        String studentName = name.getText().trim();
        String studentPhone = phone.getText().trim();
        String studentCourse = course.getText().trim();
        if (studentId.isEmpty() || studentName.isEmpty()
                || studentPhone.isEmpty() || studentCourse.isEmpty()) {
            message("Please fill in every field.");
            return;
        }

        String selected = (String) busChoice.getSelectedItem();
        String busNo = selected.substring(0, selected.indexOf("  ("));
        Student student = new Student(studentName, studentPhone, studentId, studentCourse);
        if (system.registerStudent(student, busNo)) {
            refreshTables();
            JOptionPane.showMessageDialog(this,
                    "CAMPUSRIDE TRANSPORT PASS\n\nStudent: " + studentName
                    + "\nStudent ID: " + studentId + "\nCourse: " + studentCourse
                    + "\nBus: " + busNo + "\nStatus: Active",
                    "Registration Successful", JOptionPane.INFORMATION_MESSAGE);
        } else {
            message("Registration failed. Student ID may already exist or the bus is full.");
        }
    }

    private JPanel buildRoutesPage() {
        JPanel p = pagePanel();
        routeModel = model("Route ID", "Source", "Destination", "Departure");
        routeTable = new JTable(routeModel);
        styleTable(routeTable);
        JTextField source = new JTextField(10);
        JTextField destination = new JTextField(10);
        JButton search = primaryButton("⌕ Search");
        JButton showAll = secondaryButton("Show All");
        search.addActionListener(e -> {
            routeModel.setRowCount(0);
            for (Route r : system.searchRoutes(source.getText(), destination.getText())) {
                routeModel.addRow(new Object[]{r.getRouteId(), r.getSource(),
                        r.getDestination(), r.getDepartureTime()});
            }
            if (routeModel.getRowCount() == 0) message("No matching routes found.");
        });
        showAll.addActionListener(e -> refreshTables());
        JPanel tools = new JPanel(new FlowLayout(FlowLayout.LEFT, 8, 0));
        tools.setOpaque(false);
        tools.add(new JLabel("From:"));
        tools.add(source);
        tools.add(new JLabel("To:"));
        tools.add(destination);
        tools.add(search);
        tools.add(showAll);
        p.add(tools, BorderLayout.NORTH);
        p.add(new JScrollPane(routeTable), BorderLayout.CENTER);
        return p;
    }

    private JPanel buildDriversPage() {
        JPanel p = pagePanel();
        driverModel = model("Driver Name", "Phone", "License Number", "Assigned Bus");
        driverTable = new JTable(driverModel);
        styleTable(driverTable);
        JButton refresh = primaryButton("↻ Refresh Drivers");
        refresh.addActionListener(e -> refreshTables());
        p.add(actionBar(refresh), BorderLayout.NORTH);
        p.add(new JScrollPane(driverTable), BorderLayout.CENTER);
        return p;
    }

    private void refreshTables() {
        if (busModel == null || studentModel == null || routeModel == null || driverModel == null) {
            // Pages are constructed in sequence; the next refresh after startup fills all tables.
            return;
        }
        busModel.setRowCount(0);
        studentModel.setRowCount(0);
        routeModel.setRowCount(0);
        driverModel.setRowCount(0);
        if (dashboardTable != null) {
            DefaultTableModel dm = (DefaultTableModel) dashboardTable.getModel();
            dm.setRowCount(0);
        }
        int totalSeats = 0, availableSeats = 0, totalStudents = 0;
        for (Bus bus : CampusTransportSystem.buses) {
            Route route = bus.getRoute();
            Driver driver = bus.getDriver();
            int occupied = bus.getStudents().size();
            totalSeats += bus.getCapacity();
            availableSeats += bus.getAvailableSeats();
            totalStudents += occupied;
            Object[] row = {bus.getBusNumber(), route.getSource(), route.getDestination(),
                    route.getDepartureTime(), driver.getName(), bus.getCapacity(), bus.getAvailableSeats()};
            busModel.addRow(row);
            if (dashboardTable != null) ((DefaultTableModel) dashboardTable.getModel()).addRow(row);
            driverModel.addRow(new Object[]{driver.getName(), driver.getPhone(),
                    driver.getLicenseNumber(), bus.getBusNumber()});
            for (Student s : bus.getStudents()) {
                studentModel.addRow(new Object[]{s.getStudentId(), s.getName(), s.getPhone(),
                        s.getCourse(), bus.getBusNumber()});
            }
        }
        for (Route r : CampusTransportSystem.routes) {
            routeModel.addRow(new Object[]{r.getRouteId(), r.getSource(),
                    r.getDestination(), r.getDepartureTime()});
        }
        if (busCount != null) busCount.setText(String.valueOf(CampusTransportSystem.buses.size()));
        if (studentCount != null) studentCount.setText(String.valueOf(totalStudents));
        if (seatCount != null) seatCount.setText(String.valueOf(totalSeats));
        if (freeCount != null) freeCount.setText(String.valueOf(availableSeats));
    }

    private void showPage(String page) {
        refreshTables();
        cardLayout.show(pageHolder, page);
        pageTitle.setText(page);
    }

    private JPanel pagePanel() {
        JPanel p = new JPanel(new BorderLayout(0, 16));
        p.setBackground(background);
        p.setBorder(new EmptyBorder(23, 24, 24, 24));
        return p;
    }

    private JPanel actionBar(JButton button) {
        JPanel p = new JPanel(new FlowLayout(FlowLayout.RIGHT, 0, 0));
        p.setOpaque(false);
        p.add(button);
        return p;
    }

    private JLabel section(String text) {
        JLabel label = new JLabel(text);
        label.setFont(new Font("SansSerif", Font.BOLD, 18));
        label.setForeground(ink);
        return label;
    }

    private DefaultTableModel model(String... columns) {
        return new DefaultTableModel(columns, 0) {
            @Override public boolean isCellEditable(int row, int column) { return false; }
        };
    }

    private void styleTable(JTable table) {
        table.setRowHeight(32);
        table.setFont(new Font("SansSerif", Font.PLAIN, 12));
        table.setForeground(ink);
        table.setGridColor(new Color(231, 235, 243));
        table.setSelectionBackground(new Color(221, 230, 255));
        table.setSelectionForeground(navy);
        table.setShowVerticalLines(false);
        table.setFillsViewportHeight(true);
        table.getTableHeader().setFont(new Font("SansSerif", Font.BOLD, 12));
        table.getTableHeader().setBackground(new Color(232, 237, 248));
        table.getTableHeader().setForeground(navy);
        table.getTableHeader().setPreferredSize(new Dimension(0, 36));
    }

    private JPanel whiteCard(Component component) {
        JPanel p = new JPanel(new BorderLayout());
        p.setBackground(Color.WHITE);
        p.setBorder(new EmptyBorder(9, 9, 9, 9));
        p.add(component, BorderLayout.CENTER);
        return p;
    }

    private JButton primaryButton(String text) {
        JButton b = new JButton(text);
        b.setBackground(blue);
        b.setForeground(Color.WHITE);
        b.setFont(new Font("SansSerif", Font.BOLD, 12));
        b.setFocusPainted(false);
        b.setBorder(new EmptyBorder(10, 14, 10, 14));
        b.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
        return b;
    }

    private JButton secondaryButton(String text) {
        JButton b = new JButton(text);
        b.setBackground(Color.WHITE);
        b.setForeground(ink);
        b.setFont(new Font("SansSerif", Font.BOLD, 12));
        b.setFocusPainted(false);
        b.setBorder(new CompoundBorder(new LineBorder(new Color(220, 225, 235)),
                new EmptyBorder(8, 11, 8, 11)));
        b.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
        return b;
    }

    private void message(String text) {
        JOptionPane.showMessageDialog(this, text, "CampusRide", JOptionPane.INFORMATION_MESSAGE);
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            try {
              UIManager.setLookAndFeel(
    UIManager.getCrossPlatformLookAndFeelClassName()
);
            } catch (Exception ignored) { }
            new CampusTransportGUI().setVisible(true);
        });
    }
}

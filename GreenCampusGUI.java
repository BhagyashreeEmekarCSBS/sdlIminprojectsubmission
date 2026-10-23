
import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;

public class GreenCampusGUI extends JFrame {

    private final Color green = new Color(36, 115, 75);
    private final Color lightGreen = new Color(232, 245, 236);
    private final Color background = new Color(246, 249, 246);

    private JTextField nameField;
    private JTextField locationField;
    private JTextField requestIdField;

    private JComboBox<String> categoryBox;
    private JComboBox<String> workerBox;
    private JComboBox<String> statusBox;

    private DefaultTableModel tableModel;
    private JTable requestTable;

    public GreenCampusGUI() {
        setTitle("Green Campus - Waste Management");
        setSize(1100, 720);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());
        getContentPane().setBackground(background);

        add(createHeader(), BorderLayout.NORTH);
        add(createSidebar(), BorderLayout.WEST);
        add(createDashboard(), BorderLayout.CENTER);

        // Load the saved requests into the dashboard table and statistics.
        refreshTable();

        setVisible(true);
    }

    private JPanel createHeader() {
        JPanel header = new JPanel(new BorderLayout());
        header.setBackground(green);
        header.setBorder(BorderFactory.createEmptyBorder(18, 25, 18, 25));

        JLabel title = new JLabel("♻  GREEN CAMPUS");
        title.setForeground(Color.WHITE);
        title.setFont(new Font("Arial", Font.BOLD, 25));

        JLabel subtitle = new JLabel("Waste Management System");
        subtitle.setForeground(Color.WHITE);
        subtitle.setFont(new Font("Arial", Font.PLAIN, 14));

        JPanel textPanel = new JPanel(new GridLayout(2, 1));
        textPanel.setOpaque(false);
        textPanel.add(title);
        textPanel.add(subtitle);

        JLabel profile = new JLabel("Administrator  ●");
        profile.setForeground(Color.WHITE);
        profile.setFont(new Font("Arial", Font.BOLD, 14));

        header.add(textPanel, BorderLayout.WEST);
        header.add(profile, BorderLayout.EAST);

        return header;
    }

    private JPanel createSidebar() {
        JPanel sidebar = new JPanel();
        sidebar.setLayout(new BoxLayout(sidebar, BoxLayout.Y_AXIS));
        sidebar.setBackground(Color.WHITE);
        sidebar.setPreferredSize(new Dimension(205, 0));
        sidebar.setBorder(BorderFactory.createEmptyBorder(25, 12, 20, 12));

        JLabel menuTitle = new JLabel("  MAIN MENU");
        menuTitle.setFont(new Font("Arial", Font.BOLD, 12));
        menuTitle.setForeground(Color.GRAY);
        menuTitle.setAlignmentX(Component.LEFT_ALIGNMENT);

        sidebar.add(menuTitle);
        sidebar.add(Box.createVerticalStrut(18));

        addMenuButton(sidebar, "Dashboard", true);
        addMenuButton(sidebar, "Report Waste", false);
        addMenuButton(sidebar, "Track Requests", false);
        addMenuButton(sidebar, "Assign Workers", false);
        addMenuButton(sidebar, "Add Worker", false);
        addMenuButton(sidebar, "Collection Status", false);

        sidebar.add(Box.createVerticalGlue());

        JLabel footer = new JLabel(
                "<html><center>Keep our campus<br>clean and green! 🌱</center></html>");
        footer.setFont(new Font("Arial", Font.PLAIN, 13));
        footer.setForeground(green);
        footer.setAlignmentX(Component.CENTER_ALIGNMENT);

        sidebar.add(footer);

        return sidebar;
    }

    private void addMenuButton(
            JPanel sidebar, String text, boolean active) {

        JButton button = new JButton(text);
        button.setFont(new Font("Arial", Font.PLAIN, 14));
        button.setHorizontalAlignment(SwingConstants.LEFT);
        button.setFocusPainted(false);
        button.setMaximumSize(new Dimension(190, 45));
        button.setAlignmentX(Component.LEFT_ALIGNMENT);
        button.setBorder(BorderFactory.createEmptyBorder(10, 15, 10, 10));

        if (active) {
            button.setBackground(lightGreen);
            button.setForeground(green);
        } else {
            button.setBackground(Color.WHITE);
            button.setForeground(new Color(65, 75, 65));
        }

        button.setOpaque(true);
        button.setBorderPainted(false);

        button.addActionListener(e -> {
            switch (text) {
                case "Report Waste":
                    showReportDialog();
                    break;
                case "Track Requests":
                    showTrackRequestDialog();
                    break;
                case "Assign Workers":
                    showAssignmentDialog();
                    break;
                case "Add Worker":
                    showAddWorkerDialog();
                    break;
                case "Collection Status":
                    showStatusDialog();
                    break;
                default:
                    refreshTable();
                    break;
            }
        });

        sidebar.add(button);
        sidebar.add(Box.createVerticalStrut(7));
    }

    private JPanel createDashboard() {
        JPanel main = new JPanel(new BorderLayout(15, 15));
        main.setBackground(background);
        main.setBorder(BorderFactory.createEmptyBorder(22, 22, 22, 22));

        JPanel top = new JPanel(new BorderLayout());
        top.setOpaque(false);

        JLabel greeting = new JLabel("Good day, Administrator!");
        greeting.setFont(new Font("Arial", Font.BOLD, 23));
        greeting.setForeground(new Color(35, 65, 45));

        JLabel description = new JLabel(
                "Monitor waste collection across your campus.");
        description.setForeground(Color.GRAY);
        description.setFont(new Font("Arial", Font.PLAIN, 14));

        JPanel heading = new JPanel(new GridLayout(2, 1, 0, 6));
        heading.setOpaque(false);
        heading.add(greeting);
        heading.add(description);

        JButton reportButton = new JButton("+ Report Waste");
        styleButton(reportButton);

        reportButton.addActionListener(e -> showReportDialog());

        top.add(heading, BorderLayout.WEST);
        top.add(reportButton, BorderLayout.EAST);

        main.add(top, BorderLayout.NORTH);

        JPanel content = new JPanel(new BorderLayout(12, 15));
        content.setOpaque(false);

        JPanel stats = new JPanel(new GridLayout(1, 4, 12, 0));
        stats.setOpaque(false);

        stats.add(createStatCard("TOTAL REQUESTS", "0"));
        stats.add(createStatCard("PENDING", "0"));
        stats.add(createStatCard("IN PROGRESS", "0"));
        stats.add(createStatCard("COLLECTED", "0"));

        content.add(stats, BorderLayout.NORTH);

        JPanel tablePanel = new JPanel(new BorderLayout(0, 12));
        tablePanel.setBackground(Color.WHITE);
        tablePanel.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(
                        new Color(225, 232, 225)),
                BorderFactory.createEmptyBorder(18, 18, 18, 18)));

        JLabel tableTitle = new JLabel("Recent Collection Requests");
        tableTitle.setFont(new Font("Arial", Font.BOLD, 18));
        tableTitle.setForeground(new Color(40, 65, 45));

        String[] columns = {
                "Request ID", "Reporter", "Location",
                "Category", "Worker", "Status"
        };

        tableModel = new DefaultTableModel(columns, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };

        requestTable = new JTable(tableModel);
        requestTable.setRowHeight(34);
        requestTable.setFont(new Font("Arial", Font.PLAIN, 12));
        requestTable.getTableHeader().setFont(
                new Font("Arial", Font.BOLD, 12));
        requestTable.getTableHeader().setBackground(lightGreen);
        requestTable.setSelectionBackground(lightGreen);
        requestTable.setSelectionForeground(Color.BLACK);
        requestTable.setAutoResizeMode(JTable.AUTO_RESIZE_OFF);

        int[] widths = {85, 115, 145, 120, 115, 110};

        for (int i = 0; i < widths.length; i++) {
            requestTable.getColumnModel()
                    .getColumn(i).setPreferredWidth(widths[i]);
        }

        JScrollPane scrollPane = new JScrollPane(requestTable);

        tablePanel.add(tableTitle, BorderLayout.NORTH);
        tablePanel.add(scrollPane, BorderLayout.CENTER);

        content.add(tablePanel, BorderLayout.CENTER);
        main.add(content, BorderLayout.CENTER);

        return main;
    }

    private JPanel createStatCard(String title, String value) {
        JPanel card = new JPanel(new GridLayout(2, 1, 0, 8));
        card.setBackground(Color.WHITE);
        card.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(
                        new Color(225, 232, 225)),
                BorderFactory.createEmptyBorder(15, 15, 15, 15)));

        JLabel titleLabel = new JLabel(title);
        titleLabel.setFont(new Font("Arial", Font.BOLD, 10));
        titleLabel.setForeground(Color.GRAY);

        JLabel valueLabel = new JLabel(value);
        valueLabel.setFont(new Font("Arial", Font.BOLD, 27));
        valueLabel.setForeground(green);
        valueLabel.setName(title);

        card.add(titleLabel);
        card.add(valueLabel);

        return card;
    }

    private void styleButton(JButton button) {
        button.setBackground(green);
        button.setForeground(Color.WHITE);
        button.setFont(new Font("Arial", Font.BOLD, 13));
        button.setFocusPainted(false);
        button.setBorderPainted(false);
        button.setOpaque(true);
        button.setBorder(BorderFactory.createEmptyBorder(
                12, 18, 12, 18));
    }

    private void showReportDialog() {
        JTextField reporter = new JTextField(18);
        JTextField location = new JTextField(18);

        JComboBox<String> category = new JComboBox<>(
                new String[]{
                        "Recyclable",
                        "Non-Recyclable",
                        "Organic"
                });

        JPanel form = new JPanel(new GridLayout(3, 2, 10, 12));
        form.add(new JLabel("Reported by:"));
        form.add(reporter);
        form.add(new JLabel("Campus location:"));
        form.add(location);
        form.add(new JLabel("Waste category:"));
        form.add(category);

        int result = JOptionPane.showConfirmDialog(
                this, form, "Report Campus Waste",
                JOptionPane.OK_CANCEL_OPTION,
                JOptionPane.PLAIN_MESSAGE);

        if (result != JOptionPane.OK_OPTION) {
            return;
        }

        String name = reporter.getText().trim();
        String place = location.getText().trim();
        String type = (String) category.getSelectedItem();

        if (name.isEmpty() || place.isEmpty()) {
            JOptionPane.showMessageDialog(
                    this, "Please fill in all fields.");
            return;
        }

        int id = GreenCampusWasteManagement.nextRequestId++;

        WasteRequest request;

        switch (type) {
            case "Recyclable":
                request = new RecyclableWaste(id, name, place);
                break;
            case "Non-Recyclable":
                request = new NonRecyclableWaste(id, name, place);
                break;
            default:
                request = new OrganicWaste(id, name, place);
                break;
        }

        GreenCampusWasteManagement.requests.add(request);
        GreenCampusWasteManagement.saveRequests();

        refreshTable();

        JOptionPane.showMessageDialog(
                this, "Waste request submitted successfully!\n"
                        + "Request ID: " + id);
    }

    private void showAddWorkerDialog() {
        JTextField workerNameField = new JTextField(15);
        JTextField workerIdField = new JTextField(15);

        JPanel form = new JPanel(new GridLayout(2, 2, 10, 12));
        form.add(new JLabel("Worker Name:"));
        form.add(workerNameField);
        form.add(new JLabel("Worker ID (e.g. W103):"));
        form.add(workerIdField);

        int result = JOptionPane.showConfirmDialog(
                this, form, "Add New Worker",
                JOptionPane.OK_CANCEL_OPTION,
                JOptionPane.PLAIN_MESSAGE);

        if (result != JOptionPane.OK_OPTION) {
            return;
        }

        String name = workerNameField.getText().trim();
        String id = workerIdField.getText().trim();

        if (name.isEmpty() || id.isEmpty()) {
            JOptionPane.showMessageDialog(
                    this, "Please enter both worker name and worker ID.");
            return;
        }

        if (name.contains("|") || id.contains("|")) {
            JOptionPane.showMessageDialog(
                    this, "Name and ID cannot contain the | character.");
            return;
        }

        boolean added = GreenCampusWasteManagement.addWorker(name, id);

        if (added) {
            JOptionPane.showMessageDialog(
                    this, "Worker added successfully!\n"
                            + "Name: " + name + "\nID: " + id);
        } else {
            JOptionPane.showMessageDialog(
                    this, "This worker ID already exists.",
                    "Duplicate Worker ID", JOptionPane.WARNING_MESSAGE);
        }
    }

    private void showAssignmentDialog() {
        JTextField idField = new JTextField(10);

        JComboBox<String> workers = new JComboBox<>();

        for (Worker worker : GreenCampusWasteManagement.workers) {
            workers.addItem(worker.getId() + " - " + worker.getName());
        }

        JPanel form = new JPanel(new GridLayout(2, 2, 10, 12));
        form.add(new JLabel("Request ID:"));
        form.add(idField);
        form.add(new JLabel("Select worker:"));
        form.add(workers);

        if (workers.getItemCount() == 0) {
            JOptionPane.showMessageDialog(this, "No workers available.");
            return;
        }

        int result = JOptionPane.showConfirmDialog(
                this, form, "Assign Collection Worker",
                JOptionPane.OK_CANCEL_OPTION);

        if (result != JOptionPane.OK_OPTION) {
            return;
        }

        try {
            int id = Integer.parseInt(idField.getText().trim());

            WasteRequest request =
                    GreenCampusWasteManagement.findRequest(id);

            if (request == null) {
                JOptionPane.showMessageDialog(
                        this, "Request ID not found.");
                return;
            }

            String selected = (String) workers.getSelectedItem();
            String workerName = selected.substring(
                    selected.indexOf(" - ") + 3);

            request.assignWorker(workerName);
            request.updateStatus("In Progress");

            GreenCampusWasteManagement.saveRequests();
            refreshTable();

            JOptionPane.showMessageDialog(
                    this, "Worker assigned successfully!");

        } catch (NumberFormatException ex) {
            JOptionPane.showMessageDialog(
                    this, "Enter a valid request ID.");
        }
    }

    private void showStatusDialog() {
        JTextField idField = new JTextField(10);

        JComboBox<String> status = new JComboBox<>(
                new String[]{
                        "Pending",
                        "In Progress",
                        "Collected"
                });

        JPanel form = new JPanel(new GridLayout(2, 2, 10, 12));
        form.add(new JLabel("Request ID:"));
        form.add(idField);
        form.add(new JLabel("New status:"));
        form.add(status);

        int result = JOptionPane.showConfirmDialog(
                this, form, "Update Collection Status",
                JOptionPane.OK_CANCEL_OPTION);

        if (result != JOptionPane.OK_OPTION) {
            return;
        }

        try {
            int id = Integer.parseInt(idField.getText().trim());

            WasteRequest request =
                    GreenCampusWasteManagement.findRequest(id);

            if (request == null) {
                JOptionPane.showMessageDialog(
                        this, "Request ID not found.");
                return;
            }

            if (request.getAssignedWorker().equals("Not Assigned")) {
                JOptionPane.showMessageDialog(
                        this, "Assign a worker before updating status.");
                return;
            }

            request.updateStatus((String) status.getSelectedItem());

            GreenCampusWasteManagement.saveRequests();
            refreshTable();

            JOptionPane.showMessageDialog(
                    this, "Status updated successfully!");

        } catch (NumberFormatException ex) {
            JOptionPane.showMessageDialog(
                    this, "Enter a valid request ID.");
        }
    }

    private void showTrackRequestDialog() {
        JTextField idField = new JTextField(10);

        int result = JOptionPane.showConfirmDialog(
                this,
                idField,
                "Enter Request ID to Track",
                JOptionPane.OK_CANCEL_OPTION,
                JOptionPane.QUESTION_MESSAGE
        );

        if (result != JOptionPane.OK_OPTION) {
            return;
        }

        try {
            int id = Integer.parseInt(idField.getText().trim());
            WasteRequest request =
                    GreenCampusWasteManagement.findRequest(id);

            if (request == null) {
                JOptionPane.showMessageDialog(
                        this,
                        "Request ID not found. Please check the ID and try again.",
                        "Tracking Result",
                        JOptionPane.WARNING_MESSAGE
                );
                return;
            }

            String details = "Request ID: " + request.getRequestId()
                    + "\nReporter: " + request.userName
                    + "\nLocation: " + request.location
                    + "\nCategory: " + request.getCategory()
                    + "\nAssigned Worker: " + request.getAssignedWorker()
                    + "\nStatus: " + request.getStatus();

            JOptionPane.showMessageDialog(
                    this,
                    details,
                    "Request Tracking Details",
                    JOptionPane.INFORMATION_MESSAGE
            );

        } catch (NumberFormatException ex) {
            JOptionPane.showMessageDialog(
                    this,
                    "Please enter a valid numeric Request ID.",
                    "Invalid Request ID",
                    JOptionPane.ERROR_MESSAGE
            );
        }
    }

    private void refreshTable() {
        tableModel.setRowCount(0);

        int total = 0;
        int pending = 0;
        int inProgress = 0;
        int collected = 0;

        for (WasteRequest request :
                GreenCampusWasteManagement.requests) {

            tableModel.addRow(new Object[]{
                    request.getRequestId(),
                    request.userName,
                    request.location,
                    request.getCategory(),
                    request.getAssignedWorker(),
                    request.getStatus()
            });

            total++;

            switch (request.getStatus()) {
                case "Pending":
                    pending++;
                    break;
                case "In Progress":
                    inProgress++;
                    break;
                case "Collected":
                    collected++;
                    break;
            }
        }

        updateStat("TOTAL REQUESTS", total);
        updateStat("PENDING", pending);
        updateStat("IN PROGRESS", inProgress);
        updateStat("COLLECTED", collected);
    }

    private void updateStat(String title, int value) {
        // Find the dashboard cards and update their displayed values.
        Container root = getContentPane();
        updateLabels(root, title, String.valueOf(value));
    }

    private void updateLabels(
            Container container, String title, String value) {

        for (Component component : container.getComponents()) {
            if (component instanceof JLabel) {
                JLabel label = (JLabel) component;

                if (title.equals(label.getName())) {
                    label.setText(value);
                }
            }

            if (component instanceof Container) {
                updateLabels((Container) component, title, value);
            }
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            GreenCampusWasteManagement.loadWorkers();
            GreenCampusWasteManagement.loadRequests();

            if (GreenCampusWasteManagement.workers.isEmpty()) {
                GreenCampusWasteManagement.workers.add(
                        new Worker("Rahul", "W101"));

                GreenCampusWasteManagement.workers.add(
                        new Worker("Priya", "W102"));

                GreenCampusWasteManagement.saveWorkers();
            }

            new GreenCampusGUI();
        });
    }
}
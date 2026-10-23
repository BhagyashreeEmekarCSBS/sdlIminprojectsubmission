
package mini;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.util.ArrayList;

public class project extends JFrame{

    private JTextField nameField;
    private JTextField memberIdField;
    private JComboBox<String> roleBox;
    private JComboBox<String> categoryBox;
    private JTextArea descriptionArea;

    private DefaultTableModel tableModel;
    private JTable complaintTable;

    private ArrayList<complaint> complaints = new ArrayList<>();
    private int nextComplaintId = 1001;

    public project() {
        setTitle("Smart Campus Complaint Management System");
        setSize(1000, 650);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);

        JPanel mainPanel = new JPanel(new BorderLayout(15, 15));
        mainPanel.setBorder(
            BorderFactory.createEmptyBorder(20, 20, 20, 20)
        );
        mainPanel.setBackground(new Color(240, 245, 252));

        JLabel heading = new JLabel(
            "SMART CAMPUS COMPLAINT MANAGEMENT",
            SwingConstants.CENTER
        );
        heading.setFont(new Font("Arial", Font.BOLD, 23));
        heading.setForeground(new Color(23, 59, 112));

        mainPanel.add(heading, BorderLayout.NORTH);

        // Complaint registration form
        JPanel formPanel = new JPanel(new GridLayout(0, 2, 10, 10));
        formPanel.setBorder(
            BorderFactory.createTitledBorder("Register Complaint")
        );
        formPanel.setBackground(Color.WHITE);

        nameField = new JTextField();
        memberIdField = new JTextField();

        roleBox = new JComboBox<>(
            new String[]{"Student", "Staff"}
        );

        categoryBox = new JComboBox<>(new String[]{
            "Classroom", "Laboratory", "Electricity",
            "Cleanliness", "Water", "Other"
        });

        descriptionArea = new JTextArea(3, 20);
        descriptionArea.setLineWrap(true);
        descriptionArea.setWrapStyleWord(true);

        JButton submitButton = new JButton("Register Complaint");

        formPanel.add(new JLabel("Name:"));
        formPanel.add(nameField);

        formPanel.add(new JLabel("Student/Staff ID:"));
        formPanel.add(memberIdField);

        formPanel.add(new JLabel("Role:"));
        formPanel.add(roleBox);

        formPanel.add(new JLabel("Category:"));
        formPanel.add(categoryBox);

        formPanel.add(new JLabel("Description:"));
        formPanel.add(new JScrollPane(descriptionArea));

        formPanel.add(new JLabel(""));
        formPanel.add(submitButton);

        // Complaint table
        tableModel = new DefaultTableModel(
            new String[]{
                "Complaint ID", "Name", "Role", "Category",
                "Department", "Description", "Status"
            }, 0
        );

        complaintTable = new JTable(tableModel);
        complaintTable.setAutoResizeMode(JTable.AUTO_RESIZE_OFF);

        JScrollPane tableScroll = new JScrollPane(complaintTable);
        tableScroll.setBorder(
            BorderFactory.createTitledBorder("All Complaints")
        );

        JPanel centerPanel = new JPanel(new BorderLayout(10, 15));
        centerPanel.setBackground(new Color(240, 245, 252));
        centerPanel.add(formPanel, BorderLayout.NORTH);
        centerPanel.add(tableScroll, BorderLayout.CENTER);

        mainPanel.add(centerPanel, BorderLayout.CENTER);

        // Action buttons
        JPanel buttonPanel = new JPanel();
        buttonPanel.setBackground(new Color(240, 245, 252));

        JButton trackButton = new JButton("Track Complaint");
        JButton updateButton = new JButton("Update Status");

        buttonPanel.add(trackButton);
        buttonPanel.add(updateButton);

        mainPanel.add(buttonPanel, BorderLayout.SOUTH);

        submitButton.addActionListener(e -> registerComplaint());
        trackButton.addActionListener(e -> trackComplaint());
        updateButton.addActionListener(e -> updateStatus());

        add(mainPanel);
        setVisible(true);
    }

    // Assign department according to category
    private String assignDepartment(String category) {
        switch (category) {
            case "Classroom":
                return "Classroom Maintenance";
            case "Laboratory":
                return "Laboratory Department";
            case "Electricity":
                return "Electrical Department";
            case "Cleanliness":
                return "Housekeeping Department";
            case "Water":
                return "Water Maintenance";
            default:
                return "General Administration";
        }
    }

    // Register complaint
    private void registerComplaint() {
        try {
            String name = nameField.getText().trim();
            String memberId = memberIdField.getText().trim();
            String role = (String) roleBox.getSelectedItem();
            String category = (String) categoryBox.getSelectedItem();
            String description = descriptionArea.getText().trim();

            if (name.isEmpty() || memberId.isEmpty()
                    || description.isEmpty()) {
                throw new IllegalArgumentException(
                    "Please fill in all fields."
                );
            }

            // Polymorphism: parent reference, child objects
            campusMember member;

            if ("Student".equals(role)) {
                member = new student(name, memberId);
            } else {
                member = new staff(name, memberId);
            }

            String department = assignDepartment(category);

            complaint complaint = new complaint(
                nextComplaintId++,
                member,
                category,
                description,
                department
            );

            complaints.add(complaint);

            tableModel.addRow(new Object[]{
                complaint.getComplaintId(),
                member.getName(),
                member.getRole(),
                complaint.getCategory(),
                complaint.getDepartment(),
                complaint.getDescription(),
                complaint.getStatus()
            });

            JOptionPane.showMessageDialog(
                this,
                "Complaint registered successfully!\nComplaint ID: "
                    + complaint.getComplaintId()
            );

            nameField.setText("");
            memberIdField.setText("");
            descriptionArea.setText("");

        } catch (IllegalArgumentException e) {
            JOptionPane.showMessageDialog(this, e.getMessage());
        }
    }

    // Track complaint using its ID
    private void trackComplaint() {
        try {
            String input = JOptionPane.showInputDialog(
                this, "Enter Complaint ID:"
            );

            if (input == null) {
                return;
            }

            int id = Integer.parseInt(input.trim());

            for (complaint complaint : complaints) {
                if (complaint.getComplaintId() == id) {
                    campusMember member = complaint.getComplainant();

                    JOptionPane.showMessageDialog(
                        this,
                        "Complaint ID: " + complaint.getComplaintId()
                        + "\nName: " + member.getName()
                        + "\nRole: " + member.getRole()
                        + "\nCategory: " + complaint.getCategory()
                        + "\nDepartment: " + complaint.getDepartment()
                        + "\nDescription: " + complaint.getDescription()
                        + "\nStatus: " + complaint.getStatus(),
                        "Complaint Details",
                        JOptionPane.INFORMATION_MESSAGE
                    );
                    return;
                }
            }

            JOptionPane.showMessageDialog(
                this, "Complaint not found."
            );

        } catch (NumberFormatException e) {
            JOptionPane.showMessageDialog(
                this, "Please enter a valid numeric Complaint ID."
            );
        }
    }

    // Update status of selected complaint
    private void updateStatus() {
        int row = complaintTable.getSelectedRow();

        if (row == -1) {
            JOptionPane.showMessageDialog(
                this, "Please select a complaint from the table."
            );
            return;
        }

        int modelRow = complaintTable.convertRowIndexToModel(row);
        int id = (int) tableModel.getValueAt(modelRow, 0);

        String[] statuses = {
            "OPEN", "IN_PROGRESS", "RESOLVED"
        };

        String selectedStatus = (String) JOptionPane.showInputDialog(
            this,
            "Select the new complaint status:",
            "Update Status",
            JOptionPane.QUESTION_MESSAGE,
            null,
            statuses,
            statuses[0]
        );

        if (selectedStatus == null) {
            return;
        }

        try {
            complaintStatus status =
                complaintStatus.valueOf(selectedStatus);

            for (complaint complaint : complaints) {
                if (complaint.getComplaintId() == id) {
                    complaint.setStatus(status);

                    tableModel.setValueAt(
                        status, modelRow, 6
                    );

                    JOptionPane.showMessageDialog(
                        this, "Complaint status updated successfully."
                    );
                    return;
                }
            }

        } catch (IllegalArgumentException e) {
            JOptionPane.showMessageDialog(
                this, "Invalid complaint status."
            );
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new project());
    }
}

package com.campus.emergency.ui;

import com.campus.emergency.exception.InvalidIncidentException;
import com.campus.emergency.exception.TeamAssignmentException;
import com.campus.emergency.model.*;
import com.campus.emergency.service.CampusAlertService;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.Random;

public class EmergencyGUI extends JFrame {

    private CampusAlertService alertService;

    // GUI Components
    private JComboBox<IncidentType> typeComboBox;
    private JTextField locationField;
    private JTextArea descriptionArea;
    private JRadioButton highPriorityRadio;
    private JRadioButton standardPriorityRadio;
    private JTextArea alertDisplayArea;

    public EmergencyGUI() {
        alertService = new CampusAlertService();

        // Window Configuration
        setTitle("Campus Emergency & Alert Management System");
        setSize(850, 550);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout(10, 10));

        // Header Panel
        JLabel headerLabel = new JLabel("CAMPUS EMERGENCY DASHBOARD", JLabel.CENTER);
        headerLabel.setFont(new Font("Arial", Font.BOLD, 18));
        headerLabel.setOpaque(true);
        headerLabel.setBackground(new Color(180, 40, 40));
        headerLabel.setForeground(Color.WHITE);
        headerLabel.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));
        add(headerLabel, BorderLayout.NORTH);

        // Left Panel: Incident Reporting Form
        JPanel formPanel = new JPanel(new GridBagLayout());
        formPanel.setBorder(BorderFactory.createTitledBorder("Report New Incident"));
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(5, 5, 5, 5);
        gbc.fill = GridBagConstraints.HORIZONTAL;

        // Dropdown for Incident Type
        gbc.gridx = 0; gbc.gridy = 0;
        formPanel.add(new JLabel("Incident Type:"), gbc);
        typeComboBox = new JComboBox<>(IncidentType.values());
        gbc.gridx = 1; gbc.gridy = 0;
        formPanel.add(typeComboBox, gbc);

        // Input Field for Location
        gbc.gridx = 0; gbc.gridy = 1;
        formPanel.add(new JLabel("Location:"), gbc);
        locationField = new JTextField(15);
        gbc.gridx = 1; gbc.gridy = 1;
        formPanel.add(locationField, gbc);

        // Input Area for Description
        gbc.gridx = 0; gbc.gridy = 2;
        formPanel.add(new JLabel("Description:"), gbc);
        descriptionArea = new JTextArea(3, 15);
        descriptionArea.setLineWrap(true);
        JScrollPane descScroll = new JScrollPane(descriptionArea);
        gbc.gridx = 1; gbc.gridy = 2;
        formPanel.add(descScroll, gbc);

        // Radio Buttons for Priority Selection
        gbc.gridx = 0; gbc.gridy = 3;
        formPanel.add(new JLabel("Priority Level:"), gbc);
        highPriorityRadio = new JRadioButton("High (Critical)");
        standardPriorityRadio = new JRadioButton("Standard", true);
        ButtonGroup priorityGroup = new ButtonGroup();
        priorityGroup.add(highPriorityRadio);
        priorityGroup.add(standardPriorityRadio);

        JPanel radioPanel = new JPanel(new FlowLayout(FlowLayout.LEFT, 0, 0));
        radioPanel.add(standardPriorityRadio);
        radioPanel.add(highPriorityRadio);
        gbc.gridx = 1; gbc.gridy = 3;
        formPanel.add(radioPanel, gbc);

        // Submit Button
        JButton submitButton = new JButton("Submit Alert");
        submitButton.setBackground(new Color(40, 140, 40));
        submitButton.setForeground(Color.WHITE);
        gbc.gridx = 0; gbc.gridy = 4; gbc.gridwidth = 2;
        formPanel.add(submitButton, gbc);

        add(formPanel, BorderLayout.WEST);

        // Right Panel: Active Alerts Display Feed
        JPanel displayPanel = new JPanel(new BorderLayout());
        displayPanel.setBorder(BorderFactory.createTitledBorder("Active Emergency Log"));

        alertDisplayArea = new JTextArea();
        alertDisplayArea.setEditable(false);
        alertDisplayArea.setFont(new Font("Monospaced", Font.PLAIN, 12));
        JScrollPane displayScroll = new JScrollPane(alertDisplayArea);
        displayPanel.add(displayScroll, BorderLayout.CENTER);

        add(displayPanel, BorderLayout.CENTER);

        // Event Handler for Submit Button
        submitButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                handleAlertSubmission();
            }
        });
    }

    private void handleAlertSubmission() {
        try {
            IncidentType selectedType = (IncidentType) typeComboBox.getSelectedItem();
            String location = locationField.getText().trim();
            String description = descriptionArea.getText().trim();
            boolean isHighPriority = highPriorityRadio.isSelected();

            String alertId = "ALT-" + (100 + new Random().nextInt(900));

            // Polymorphism: Instantiating specific alert subclass based on user selection
            EmergencyAlert alert;
            if (isHighPriority) {
                alert = new LifeCriticalAlert(alertId, selectedType, description, location, true);
            } else {
                alert = new StandardAlert(alertId, selectedType, description, location);
            }

            // Invoking service logic
            alertService.logAlert(alert);
            String assignedTeam = alertService.assignResponseTeam(alert);

            // Display logged alert info in UI
            String logEntry = String.format("[%s] Type: %s | Priority: %s\nLocation: %s\nDetails: %s\nAssigned Team: %s\n---------------------------------------------\n",
                    alert.getAlertId(),
                    alert.getIncidentType(),
                    alert.getPriorityLevel(),
                    alert.getLocation(),
                    alert.getDescription().isEmpty() ? "N/A" : alert.getDescription(),
                    assignedTeam);

            alertDisplayArea.append(logEntry);

            // Clear form inputs
            locationField.setText("");
            descriptionArea.setText("");
            standardPriorityRadio.setSelected(true);

            JOptionPane.showMessageDialog(this, "Emergency Alert Logged Successfully!", "Success", JOptionPane.INFORMATION_MESSAGE);

        } catch (InvalidIncidentException | TeamAssignmentException ex) {
            // Trigger exception popup dialog
            JOptionPane.showMessageDialog(this, ex.getMessage(), "Input Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(new Runnable() {
            @Override
            public void run() {
                new EmergencyGUI().setVisible(true);
            }
        });
    }
}
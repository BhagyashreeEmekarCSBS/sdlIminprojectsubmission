package bhumika;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;

public class UserScreen extends JFrame {

    private WasteManager manager;
    private User user;
    private DefaultTableModel tableModel;

    public UserScreen(WasteManager manager, User user) {
        this.manager = manager;
        this.user = user;

        setTitle("User - " + user.name);
        setSize(650, 480);
        setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout(10, 10));

        // ---------- TOP: the form ----------
        JPanel formPanel = new JPanel(new GridLayout(4, 2, 10, 10));
        formPanel.setBorder(BorderFactory.createTitledBorder("Report Waste"));

        JComboBox<String> typeBox = new JComboBox<>(
                new String[]{"Recyclable", "Non-recyclable", "Organic"});
        JComboBox<String> locationBox = new JComboBox<>(
                new String[]{"Library", "Canteen", "Hostel", "Lab"});
        JTextField qtyField = new JTextField();
        JButton submitButton = new JButton("Submit Report");

        formPanel.add(new JLabel("  Waste type:"));
        formPanel.add(typeBox);
        formPanel.add(new JLabel("  Location:"));
        formPanel.add(locationBox);
        formPanel.add(new JLabel("  Quantity (kg):"));
        formPanel.add(qtyField);
        formPanel.add(new JLabel(""));
        formPanel.add(submitButton);

        // ---------- CENTER: the table ----------
        String[] columns = {"Report ID", "Type", "Location", "Qty (kg)", "Status", "Worker"};
        tableModel = new DefaultTableModel(columns, 0);
        JTable table = new JTable(tableModel);
        table.setEnabled(false);   // read-only
        JScrollPane scrollPane = new JScrollPane(table);
        scrollPane.setBorder(BorderFactory.createTitledBorder("My Reports"));

        add(formPanel, BorderLayout.NORTH);
        add(scrollPane, BorderLayout.CENTER);

        // ---------- Button action ----------
        submitButton.addActionListener(e -> {
            double qty;
            try {
                qty = Double.parseDouble(qtyField.getText().trim());
            } catch (NumberFormatException ex) {
                JOptionPane.showMessageDialog(this, "Please enter a valid quantity");
                return;
            }
            if (qty <= 0) {
                JOptionPane.showMessageDialog(this, "Quantity must be more than 0");
                return;
            }

            String location = (String) locationBox.getSelectedItem();
            Waste waste;
            if (typeBox.getSelectedIndex() == 0) {
                waste = new RecyclableWaste(location, qty);
            } else if (typeBox.getSelectedIndex() == 1) {
                waste = new NonRecyclableWaste(location, qty);
            } else {
                waste = new OrganicWaste(location, qty);
            }

            WasteReport report = new WasteReport(user, waste);
            manager.addReport(report);
            manager.saveToFile();

            JOptionPane.showMessageDialog(this,
                    "Report submitted! Your report ID is #" + report.reportId);
            qtyField.setText("");
            refreshTable();
        });

        refreshTable();   // show existing reports when the window opens
        setVisible(true);
    }

    // Clears the table and fills it again with this user's reports
    private void refreshTable() {
        tableModel.setRowCount(0);
        for (WasteReport r : manager.reports) {
            if (r.reportedBy.id.equals(user.id)) {
                String worker = (r.assignedWorker == null) ? "Not assigned" : r.assignedWorker.name;
                tableModel.addRow(new Object[]{
                        r.reportId,
                        r.waste.getClass().getSimpleName(),
                        r.waste.location,
                        r.waste.quantityKg,
                        r.status,
                        worker
                });
            }
        }
    }
}
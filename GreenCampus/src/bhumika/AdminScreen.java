package bhumika;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;

public class AdminScreen extends JFrame {

    private WasteManager manager;
    private DefaultTableModel tableModel;
    private JTable table;

    public AdminScreen(WasteManager manager, Admin admin) {
        this.manager = manager;

        setTitle("Admin - " + admin.name);
        setSize(800, 450);
        setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout(10, 10));

        // ---------- CENTER: table of all reports ----------
        String[] columns = {"Report ID", "Reported By", "Type", "Location", "Qty (kg)", "Status", "Worker"};
        tableModel = new DefaultTableModel(columns, 0);
        table = new JTable(tableModel);
        table.setDefaultEditor(Object.class, null);   // cells can't be edited, but rows can be selected
        JScrollPane scrollPane = new JScrollPane(table);
        scrollPane.setBorder(BorderFactory.createTitledBorder("All Reports (click a row to select it)"));

        // ---------- BOTTOM: assign controls ----------
        JPanel bottomPanel = new JPanel(new FlowLayout());
        bottomPanel.setBorder(BorderFactory.createTitledBorder("Assign Task"));

        JComboBox<String> workerBox = new JComboBox<>();
        for (Worker w : manager.workers.values()) {
            workerBox.addItem(w.id + " - " + w.name);
        }
        JButton assignButton = new JButton("Assign to Worker");
        JButton refreshButton = new JButton("Refresh");

        bottomPanel.add(new JLabel("Worker:"));
        bottomPanel.add(workerBox);
        bottomPanel.add(assignButton);
        bottomPanel.add(refreshButton);

        add(scrollPane, BorderLayout.CENTER);
        add(bottomPanel, BorderLayout.SOUTH);

        // ---------- Button actions ----------
        assignButton.addActionListener(e -> {
            int row = table.getSelectedRow();
            if (row == -1) {
                JOptionPane.showMessageDialog(this, "Please select a report first");
                return;
            }

            int reportId = (Integer) tableModel.getValueAt(row, 0);
            WasteReport report = manager.findReport(reportId);

            if (report.status.equals("Collected")) {
                JOptionPane.showMessageDialog(this, "This waste is already collected");
                return;
            }

            String selected = (String) workerBox.getSelectedItem();
            String workerId = selected.split(" - ")[0];

            manager.assignTask(reportId, workerId);
            manager.saveToFile();
            refreshTable();
            JOptionPane.showMessageDialog(this, "Report #" + reportId + " assigned to " + selected);
        });

        refreshButton.addActionListener(e -> refreshTable());

        refreshTable();
        setVisible(true);
    }

    private void refreshTable() {
        tableModel.setRowCount(0);
        for (WasteReport r : manager.reports) {
            String worker = (r.assignedWorker == null) ? "Not assigned" : r.assignedWorker.name;
            tableModel.addRow(new Object[]{
                    r.reportId,
                    r.reportedBy.name,
                    r.waste.getClass().getSimpleName(),
                    r.waste.location,
                    r.waste.quantityKg,
                    r.status,
                    worker
            });
        }
    }
}
package bhumika;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;

public class WorkerScreen extends JFrame {

    private WasteManager manager;
    private Worker worker;
    private DefaultTableModel tableModel;
    private JTable table;

    public WorkerScreen(WasteManager manager, Worker worker) {
        this.manager = manager;
        this.worker = worker;

        setTitle("Worker - " + worker.name);
        setSize(700, 400);
        setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout(10, 10));

        // ---------- CENTER: my tasks ----------
        String[] columns = {"Report ID", "Type", "Location", "Qty (kg)", "Disposal Method", "Status"};
        tableModel = new DefaultTableModel(columns, 0);
        table = new JTable(tableModel);
        table.setDefaultEditor(Object.class, null);
        JScrollPane scrollPane = new JScrollPane(table);
        scrollPane.setBorder(BorderFactory.createTitledBorder("My Tasks (click a row to select it)"));

        // ---------- BOTTOM: buttons ----------
        JPanel bottomPanel = new JPanel(new FlowLayout());
        JButton collectButton = new JButton("Mark Collected");
        JButton refreshButton = new JButton("Refresh");
        bottomPanel.add(collectButton);
        bottomPanel.add(refreshButton);

        add(scrollPane, BorderLayout.CENTER);
        add(bottomPanel, BorderLayout.SOUTH);

        // ---------- Button actions ----------
        collectButton.addActionListener(e -> {
            int row = table.getSelectedRow();
            if (row == -1) {
                JOptionPane.showMessageDialog(this, "Please select a task first");
                return;
            }

            int reportId = (Integer) tableModel.getValueAt(row, 0);
            WasteReport report = manager.findReport(reportId);

            if (report.status.equals("Collected")) {
                JOptionPane.showMessageDialog(this, "This task is already collected");
                return;
            }

            report.updateStatus("Collected");
            manager.saveToFile();
            refreshTable();
            JOptionPane.showMessageDialog(this, "Report #" + reportId + " marked as Collected");
        });

        refreshButton.addActionListener(e -> refreshTable());

        refreshTable();
        setVisible(true);
    }

    private void refreshTable() {
        tableModel.setRowCount(0);
        for (WasteReport r : manager.reports) {
            if (r.assignedWorker != null && r.assignedWorker.id.equals(worker.id)) {
                tableModel.addRow(new Object[]{
                        r.reportId,
                        r.waste.getClass().getSimpleName(),
                        r.waste.location,
                        r.waste.quantityKg,
                        r.waste.getDisposalMethod(),
                        r.status
                });
            }
        }
    }
}
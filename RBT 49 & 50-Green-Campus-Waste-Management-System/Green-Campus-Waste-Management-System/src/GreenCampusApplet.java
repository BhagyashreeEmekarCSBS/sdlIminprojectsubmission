import java.applet.Applet;
import java.awt.*;
import java.awt.event.*;
import java.util.HashMap;

/** GUI using the Applet life cycle: init() -> start() -> stop() -> destroy(). */
public class GreenCampusApplet extends Applet implements ActionListener {
    WasteManager manager = new WasteManager();

    Choice locChoice, catChoice, workerChoice;
    TextField descField, qtyField, idField;
    Button reportBtn, assignBtn, collectBtn, summaryBtn;
    TextArea display;
    Label msg;

    /** init(): build the user interface once. */
    public void init() {
        setLayout(new BorderLayout(5, 5));

        // ---- Top panel: user reports waste ----
        Panel top = new Panel(new FlowLayout(FlowLayout.LEFT));
        top.add(new Label("REPORT WASTE ->  Location:"));
        locChoice = new Choice();
        for (String s : new String[]{"Library", "Canteen", "Hostel", "Main Block", "Garden", "Sports Ground"})
            locChoice.add(s);
        top.add(locChoice);
        top.add(new Label("Category:"));
        catChoice = new Choice();
        catChoice.add("Recyclable");
        catChoice.add("Non-Recyclable");
        catChoice.add("Organic");
        top.add(catChoice);
        top.add(new Label("Description:"));
        descField = new TextField(14);
        top.add(descField);
        top.add(new Label("Qty (kg):"));
        qtyField = new TextField(4);
        top.add(qtyField);
        reportBtn = new Button("Report");
        top.add(reportBtn);

        // ---- Centre: display of all requests ----
        display = new TextArea();
        display.setEditable(false);
        display.setFont(new Font("Monospaced", Font.PLAIN, 12));

        // ---- Bottom panel: admin tasks ----
        Panel bottom = new Panel(new GridLayout(2, 1));
        Panel admin = new Panel(new FlowLayout(FlowLayout.LEFT));
        admin.add(new Label("ADMIN ->  Request ID:"));
        idField = new TextField(5);
        admin.add(idField);
        admin.add(new Label("Worker:"));
        workerChoice = new Choice();
        for (String w : manager.getWorkers()) workerChoice.add(w);
        admin.add(workerChoice);
        assignBtn = new Button("Assign Task");
        collectBtn = new Button("Mark Collected");
        summaryBtn = new Button("Summary");
        admin.add(assignBtn);
        admin.add(collectBtn);
        admin.add(summaryBtn);
        msg = new Label("Welcome to Green Campus Waste Management System");
        bottom.add(admin);
        bottom.add(msg);

        add(top, BorderLayout.NORTH);
        add(display, BorderLayout.CENTER);
        add(bottom, BorderLayout.SOUTH);

        reportBtn.addActionListener(this);
        assignBtn.addActionListener(this);
        collectBtn.addActionListener(this);
        summaryBtn.addActionListener(this);
    }

    /** start(): applet becomes active -> load saved data from file. */
    public void start() {
        manager.load();
        refresh();
    }

    /** stop(): applet becomes inactive -> save data to file. */
    public void stop() {
        manager.save();
    }

    /** destroy(): final cleanup. */
    public void destroy() {
        manager.save();
    }

    public void actionPerformed(ActionEvent e) {
        Object src = e.getSource();
        try {
            if (src == reportBtn) {
                String desc = descField.getText().trim().replace("|", "/");
                if (desc.isEmpty()) { msg.setText("Please enter a description."); return; }
                double qty = Double.parseDouble(qtyField.getText().trim());
                Waste w = manager.report(catChoice.getSelectedItem(), locChoice.getSelectedItem(), desc, qty);
                msg.setText("Reported! ID " + w.getId() + ". Tip: " + w.getDisposalTip());
                descField.setText("");
                qtyField.setText("");
            } else if (src == assignBtn) {
                msg.setText(manager.assign(Integer.parseInt(idField.getText().trim()), workerChoice.getSelectedItem()));
            } else if (src == collectBtn) {
                msg.setText(manager.collect(Integer.parseInt(idField.getText().trim())));
            } else if (src == summaryBtn) {
                HashMap<String, Double> map = manager.summary();
                msg.setText(map.isEmpty() ? "No data yet." : "Total kg by category: " + map);
            }
        } catch (NumberFormatException ex) {
            msg.setText("Please enter valid numbers for ID / quantity.");
        }
        refresh();
    }

    private void refresh() {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("%-5s %-14s %-12s %-20s %9s  %-10s %s%n",
                "ID", "CATEGORY", "LOCATION", "DESCRIPTION", "QTY", "STATUS", "WORKER"));
        sb.append("-------------------------------------------------------------------------------------\n");
        for (Waste w : manager.getAll()) sb.append(w).append("\n");   // polymorphic toString()
        display.setText(sb.toString());
    }

    /** main(): modern JDKs have no appletviewer, so we host the applet in a Frame. */
    public static void main(String[] args) {
        Frame frame = new Frame("Green Campus Waste Management System");
        GreenCampusApplet applet = new GreenCampusApplet();
        frame.add(applet);
        applet.init();
        frame.setSize(900, 500);
        frame.setVisible(true);
        applet.start();
        frame.addWindowListener(new WindowAdapter() {
            public void windowClosing(WindowEvent e) {
                applet.stop();
                applet.destroy();
                frame.dispose();
                System.exit(0);
            }
        });
    }
}

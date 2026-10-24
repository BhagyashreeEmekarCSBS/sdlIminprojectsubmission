package bhumika;

import javax.swing.*;
import java.awt.*;

public class AppWindow {

    static WasteManager manager = new WasteManager();

    public static void main(String[] args) {
        // Workers must be added BEFORE loading
        manager.addWorker(new Worker("W301", "Ramesh"));
        manager.addWorker(new Worker("W302", "Suresh"));
        manager.loadFromFile();

        JFrame frame = new JFrame("Green Campus Waste Management");
        frame.setSize(400, 250);
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setLocationRelativeTo(null);
        frame.setLayout(new GridLayout(4, 2, 10, 10));

        JLabel roleLabel = new JLabel("  Role:");
        JComboBox<String> roleBox = new JComboBox<>(new String[]{"User", "Admin", "Worker"});

        JLabel idLabel = new JLabel("  ID:");
        JTextField idField = new JTextField();

        JLabel nameLabel = new JLabel("  Name:");
        JTextField nameField = new JTextField();

        JButton loginButton = new JButton("Login");

        loginButton.addActionListener(e -> {
            String role = (String) roleBox.getSelectedItem();
            String id = idField.getText().trim().replace(",", "");
            String name = nameField.getText().trim().replace(",", "");

            if (id.isEmpty()) {
                JOptionPane.showMessageDialog(frame, "Please enter your ID");
                return;
            }
            if (name.isEmpty()) {
                name = id;
            }

            if (role.equals("User")) {
                new UserScreen(manager, new User(id, name));
            } else if (role.equals("Admin")) {
                new AdminScreen(manager, new Admin(id, name));
            } else {
                Worker w = manager.workers.get(id);
                if (w == null) {
                    JOptionPane.showMessageDialog(frame,
                            "Worker ID not found. Use W301 or W302");
                    return;
                }
                new WorkerScreen(manager, w);
            }
        });

        frame.add(roleLabel);
        frame.add(roleBox);
        frame.add(idLabel);
        frame.add(idField);
        frame.add(nameLabel);
        frame.add(nameField);
        frame.add(new JLabel(""));
        frame.add(loginButton);

        frame.setVisible(true);
    }
}
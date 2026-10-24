import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.List;

/*
 * Smart Library & Resource Sharing System  (Swing GUI, ONE FILE)
 * File name must be: LibraryGUI.java   |   Run this file: LibraryGUI
 * Demo logins -> Librarian: L01 / admin123   Student: S01 / pass1
 *
 * Layout of this file:
 *   PART 1 : LibraryGUI  (screens, buttons, tables)   <- has main()
 *   PART 2 : Model classes (Resource, Book, Student, Library ...)
 */

// ===================== PART 1 : GUI =====================
public class LibraryGUI extends JFrame {

    // A small interface so every button action can share one error-handling method
    interface Task {
        String run() throws LibraryException;
    }

    private final Library library = SampleData.create();   // the model
    private final CardLayout cards = new CardLayout();      // switches between screens
    private final JPanel root = new JPanel(cards);
    private Student currentStudent;

    // ---- login screen widgets ----
    private JComboBox<String> roleBox;
    private JTextField idField;
    private JPasswordField pwdField;

    // ---- student screen widgets ----
    private JLabel studentWelcome, studentDate, fineLabel;
    private JTextField searchField;
    private JComboBox<String> typeBox;
    private JCheckBox availableOnly;
    private DefaultTableModel resourceModel, loanModel;
    private JTable resourceTable, loanTable;

    // ---- librarian screen widgets ----
    private JLabel libDate;
    private DefaultTableModel invModel, memberModel, reportModel;
    private JTable invTable, memberTable;

    public LibraryGUI() {
        super("Smart Library & Resource Sharing System");
        root.add(buildLoginPanel(), "LOGIN");
        root.add(buildStudentPanel(), "STUDENT");
        root.add(buildLibrarianPanel(), "LIBRARIAN");
        add(root);

        setSize(900, 560);
        setLocationRelativeTo(null);                 // centre of screen
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        cards.show(root, "LOGIN");
    }

    // =================================================================
    // SCREEN 1 : LOGIN
    // =================================================================
    private JPanel buildLoginPanel() {
        JPanel outer = new JPanel(new GridBagLayout());          // centres its content

        JLabel title = new JLabel("Smart Library System", SwingConstants.CENTER);
        title.setFont(new Font("SansSerif", Font.BOLD, 24));

        roleBox = new JComboBox<>(new String[]{"Student", "Librarian"});
        idField = new JTextField(15);
        pwdField = new JPasswordField(15);
        JButton loginBtn = new JButton("Login");

        JPanel form = new JPanel(new GridLayout(0, 2, 8, 8));
        form.add(new JLabel("Login as:"));  form.add(roleBox);
        form.add(new JLabel("User ID:"));   form.add(idField);
        form.add(new JLabel("Password:"));  form.add(pwdField);

        JLabel hint = new JLabel("Demo: S01/pass1 (student)   L01/admin123 (librarian)",
                SwingConstants.CENTER);
        hint.setForeground(Color.GRAY);

        JPanel box = new JPanel(new BorderLayout(10, 15));
        box.setBorder(BorderFactory.createEmptyBorder(20, 30, 20, 30));
        box.add(title, BorderLayout.NORTH);
        box.add(form, BorderLayout.CENTER);
        JPanel south = new JPanel(new GridLayout(2, 1, 5, 8));
        south.add(loginBtn);
        south.add(hint);
        box.add(south, BorderLayout.SOUTH);
        outer.add(box);

        // EVENT HANDLING: code that runs when the button is clicked
        loginBtn.addActionListener(e -> doLogin());
        pwdField.addActionListener(e -> doLogin());               // Enter key also logs in
        return outer;
    }

    private void doLogin() {
        String role = (String) roleBox.getSelectedItem();
        User u = library.login(idField.getText().trim(),
                new String(pwdField.getPassword()), role);
        if (u == null) {
            JOptionPane.showMessageDialog(this, "Invalid ID, password or role.",
                    "Login failed", JOptionPane.ERROR_MESSAGE);
            return;
        }
        pwdField.setText("");
        // Polymorphism: u is a User, but it may really be a Student or a Librarian
        if (u instanceof Student) {
            currentStudent = (Student) u;
            studentWelcome.setText("Welcome, " + u.getName() + " (Student)");
            refreshStudent();
            cards.show(root, "STUDENT");
        } else {
            refreshLibrarian();
            cards.show(root, "LIBRARIAN");
        }
    }

    private void logout() {
        currentStudent = null;
        idField.setText("");
        cards.show(root, "LOGIN");
    }

    // =================================================================
    // SCREEN 2 : STUDENT
    // =================================================================
    private JPanel buildStudentPanel() {
        JPanel panel = new JPanel(new BorderLayout());

        studentWelcome = new JLabel();
        studentWelcome.setFont(new Font("SansSerif", Font.BOLD, 16));
        studentDate = new JLabel();
        panel.add(buildHeader(studentWelcome, studentDate), BorderLayout.NORTH);

        // ----- Tab 1 : Browse & Search -----
        searchField = new JTextField(18);
        typeBox = new JComboBox<>(new String[]{"All", "Book", "E-Book", "Journal", "Project"});
        availableOnly = new JCheckBox("Only available");
        JButton searchBtn = new JButton("Search");

        JPanel searchBar = new JPanel(new FlowLayout(FlowLayout.LEFT));
        searchBar.add(new JLabel("Keyword:"));
        searchBar.add(searchField);
        searchBar.add(typeBox);
        searchBar.add(availableOnly);
        searchBar.add(searchBtn);

        resourceModel = newModel("ID", "Type", "Title", "Author", "Available", "Details");
        resourceTable = new JTable(resourceModel);

        JButton issueBtn = new JButton("Issue Selected");
        JButton reserveBtn = new JButton("Reserve Selected");
        JPanel browseButtons = new JPanel();
        browseButtons.add(issueBtn);
        browseButtons.add(reserveBtn);

        JPanel browse = new JPanel(new BorderLayout());
        browse.add(searchBar, BorderLayout.NORTH);
        browse.add(new JScrollPane(resourceTable), BorderLayout.CENTER);
        browse.add(browseButtons, BorderLayout.SOUTH);

        // ----- Tab 2 : My Loans -----
        loanModel = newModel("ID", "Type", "Title", "Due Date", "Renewals", "Status");
        loanTable = new JTable(loanModel);

        JButton returnBtn = new JButton("Return Selected");
        JButton renewBtn = new JButton("Renew Selected");
        JButton payBtn = new JButton("Pay Fine");
        fineLabel = new JLabel();
        JPanel loanButtons = new JPanel();
        loanButtons.add(returnBtn);
        loanButtons.add(renewBtn);
        loanButtons.add(payBtn);
        loanButtons.add(fineLabel);

        JPanel loans = new JPanel(new BorderLayout());
        loans.add(new JScrollPane(loanTable), BorderLayout.CENTER);
        loans.add(loanButtons, BorderLayout.SOUTH);

        JTabbedPane tabs = new JTabbedPane();
        tabs.addTab("Browse & Search", browse);
        tabs.addTab("My Loans", loans);
        panel.add(tabs, BorderLayout.CENTER);

        // ----- button actions -----
        searchBtn.addActionListener(e -> refreshStudent());
        searchField.addActionListener(e -> refreshStudent());
        issueBtn.addActionListener(e -> {
            String id = selectedId(resourceTable);
            if (id != null) perform(() -> library.issue(currentStudent, id));
        });
        reserveBtn.addActionListener(e -> {
            String id = selectedId(resourceTable);
            if (id != null) perform(() -> library.reserve(currentStudent, id));
        });
        returnBtn.addActionListener(e -> {
            String id = selectedId(loanTable);
            if (id != null) perform(() -> library.returnResource(currentStudent, id));
        });
        renewBtn.addActionListener(e -> {
            String id = selectedId(loanTable);
            if (id != null) perform(() -> library.renew(currentStudent, id));
        });
        payBtn.addActionListener(e -> perform(() -> {
            double amt = currentStudent.getFineDue();
            if (amt == 0) throw new LibraryException("You have no pending fine.");
            currentStudent.clearFine();
            return "Paid Rs." + amt;
        }));
        return panel;
    }

    private void refreshStudent() {
        if (currentStudent == null) return;
        studentDate.setText("Date: " + library.getToday());

        // 1) search results (uses the OVERLOADED search methods)
        String keyword = searchField.getText().trim();
        String type = (String) typeBox.getSelectedItem();
        List<Resource> found = type.equals("All")
                ? library.search(keyword)
                : library.search(keyword, type);
        resourceModel.setRowCount(0);
        for (Resource r : found) {
            if (availableOnly.isSelected() && !r.isAvailable()) continue;
            resourceModel.addRow(new Object[]{r.getId(), r.getType(), r.getTitle(),
                    r.getAuthor(), r.availabilityText(), r.getDetails()});
        }

        // 2) the student's own loans
        loanModel.setRowCount(0);
        for (Loan l : currentStudent.getLoans()) {
            String status = library.getToday().isAfter(l.getDueDate()) ? "OVERDUE" : "OK";
            Resource r = l.getResource();
            loanModel.addRow(new Object[]{r.getId(), r.getType(), r.getTitle(),
                    l.getDueDate(), l.getRenewCount(), status});
        }
        fineLabel.setText("   Pending fine: Rs." + currentStudent.getFineDue());
    }

    // =================================================================
    // SCREEN 3 : LIBRARIAN
    // =================================================================
    private JPanel buildLibrarianPanel() {
        JPanel panel = new JPanel(new BorderLayout());

        JLabel welcome = new JLabel("Librarian Dashboard");
        welcome.setFont(new Font("SansSerif", Font.BOLD, 16));
        libDate = new JLabel();
        panel.add(buildHeader(welcome, libDate), BorderLayout.NORTH);

        // ----- Tab 1 : Inventory -----
        invModel = newModel("ID", "Type", "Title", "Author", "Available", "Details");
        invTable = new JTable(invModel);
        JButton addRes = new JButton("Add Resource");
        JButton removeRes = new JButton("Remove Selected");
        JButton addCopies = new JButton("Add Copies");
        JPanel invButtons = new JPanel();
        invButtons.add(addRes);
        invButtons.add(addCopies);
        invButtons.add(removeRes);
        JPanel inventory = new JPanel(new BorderLayout());
        inventory.add(new JScrollPane(invTable), BorderLayout.CENTER);
        inventory.add(invButtons, BorderLayout.SOUTH);

        // ----- Tab 2 : Members -----
        memberModel = newModel("Student ID", "Name", "Items Borrowed", "Pending Fine (Rs.)");
        memberTable = new JTable(memberModel);
        JButton addStu = new JButton("Add Student");
        JButton removeStu = new JButton("Remove Selected");
        JButton addLib = new JButton("Add Librarian");
        JPanel memButtons = new JPanel();
        memButtons.add(addStu);
        memButtons.add(addLib);
        memButtons.add(removeStu);
        JPanel members = new JPanel(new BorderLayout());
        members.add(new JScrollPane(memberTable), BorderLayout.CENTER);
        members.add(memButtons, BorderLayout.SOUTH);

        // ----- Tab 3 : Issued items report -----
        reportModel = newModel("Student", "Resource ID", "Title", "Due Date", "Status");
        JButton advance = new JButton("Advance Date (demo fines)");
        JPanel repButtons = new JPanel();
        repButtons.add(advance);
        JPanel report = new JPanel(new BorderLayout());
        report.add(new JScrollPane(new JTable(reportModel)), BorderLayout.CENTER);
        report.add(repButtons, BorderLayout.SOUTH);

        JTabbedPane tabs = new JTabbedPane();
        tabs.addTab("Inventory", inventory);
        tabs.addTab("Members", members);
        tabs.addTab("Issued Items", report);
        panel.add(tabs, BorderLayout.CENTER);

        // ----- button actions -----
        addRes.addActionListener(e -> addResourceDialog());
        removeRes.addActionListener(e -> {
            String id = selectedId(invTable);
            if (id != null) perform(() -> {
                library.removeResource(id);
                return "Resource removed.";
            });
        });
        addCopies.addActionListener(e -> {
            String id = selectedId(invTable);
            if (id == null) return;
            String input = JOptionPane.showInputDialog(this, "Number of copies to add:");
            if (input == null) return;
            perform(() -> {
                Resource r = library.getResource(id);
                r.addCopies(Integer.parseInt(input.trim()));
                return "Copies updated. Now: " + r.availabilityText();
            });
        });
        addStu.addActionListener(e -> addStudentDialog());
        addLib.addActionListener(e -> addLibrarianDialog());
        removeStu.addActionListener(e -> {
            String id = selectedId(memberTable);
            if (id != null) perform(() -> {
                library.removeStudent(id);
                return "Student removed.";
            });
        });
        advance.addActionListener(e -> {
            String input = JOptionPane.showInputDialog(this, "Advance system date by how many days?");
            if (input == null) return;
            perform(() -> {
                library.advanceDays(Integer.parseInt(input.trim()));
                return "Date is now " + library.getToday();
            });
        });
        return panel;
    }

    private void refreshLibrarian() {
        libDate.setText("Date: " + library.getToday());

        invModel.setRowCount(0);
        for (Resource r : library.allResources())
            invModel.addRow(new Object[]{r.getId(), r.getType(), r.getTitle(),
                    r.getAuthor(), r.availabilityText(), r.getDetails()});

        memberModel.setRowCount(0);
        reportModel.setRowCount(0);
        for (User u : library.allUsers()) {
            if (!(u instanceof Student)) continue;
            Student s = (Student) u;
            memberModel.addRow(new Object[]{s.getId(), s.getName(),
                    s.getLoans().size(), s.getFineDue()});
            for (Loan l : s.getLoans()) {
                String status = library.getToday().isAfter(l.getDueDate()) ? "OVERDUE" : "OK";
                reportModel.addRow(new Object[]{s.getName(), l.getResource().getId(),
                        l.getResource().getTitle(), l.getDueDate(), status});
            }
        }
    }

    private void addResourceDialog() {
        JComboBox<String> type = new JComboBox<>(new String[]{"Book", "E-Book", "Journal", "Project"});
        JTextField id = new JTextField(), title = new JTextField(), author = new JTextField();
        JTextField copies = new JTextField("1"), extra = new JTextField(), year = new JTextField("2024");

        JPanel p = new JPanel(new GridLayout(0, 2, 5, 5));
        p.add(new JLabel("Type:"));          p.add(type);
        p.add(new JLabel("ID:"));            p.add(id);
        p.add(new JLabel("Title:"));         p.add(title);
        p.add(new JLabel("Author:"));        p.add(author);
        p.add(new JLabel("Copies:"));        p.add(copies);
        p.add(new JLabel("Shelf / Format / Issue No / Department:"));
        p.add(extra);
        p.add(new JLabel("Year (Project only):"));
        p.add(year);

        int ok = JOptionPane.showConfirmDialog(this, p, "Add Resource",
                JOptionPane.OK_CANCEL_OPTION, JOptionPane.PLAIN_MESSAGE);
        if (ok != JOptionPane.OK_OPTION) return;

        perform(() -> {
            String i = id.getText().trim(), t = title.getText().trim(), a = author.getText().trim();
            String x = extra.getText().trim();
            if (i.isEmpty() || t.isEmpty()) throw new LibraryException("ID and Title are required.");
            int n = Integer.parseInt(copies.getText().trim());
            Resource r;
            switch (type.getSelectedIndex()) {
                case 0:  r = new Book(i, t, a, n, x.isEmpty() ? "General" : x); break;
                case 1:  r = new EBook(i, t, a, x.isEmpty() ? "PDF" : x); break;
                case 2:  r = new Journal(i, t, a, n, x); break;
                default: r = new ProjectResource(i, t, a, n, x, Integer.parseInt(year.getText().trim()));
            }
            library.addResource(r);
            return "Resource added.";
        });
    }

    private void addStudentDialog() {
        JTextField id = new JTextField(), name = new JTextField(), pwd = new JTextField();
        JPanel p = new JPanel(new GridLayout(0, 2, 5, 5));
        p.add(new JLabel("Student ID:"));  p.add(id);
        p.add(new JLabel("Name:"));        p.add(name);
        p.add(new JLabel("Password:"));    p.add(pwd);
        int ok = JOptionPane.showConfirmDialog(this, p, "Add Student",
                JOptionPane.OK_CANCEL_OPTION, JOptionPane.PLAIN_MESSAGE);
        if (ok != JOptionPane.OK_OPTION) return;
        perform(() -> {
            if (id.getText().trim().isEmpty() || name.getText().trim().isEmpty())
                throw new LibraryException("ID and Name are required.");
            library.addUser(new Student(id.getText().trim(), name.getText().trim(), pwd.getText().trim()));
            return "Student added.";
        });
    }

    private void addLibrarianDialog() {
        JTextField id = new JTextField(), name = new JTextField();
        JPasswordField pwd = new JPasswordField();
        JPanel p = new JPanel(new GridLayout(0, 2, 5, 5));
        p.add(new JLabel("Librarian ID:"));  p.add(id);
        p.add(new JLabel("Name:"));          p.add(name);
        p.add(new JLabel("Password:"));      p.add(pwd);
        int ok = JOptionPane.showConfirmDialog(this, p, "Add Librarian",
                JOptionPane.OK_CANCEL_OPTION, JOptionPane.PLAIN_MESSAGE);
        if (ok != JOptionPane.OK_OPTION) return;
        perform(() -> {
            String pw = new String(pwd.getPassword()).trim();
            if (id.getText().trim().isEmpty() || name.getText().trim().isEmpty() || pw.isEmpty())
                throw new LibraryException("ID, Name and Password are required.");
            library.addUser(new Librarian(id.getText().trim(), name.getText().trim(), pw));
            return "Librarian added. They can now log in using the role 'Librarian'.";
        });
    }

    // =================================================================
    // HELPERS used by all screens
    // =================================================================

    /** Runs an action, shows success/error popup, then refreshes the tables. */
    private void perform(Task task) {
        try {
            String message = task.run();
            if (message != null)
                JOptionPane.showMessageDialog(this, message, "Done", JOptionPane.INFORMATION_MESSAGE);
        } catch (LibraryException ex) {
            JOptionPane.showMessageDialog(this, ex.getMessage(), "Error", JOptionPane.ERROR_MESSAGE);
        } catch (NumberFormatException ex) {
            JOptionPane.showMessageDialog(this, "Please enter a valid number.",
                    "Error", JOptionPane.ERROR_MESSAGE);
        }
        refreshStudent();
        refreshLibrarian();
    }

    /** Returns the ID (first column) of the selected table row, or null with a warning. */
    private String selectedId(JTable table) {
        int row = table.getSelectedRow();
        if (row < 0) {
            JOptionPane.showMessageDialog(this, "Please select a row first.",
                    "No selection", JOptionPane.WARNING_MESSAGE);
            return null;
        }
        return table.getValueAt(row, 0).toString();
    }

    /** Table model whose cells cannot be edited by the user. */
    private DefaultTableModel newModel(String... columns) {
        return new DefaultTableModel(columns, 0) {
            @Override public boolean isCellEditable(int r, int c) { return false; }
        };
    }

    private JPanel buildHeader(JLabel left, JLabel dateLabel) {
        JButton logoutBtn = new JButton("Logout");
        logoutBtn.addActionListener(e -> logout());
        JPanel right = new JPanel(new FlowLayout(FlowLayout.RIGHT));
        right.add(dateLabel);
        right.add(logoutBtn);
        JPanel header = new JPanel(new BorderLayout());
        header.setBorder(BorderFactory.createEmptyBorder(8, 12, 8, 12));
        header.add(left, BorderLayout.WEST);
        header.add(right, BorderLayout.EAST);
        return header;
    }

    // =================================================================
    // PROGRAM STARTS HERE
    // =================================================================
    public static void main(String[] args) {
        // Swing programs must be started on the Event Dispatch Thread
        SwingUtilities.invokeLater(() -> {
            try {
                UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
            } catch (Exception ignored) { }
            new LibraryGUI().setVisible(true);
        });
    }
}


// ===================== PART 2 : MODEL / LOGIC =====================


// =====================================================================
// 1. CUSTOM EXCEPTION  (Unit II - exception handling)
// =====================================================================
class LibraryException extends Exception {
    public LibraryException(String message) {
        super(message);
    }
}

// =====================================================================
// 2. INTERFACES  (contracts that resources must follow)
// =====================================================================
interface Issuable {
    int getLoanDays();          // how many days a resource can be kept
    double getFinePerDay();     // fine per late day
    boolean isRenewable();      // can the loan be extended?
}

interface Searchable {
    boolean matches(String keyword);
}

// =====================================================================
// 3. RESOURCE HIERARCHY  (abstract class + inheritance + overriding)
// =====================================================================
abstract class Resource implements Issuable, Searchable {
    // Encapsulation: all data is private, accessed through methods
    private final String id;
    private final String title;
    private final String author;
    private int totalCopies;
    private int availableCopies;

    protected Resource(String id, String title, String author, int copies) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.totalCopies = copies;
        this.availableCopies = copies;
    }

    public String getId()     { return id; }
    public String getTitle()  { return title; }
    public String getAuthor() { return author; }

    // Abstract methods: every subclass MUST define these
    public abstract String getType();
    protected abstract String extraInfo();

    public void addCopies(int n) throws LibraryException {
        if (n <= 0) throw new LibraryException("Number of copies must be positive.");
        totalCopies += n;
        availableCopies += n;
    }

    public boolean isAvailable()                    { return availableCopies > 0; }
    public boolean isAvailableFor(int reservedAhead) { return availableCopies > reservedAhead; }
    public boolean allCopiesInLibrary()             { return availableCopies == totalCopies; }
    public void checkOut()                          { availableCopies--; }
    public void checkIn()                           { availableCopies++; }
    public String availabilityText()                { return availableCopies + "/" + totalCopies; }
    public String getDetails()                      { return extraInfo(); }

    // METHOD OVERLOADING: same name, different parameters
    public double calculateFine(int daysLate) {
        return daysLate > 0 ? daysLate * getFinePerDay() : 0;
    }

    public double calculateFine(LocalDate dueDate, LocalDate returnDate) {
        return calculateFine((int) ChronoUnit.DAYS.between(dueDate, returnDate));
    }

    @Override
    public boolean matches(String keyword) {
        String k = keyword.toLowerCase();
        return title.toLowerCase().contains(k)
                || author.toLowerCase().contains(k)
                || id.equalsIgnoreCase(keyword);
    }

    @Override
    public String toString() {
        return String.format("%-6s %-10s %-30s %-18s %-10s %s",
                id, getType(), title, author, availabilityText(), extraInfo());
    }
}

class Book extends Resource {
    private final String shelf;

    public Book(String id, String title, String author, int copies, String shelf) {
        super(id, title, author, copies);
        this.shelf = shelf;
    }

    // Overloaded constructor
    public Book(String id, String title, String author, int copies) {
        this(id, title, author, copies, "General");
    }

    @Override public String getType()      { return "Book"; }
    @Override public int getLoanDays()     { return 14; }
    @Override public double getFinePerDay(){ return 2.0; }
    @Override public boolean isRenewable() { return true; }
    @Override protected String extraInfo() { return "Shelf: " + shelf; }
}

class EBook extends Resource {
    private final String format;

    public EBook(String id, String title, String author, String format) {
        super(id, title, author, 1);
        this.format = format;
    }

    @Override public String getType()      { return "E-Book"; }
    @Override public int getLoanDays()     { return 7; }
    @Override public double getFinePerDay(){ return 0.0; }   // access simply expires
    @Override public boolean isRenewable() { return true; }
    @Override protected String extraInfo() { return "Format: " + format; }

    // Overriding: digital copies never run out
    @Override public boolean isAvailable()                     { return true; }
    @Override public boolean isAvailableFor(int reservedAhead) { return true; }
    @Override public void checkOut()                           { }
    @Override public void checkIn()                            { }
    @Override public String availabilityText()                 { return "Unlimited"; }
}

class Journal extends Resource {
    private final String issueNo;

    public Journal(String id, String title, String author, int copies, String issueNo) {
        super(id, title, author, copies);
        this.issueNo = issueNo;
    }

    @Override public String getType()      { return "Journal"; }
    @Override public int getLoanDays()     { return 3; }       // short loan
    @Override public double getFinePerDay(){ return 5.0; }     // higher fine
    @Override public boolean isRenewable() { return false; }   // in high demand
    @Override protected String extraInfo() { return "Issue: " + issueNo; }

    // Overriding: journals can also be found by issue number
    @Override public boolean matches(String keyword) {
        return super.matches(keyword) || issueNo.equalsIgnoreCase(keyword);
    }
}

class ProjectResource extends Resource {
    private final String department;
    private final int year;

    public ProjectResource(String id, String title, String author, int copies,
                           String department, int year) {
        super(id, title, author, copies);
        this.department = department;
        this.year = year;
    }

    @Override public String getType()      { return "Project"; }
    @Override public int getLoanDays()     { return 7; }
    @Override public double getFinePerDay(){ return 3.0; }
    @Override public boolean isRenewable() { return true; }
    @Override protected String extraInfo() { return department + ", " + year; }

    // Overriding: projects can be found by department
    @Override public boolean matches(String keyword) {
        return super.matches(keyword) || department.equalsIgnoreCase(keyword);
    }
}

// =====================================================================
// 4. USER HIERARCHY  (abstract class + inheritance)
// =====================================================================
abstract class User {
    private final String id;
    private final String name;
    private final String password;

    protected User(String id, String name, String password) {
        this.id = id;
        this.name = name;
        this.password = password;
    }

    public String getId()   { return id; }
    public String getName() { return name; }
    public boolean authenticate(String pwd) { return password.equals(pwd); }
    public abstract String getRole();
}

class Loan {
    private final Resource resource;
    private LocalDate dueDate;
    private int renewCount = 0;

    public Loan(Resource resource, LocalDate issueDate) {
        this.resource = resource;
        this.dueDate = issueDate.plusDays(resource.getLoanDays());
    }

    public Resource getResource() { return resource; }
    public LocalDate getDueDate() { return dueDate; }
    public int getRenewCount()    { return renewCount; }

    public void renew() {
        dueDate = dueDate.plusDays(resource.getLoanDays());
        renewCount++;
    }
}

class Student extends User {
    private static final int MAX_ITEMS = 3;
    private final List<Loan> loans = new ArrayList<>();
    private double fineDue = 0;

    public Student(String id, String name, String password) {
        super(id, name, password);
    }

    @Override public String getRole() { return "Student"; }

    public int getMaxItems()          { return MAX_ITEMS; }
    public List<Loan> getLoans()      { return loans; }
    public double getFineDue()        { return fineDue; }
    public void addFine(double amt)   { fineDue += amt; }
    public void clearFine()           { fineDue = 0; }

    public Loan findLoan(String resourceId) {
        for (Loan l : loans) {
            if (l.getResource().getId().equalsIgnoreCase(resourceId)) return l;
        }
        return null;
    }
}

class Librarian extends User {
    public Librarian(String id, String name, String password) {
        super(id, name, password);
    }

    @Override public String getRole() { return "Librarian"; }
}

// =====================================================================
// 5. LIBRARY  (core logic, uses Collections)
// =====================================================================
class Library {
    private final Map<String, Resource> resources = new LinkedHashMap<>();
    private final Map<String, User> users = new LinkedHashMap<>();
    // resourceId -> queue of students waiting (first come, first served)
    private final Map<String, Queue<Student>> reservations = new HashMap<>();
    private LocalDate today = LocalDate.now();

    public LocalDate getToday() { return today; }
    public void advanceDays(int days) { today = today.plusDays(days); }

    // ---------- inventory & member management (librarian) ----------
    public void addResource(Resource r) throws LibraryException {
        if (resources.containsKey(r.getId().toUpperCase()))
            throw new LibraryException("Resource ID already exists.");
        resources.put(r.getId().toUpperCase(), r);
    }

    public void removeResource(String id) throws LibraryException {
        Resource r = getResource(id);
        if (!r.allCopiesInLibrary())
            throw new LibraryException("Cannot remove: some copies are currently issued.");
        resources.remove(id.toUpperCase());
        reservations.remove(id.toUpperCase());
    }

    public void addUser(User u) throws LibraryException {
        if (users.containsKey(u.getId().toUpperCase()))
            throw new LibraryException("User ID already exists.");
        users.put(u.getId().toUpperCase(), u);
    }

    public void removeStudent(String id) throws LibraryException {
        User u = users.get(id.toUpperCase());
        if (!(u instanceof Student)) throw new LibraryException("Student not found.");
        Student s = (Student) u;
        if (!s.getLoans().isEmpty() || s.getFineDue() > 0)
            throw new LibraryException("Student has pending loans or fines.");
        users.remove(id.toUpperCase());
        for (Queue<Student> q : reservations.values()) q.remove(s);
    }

    public Resource getResource(String id) throws LibraryException {
        Resource r = resources.get(id.toUpperCase());
        if (r == null) throw new LibraryException("No resource with ID " + id);
        return r;
    }

    public User login(String id, String pwd, String role) {
        User u = users.get(id.toUpperCase());
        if (u != null && u.authenticate(pwd) && u.getRole().equalsIgnoreCase(role)) return u;
        return null;
    }

    public Collection<Resource> allResources() { return resources.values(); }
    public Collection<User> allUsers()         { return users.values(); }

    // ---------- METHOD OVERLOADING: three ways to search ----------
    public List<Resource> search(String keyword) {
        List<Resource> result = new ArrayList<>();
        for (Resource r : resources.values()) if (r.matches(keyword)) result.add(r);
        return result;
    }

    public List<Resource> search(String keyword, String type) {
        List<Resource> result = new ArrayList<>();
        for (Resource r : search(keyword))
            if (r.getType().equalsIgnoreCase(type)) result.add(r);
        return result;
    }

    public List<Resource> search(boolean onlyAvailable) {
        List<Resource> result = new ArrayList<>();
        for (Resource r : resources.values())
            if (!onlyAvailable || r.isAvailable()) result.add(r);
        return result;
    }

    // ---------- student operations ----------
    private int reservedCount(String id) {
        Queue<Student> q = reservations.get(id.toUpperCase());
        return q == null ? 0 : q.size();
    }

    public String issue(Student s, String id) throws LibraryException {
        Resource r = getResource(id);
        if (s.getFineDue() > 0)
            throw new LibraryException("Clear your pending fine of Rs." + s.getFineDue() + " first.");
        if (s.getLoans().size() >= s.getMaxItems())
            throw new LibraryException("Borrow limit reached (" + s.getMaxItems() + " items).");
        if (s.findLoan(id) != null)
            throw new LibraryException("You already have this resource.");
        if (!r.isAvailable())
            throw new LibraryException("All copies are issued. You can reserve it.");

        Queue<Student> q = reservations.get(id.toUpperCase());
        boolean isFirstInQueue = q != null && q.peek() == s;
        // Copies are held for students who reserved earlier
        if (!isFirstInQueue && !r.isAvailableFor(reservedCount(id)))
            throw new LibraryException("Available copies are held for students who reserved earlier.");

        if (isFirstInQueue) q.poll();
        r.checkOut();
        Loan loan = new Loan(r, today);
        s.getLoans().add(loan);
        return "Issued '" + r.getTitle() + "'. Due date: " + loan.getDueDate();
    }

    public String returnResource(Student s, String id) throws LibraryException {
        Loan loan = s.findLoan(id);
        if (loan == null) throw new LibraryException("You have not issued this resource.");
        Resource r = loan.getResource();
        double fine = r.calculateFine(loan.getDueDate(), today);   // overloaded method
        String msg;
        if (fine > 0) {
            s.addFine(fine);
            msg = "Returned late. Fine added: Rs." + fine;
        } else {
            msg = "Returned '" + r.getTitle() + "' on time.";
        }
        r.checkIn();
        s.getLoans().remove(loan);

        Queue<Student> q = reservations.get(id.toUpperCase());
        if (q != null && !q.isEmpty())
            msg += "\n[Notification] '" + r.getTitle() + "' is now held for "
                    + q.peek().getName() + " (first in reservation queue).";
        return msg;
    }

    public String reserve(Student s, String id) throws LibraryException {
        Resource r = getResource(id);
        if (s.findLoan(id) != null)
            throw new LibraryException("You already have this resource.");
        if (r.isAvailableFor(reservedCount(id)))
            throw new LibraryException("A copy is available. Please issue it directly.");
        Queue<Student> q = reservations.computeIfAbsent(id.toUpperCase(), k -> new LinkedList<>());
        if (q.contains(s)) throw new LibraryException("You already reserved this resource.");
        q.add(s);
        return "Reserved. Your position in queue: " + q.size();
    }

    public String renew(Student s, String id) throws LibraryException {
        Loan loan = s.findLoan(id);
        if (loan == null) throw new LibraryException("You have not issued this resource.");
        Resource r = loan.getResource();
        if (!r.isRenewable())
            throw new LibraryException(r.getType() + "s cannot be renewed.");
        if (loan.getRenewCount() >= 2)
            throw new LibraryException("Maximum renewals (2) reached.");
        if (today.isAfter(loan.getDueDate()))
            throw new LibraryException("Overdue items cannot be renewed. Return it instead.");
        if (reservedCount(id) > 0)
            throw new LibraryException("Another student has reserved this resource.");
        loan.renew();
        return "Renewed. New due date: " + loan.getDueDate();
    }
}

// =====================================================================
// 6. SAMPLE DATA  (so the system is not empty when it starts)
// =====================================================================
class SampleData {
    public static Library create() {
        Library library = new Library();
        try {
            library.addUser(new Librarian("L01", "Mrs. Sharma", "admin123"));
            library.addUser(new Student("S01", "Aarav", "pass1"));
            library.addUser(new Student("S02", "Riya", "pass2"));

            library.addResource(new Book("B101", "Data Structures in Java", "Robert Lafore", 2, "A1"));
            library.addResource(new Book("B102", "Database System Concepts", "Silberschatz", 1, "B2"));
            library.addResource(new Book("B103", "Clean Code", "Robert Martin", 1));
            library.addResource(new EBook("E201", "Effective Java", "Joshua Bloch", "PDF"));
            library.addResource(new Journal("J301", "IEEE Software", "IEEE", 2, "Vol12-No3"));
            library.addResource(new ProjectResource("P401", "Smart Attendance System", "Batch 2024",
                    1, "CSBS", 2024));
        } catch (LibraryException e) {
            System.out.println("Setup error: " + e.getMessage());
        }
        return library;
    }
}

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Scanner;

/**
 * Terminal user interface: menus, tables, cards and coloured output.
 * Set USE_COLOR to false if your terminal shows strange characters
 * (e.g. very old Windows cmd or Eclipse console).
 */
public class ConsoleUI {

    private static final boolean USE_COLOR = true;
    private static final int WIDTH = 80;

    private static final String RESET = "\u001B[0m";
    private static final String BOLD = "\u001B[1m";
    private static final String RED = "\u001B[31m";
    private static final String GREEN = "\u001B[32m";
    private static final String YELLOW = "\u001B[33m";
    private static final String BLUE = "\u001B[34m";
    private static final String MAGENTA = "\u001B[35m";
    private static final String CYAN = "\u001B[36m";

    private final Scanner scanner = new Scanner(System.in);
    private final IncidentManager manager = new IncidentManager();

    // ------------------------------------------------------------------
    // Main loop
    // ------------------------------------------------------------------

    public void start() {
        printBanner();
        boolean running = true;
        while (running) {
            printMenu();
            int choice = readInt("Enter your choice", 0, 8);
            System.out.println();
            switch (choice) {
                case 1: reportIncident(); break;
                case 2: viewAllIncidents(); break;
                case 3: viewIncidentDetails(); break;
                case 4: viewWaitingQueue(); break;
                case 5: viewTeams(); break;
                case 6: resolveIncident(); break;
                case 7: viewStatistics(); break;
                case 8: loadDemoData(); break;
                case 0: running = false; break;
                default: break;
            }
            if (running) {
                pause();
            }
        }
        System.out.println(color("\n  Stay safe! Emergency system closed.\n", GREEN));
    }

    // ------------------------------------------------------------------
    // Menu actions
    // ------------------------------------------------------------------

    private void reportIncident() {
        section("REPORT AN EMERGENCY");
        System.out.println("  1. " + color("Medical", RED) + "          (injury, illness, collapse)");
        System.out.println("  2. " + color("Fire", YELLOW) + "             (fire, smoke, gas)");
        System.out.println("  3. " + color("Security", MAGENTA) + "         (theft, harassment, intruder)");
        System.out.println("  4. " + color("Infrastructure", BLUE) + "   (power, water, building damage)");
        System.out.println();

        int category = readInt("Select category", 1, 4);
        String name = readLine("Your name");
        String location = readLine("Location (building / room)");
        String description = readLine("Describe the emergency");

        try {
            Incident incident = manager.report(category, name, location, description);
            System.out.println();
            printIncidentCard(incident);
            if (incident.getStatus() == Status.ASSIGNED) {
                success("Help is on the way! " + incident.getAssignedTeam()
                        + " dispatched, ETA " + incident.getEtaMinutes() + " min.");
            } else {
                warn("All " + incident.getCategory() + " responders are busy. Incident queued by priority.");
            }
        } catch (InvalidIncidentException e) {
            error(e.getMessage());
        }
    }

    private void viewAllIncidents() {
        section("ALL INCIDENTS");
        printTable(manager.getAllIncidents());
    }

    private void viewIncidentDetails() {
        section("INCIDENT DETAILS");
        int id = readInt("Enter incident ID", 1, Integer.MAX_VALUE);
        try {
            System.out.println();
            printIncidentCard(manager.findById(id));
        } catch (IncidentNotFoundException e) {
            error(e.getMessage());
        }
    }

    private void viewWaitingQueue() {
        section("WAITING QUEUE (highest priority first)");
        printTable(manager.getWaitingQueue());
    }

    private void viewTeams() {
        section("RESPONSE TEAMS");
        for (ResponseTeam team : manager.getTeams()) {
            int active = team.getActiveCount();
            int cap = team.getCapacity();
            String state = team.isAvailable() ? color("AVAILABLE", GREEN) : color("BUSY", RED);
            StringBuilder ids = new StringBuilder();
            for (Incident i : team.getActiveIncidents()) {
                ids.append("#").append(i.getId()).append(" ");
            }
            System.out.println("  " + color(team.getTeamName(), BOLD));
            System.out.println("    Contact   : " + team.getContact());
            System.out.println("    Equipment : " + team.getEquipment());
            System.out.println("    Load      : " + loadBar(active, cap) + " " + active + "/" + cap + "  " + state);
            System.out.println("    Handling  : " + (ids.length() == 0 ? "-" : ids.toString().trim()));
            System.out.println();
        }
    }

    private void resolveIncident() {
        section("RESOLVE AN INCIDENT");
        int id = readInt("Enter incident ID to resolve", 1, Integer.MAX_VALUE);
        try {
            List<Incident> autoDispatched = manager.resolve(id);
            success("Incident #" + id + " marked as RESOLVED.");
            for (Incident i : autoDispatched) {
                System.out.println(color("  >> Queued incident #" + i.getId() + " ("
                        + i.getSeverity().getLabel() + ") now assigned to "
                        + i.getAssignedTeam() + ", ETA " + i.getEtaMinutes() + " min.", CYAN));
            }
        } catch (IncidentNotFoundException | InvalidIncidentException e) {
            error(e.getMessage());
        }
    }

    private void viewStatistics() {
        section("DASHBOARD");
        int total = manager.getAllIncidents().size();
        System.out.println("  Total incidents : " + color(String.valueOf(total), BOLD));
        System.out.println("  Assigned        : " + manager.countByStatus(Status.ASSIGNED));
        System.out.println("  Queued          : " + manager.countByStatus(Status.QUEUED));
        System.out.println("  Resolved        : " + manager.countByStatus(Status.RESOLVED));

        System.out.println("\n  " + color("By severity", BOLD));
        for (Map.Entry<Severity, Integer> e : manager.countBySeverity().entrySet()) {
            System.out.println("    " + color(pad(e.getKey().getLabel(), 10), severityColor(e.getKey()))
                    + "| " + "#".repeat(e.getValue()) + " " + e.getValue());
        }

        System.out.println("\n  " + color("By category", BOLD));
        for (Map.Entry<String, Integer> e : manager.countByCategory().entrySet()) {
            System.out.println("    " + pad(e.getKey(), 15) + "| " + "#".repeat(e.getValue()) + " " + e.getValue());
        }
    }

    private void loadDemoData() {
        section("LOADING DEMO DATA");
        String[][] demo = {
            {"1", "Aarav", "Hostel Block A", "Student fainted and is unconscious"},
            {"2", "Priya", "Chemistry Lab 2", "Fire spreading near gas cylinder, students trapped"},
            {"3", "Rohan", "Main Gate", "Suspicious intruder near the parking area"},
            {"4", "Sneha", "Library 2nd Floor", "Water leak from ceiling near books"},
            {"1", "Karan", "Canteen", "Deep cut with heavy bleeding on hand"},
            {"1", "Meera", "Sports Ground", "Player has a suspected fracture in the leg"},
            {"4", "Vikram", "Lab Block", "Sparking wire and short circuit in switchboard"}
        };
        for (String[] d : demo) {
            try {
                Incident i = manager.report(Integer.parseInt(d[0]), d[1], d[2], d[3]);
                System.out.println("  Reported " + i + " -> " + color(i.getStatus().getLabel(), statusColor(i.getStatus())));
            } catch (InvalidIncidentException e) {
                error(e.getMessage());
            }
        }
        success("Demo data loaded. Try options 2, 4 and 5.");
    }

    // ------------------------------------------------------------------
    // Drawing helpers
    // ------------------------------------------------------------------

    private void printBanner() {
        String border = "+" + "=".repeat(WIDTH - 2) + "+";
        System.out.println();
        System.out.println(color(border, CYAN));
        System.out.println(color(centered("CAMPUS EMERGENCY & ALERT MANAGEMENT SYSTEM"), BOLD + CYAN));
        System.out.println(color(centered("Report  >  Classify  >  Respond"), CYAN));
        System.out.println(color(border, CYAN));
    }

    private void printMenu() {
        System.out.println();
        System.out.println(color("  MAIN MENU", BOLD));
        System.out.println("  " + "-".repeat(32));
        System.out.println("  1. Report an emergency");
        System.out.println("  2. View all incidents");
        System.out.println("  3. View incident details");
        System.out.println("  4. View waiting queue");
        System.out.println("  5. View response teams");
        System.out.println("  6. Resolve an incident");
        System.out.println("  7. Dashboard / statistics");
        System.out.println("  8. Load demo data");
        System.out.println("  0. Exit");
        System.out.println("  " + "-".repeat(32));
    }

    private void printTable(Collection<Incident> incidents) {
        if (incidents.isEmpty()) {
            System.out.println(color("  (nothing to show)", YELLOW));
            return;
        }
        String header = "  " + pad("ID", 6) + pad("TYPE", 15) + pad("SEVERITY", 10)
                + pad("LOCATION", 18) + pad("STATUS", 10) + "TEAM";
        System.out.println(color(header, BOLD));
        System.out.println("  " + "-".repeat(WIDTH - 4));
        for (Incident i : incidents) {
            System.out.println("  "
                    + pad(String.valueOf(i.getId()), 6)
                    + pad(i.getCategory(), 15)
                    + color(pad(i.getSeverity().getLabel(), 10), severityColor(i.getSeverity()))
                    + pad(i.getLocation(), 18)
                    + color(pad(i.getStatus().getLabel(), 10), statusColor(i.getStatus()))
                    + i.getAssignedTeam());
        }
    }

    private void printIncidentCard(Incident i) {
        System.out.println(color("  +-- INCIDENT #" + i.getId() + " " + "-".repeat(40), CYAN));
        row("Category", i.getCategory() + " Emergency");
        row("Severity", color(i.getSeverity().getLabel(), severityColor(i.getSeverity())));
        row("Status", color(i.getStatus().getLabel(), statusColor(i.getStatus())));
        row("Reported by", i.getReporterName());
        row("Location", i.getLocation());
        row("Description", i.getDescription());
        row("Reported at", i.getReportedAtText());
        row("Assigned team", i.getAssignedTeam());
        if (i.getStatus() == Status.ASSIGNED || i.getStatus() == Status.RESOLVED) {
            row("ETA", i.getEtaMinutes() + " minutes");
        }
        System.out.println(color("  +" + "-".repeat(55), CYAN));
    }

    private void row(String label, String value) {
        System.out.println(color("  | ", CYAN) + pad(label, 14) + ": " + value);
    }

    private void section(String title) {
        System.out.println(color("  === " + title + " ===", BOLD + CYAN));
        System.out.println();
    }

    private String loadBar(int active, int capacity) {
        return "[" + "#".repeat(active) + "-".repeat(Math.max(0, capacity - active)) + "]";
    }

    private String centered(String text) {
        int inner = WIDTH - 2;
        int left = (inner - text.length()) / 2;
        int right = inner - text.length() - left;
        return "|" + " ".repeat(left) + text + " ".repeat(right) + "|";
    }

    private String pad(String text, int width) {
        if (text.length() >= width) {
            return text.substring(0, width - 2) + "~ ";
        }
        return String.format("%-" + width + "s", text);
    }

    private String color(String text, String code) {
        return USE_COLOR ? code + text + RESET : text;
    }

    private String severityColor(Severity s) {
        switch (s) {
            case CRITICAL: return BOLD + RED;
            case HIGH: return YELLOW;
            case MEDIUM: return CYAN;
            default: return GREEN;
        }
    }

    private String statusColor(Status s) {
        switch (s) {
            case ASSIGNED: return GREEN;
            case QUEUED: return YELLOW;
            case RESOLVED: return BLUE;
            default: return RESET;
        }
    }

    private void success(String message) {
        System.out.println(color("  [OK] " + message, GREEN));
    }

    private void warn(String message) {
        System.out.println(color("  [!]  " + message, YELLOW));
    }

    private void error(String message) {
        System.out.println(color("  [ERROR] " + message, RED));
    }

    // ------------------------------------------------------------------
    // Input helpers (exception handling for bad input)
    // ------------------------------------------------------------------

    private int readInt(String prompt, int min, int max) {
        while (true) {
            System.out.print("  " + prompt + ": ");
            String input = scanner.nextLine().trim();
            try {
                int value = Integer.parseInt(input);
                if (value < min || value > max) {
                    error("Please enter a number between " + min + " and " + (max == Integer.MAX_VALUE ? "9999" : String.valueOf(max)) + ".");
                } else {
                    return value;
                }
            } catch (NumberFormatException e) {
                error("'" + input + "' is not a valid number.");
            }
        }
    }

    private String readLine(String prompt) {
        System.out.print("  " + prompt + ": ");
        return scanner.nextLine().trim();
    }

    private void pause() {
        System.out.print(color("\n  Press ENTER to continue...", YELLOW));
        scanner.nextLine();
    }
}

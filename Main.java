
package CampusLostFound;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Scanner;
import java.io.IOException;

public class Main {

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        LostFoundSystem system = new LostFoundSystem();

        try {
            system.loadData();
            System.out.println("Previous records loaded.");
        } catch (IOException e) {
            System.out.println("File error: " + e.getMessage());
        }

        while (true) {
            try {
                System.out.println("\n=== CAMPUS LOST & FOUND ===");
                System.out.println("1. Report Lost Item");
                System.out.println("2. Report Found Item");
                System.out.println("3. View All Items");
                System.out.println("4. Find Matches");
                System.out.println("5. Exit");
                System.out.print("Enter choice: ");

                int choice = Integer.parseInt(sc.nextLine());

                if (choice == 5) {
                    try {
                        system.saveData();
                    } catch (IOException e) {
                        System.out.println(
                            "Unable to save: " + e.getMessage());
                    }

                    System.out.println("Thank you!");
                    break;
                }

                if (choice == 3) {
                    system.showAllItems();
                    continue;
                }

                if (choice == 4) {
                    system.findMatches();
                    continue;
                }

                if (choice == 1 || choice == 2) {
                    System.out.print("Item name: ");
                    String name = sc.nextLine().trim();

                    if (name.isEmpty()) {
                        throw new IllegalArgumentException(
                            "Item name cannot be empty.");
                    }

                    System.out.print("Description: ");
                    String description = sc.nextLine().trim();

                    System.out.print("Location: ");
                    String location = sc.nextLine().trim();

                    if (location.isEmpty()) {
                        throw new IllegalArgumentException(
                            "Location cannot be empty.");
                    }

                    System.out.print("Date (YYYY-MM-DD): ");
                    LocalDate date =
                        LocalDate.parse(sc.nextLine().trim());

                    System.out.print("Your name: ");
                    String reporter = sc.nextLine().trim();

                    if (reporter.isEmpty()) {
                        throw new IllegalArgumentException(
                            "Name cannot be empty.");
                    }

                    System.out.print("Contact: ");
                    String contact = sc.nextLine().trim();

                    if (choice == 1) {
                        system.addLostItem(new LostItem(
                            name, description, location,
                            date, reporter, contact));
                    } else {
                        system.addFoundItem(new FoundItem(
                            name, description, location,
                            date, reporter, contact));
                    }

                } else {
                    System.out.println("Invalid menu choice.");
                }

            } catch (NumberFormatException e) {
                System.out.println("Enter a valid menu number.");
            } catch (DateTimeParseException e) {
                System.out.println("Use date format YYYY-MM-DD.");
            } catch (IllegalArgumentException e) {
                System.out.println("Error: " + e.getMessage());
            }
        }

        sc.close();
    }
}


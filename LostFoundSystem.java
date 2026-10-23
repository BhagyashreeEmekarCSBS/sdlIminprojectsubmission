package CampusLostFound;

import java.util.ArrayList;
import java.util.List;
import java.io.IOException;
import java.time.LocalDate;

public class LostFoundSystem {

    private List<LostItem> lostItems = new ArrayList<>();
    private List<FoundItem> foundItems = new ArrayList<>();

    public void addLostItem(LostItem item) {
        lostItems.add(item);
        System.out.println("Lost item reported successfully!");
    }

    public void addFoundItem(FoundItem item) {
        foundItems.add(item);
        System.out.println("Found item reported successfully!");
    }

    public void showAllItems() {
        System.out.println("\n--- LOST ITEMS ---");
        for (LostItem item : lostItems) {
            item.displayDetails();
            System.out.println("----------------");
        }

        System.out.println("\n--- FOUND ITEMS ---");
        for (FoundItem item : foundItems) {
            item.displayDetails();
            System.out.println("----------------");
        }
    }

    public void findMatches() {
        boolean matchFound = false;

        for (LostItem lost : lostItems) {
            for (FoundItem found : foundItems) {

                boolean sameName = lost.getItemName()
                    .trim().equalsIgnoreCase(
                        found.getItemName().trim());

                boolean sameLocation = lost.getLocation()
                    .trim().equalsIgnoreCase(
                        found.getLocation().trim());

                if (sameName && sameLocation) {
                    System.out.println("\nPossible match found!");
                    System.out.println("Lost by: "
                        + lost.getReporterName());
                    System.out.println("Found by: "
                        + found.getReporterName());
                    System.out.println("Item: "
                        + lost.getItemName());
                    System.out.println("Location: "
                        + lost.getLocation());

                    matchFound = true;
                }
            }
        }

        if (!matchFound) {
            System.out.println("No matching items found.");
        }
    }

    public void saveData() throws IOException {
        List<String> lostRecords = new ArrayList<>();
        List<String> foundRecords = new ArrayList<>();

        for (LostItem item : lostItems) {
            lostRecords.add(
                item.getItemName() + "|" +
                item.getDescription() + "|" +
                item.getLocation() + "|" +
                item.getDate() + "|" +
                item.getReporterName() + "|" +
                item.getContact()
            );
        }

        for (FoundItem item : foundItems) {
            foundRecords.add(
                item.getItemName() + "|" +
                item.getDescription() + "|" +
                item.getLocation() + "|" +
                item.getDate() + "|" +
                item.getReporterName() + "|" +
                item.getContact()
            );
        }

        FileManager.saveRecords("lost_items.txt", lostRecords);
        FileManager.saveRecords("found_items.txt", foundRecords);

        System.out.println("Data saved successfully!");
    }

    public void loadData() throws IOException {
        for (String line :
                FileManager.loadRecords("lost_items.txt")) {
            String[] p = line.split("\\|", -1);

            if (p.length != 6) {
                System.out.println("Invalid lost record skipped.");
                continue;
            }

            try {
                lostItems.add(new LostItem(
                    p[0], p[1], p[2],
                    LocalDate.parse(p[3]), p[4], p[5]
                ));
            } catch (RuntimeException e) {
                System.out.println("Invalid lost record skipped.");
            }
        }

        for (String line :
                FileManager.loadRecords("found_items.txt")) {
            String[] p = line.split("\\|", -1);

            if (p.length != 6) {
                System.out.println("Invalid found record skipped.");
                continue;
            }

            try {
                foundItems.add(new FoundItem(
                    p[0], p[1], p[2],
                    LocalDate.parse(p[3]), p[4], p[5]
                ));
            } catch (RuntimeException e) {
                System.out.println("Invalid found record skipped.");
            }
        }
    }
}


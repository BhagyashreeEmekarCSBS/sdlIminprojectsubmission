package com.rscoe.smartcanteen.service;

import com.rscoe.smartcanteen.model.FoodItem;
import com.rscoe.smartcanteen.model.Order;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

/**
 * FileStorageService handles persistence to disk using standard text file storage.
 */
public class FileStorageService {
    private final String menuFilePath;
    private final String ordersFilePath;

    public FileStorageService(String dataDir) {
        File dir = new File(dataDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }
        this.menuFilePath = new File(dir, "menu.txt").getAbsolutePath();
        this.ordersFilePath = new File(dir, "orders.txt").getAbsolutePath();
    }

    public synchronized void saveMenu(List<FoodItem> items) throws IOException {
        PrintWriter pw = null;
        try {
            pw = new PrintWriter(new FileWriter(menuFilePath));
            for (FoodItem item : items) {
                // Format: id|name|price|category|isVeg|prepTime|isAvailable|stock
                pw.println(String.format("%s|%s|%.2f|%s|%b|%d|%b|%d",
                        item.getId(),
                        item.getName(),
                        item.getPrice(),
                        item.getCategory(),
                        item.isVeg(),
                        item.getPrepTimeMinutes(),
                        item.isAvailable(),
                        item.getStockQuantity()));
            }
        } finally {
            if (pw != null) pw.close();
        }
    }

    public synchronized List<FoodItem> loadMenu() {
        List<FoodItem> items = new ArrayList<FoodItem>();
        File f = new File(menuFilePath);
        if (!f.exists()) return items;

        BufferedReader br = null;
        try {
            br = new BufferedReader(new FileReader(f));
            String line;
            while ((line = br.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) continue;
                String[] parts = line.split("\\|");
                if (parts.length >= 8) {
                    String id = parts[0];
                    String name = parts[1];
                    double price = Double.parseDouble(parts[2]);
                    String category = parts[3];
                    boolean isVeg = Boolean.parseBoolean(parts[4]);
                    int prep = Integer.parseInt(parts[5]);
                    boolean avail = Boolean.parseBoolean(parts[6]);
                    int stock = Integer.parseInt(parts[7]);
                    items.add(new FoodItem(id, name, price, category, isVeg, prep, avail, stock));
                }
            }
        } catch (Exception e) {
            System.err.println("Notice: Could not load existing menu file: " + e.getMessage());
        } finally {
            try { if (br != null) br.close(); } catch (Exception ignored) {}
        }
        return items;
    }

    public synchronized void logOrder(Order order) {
        PrintWriter pw = null;
        try {
            pw = new PrintWriter(new FileWriter(ordersFilePath, true));
            pw.println(String.format("[%s] Token:%s | %s (%s) | Items:%d | Total:₹%.2f | Mode:%s | Status:%s",
                    order.getOrderId(),
                    order.getTokenNumber(),
                    order.getStudentName(),
                    order.getStudentId(),
                    order.getItems().size(),
                    order.getTotalAmount(),
                    order.getPaymentMethod(),
                    order.getStatus().name()));
        } catch (Exception e) {
            System.err.println("Notice: Could not log order to file: " + e.getMessage());
        } finally {
            if (pw != null) pw.close();
        }
    }
}

package com.rscoe.smartcanteen.model;

import java.io.Serializable;

/**
 * FoodItem represents a menu item with full encapsulation and validation.
 */
public class FoodItem implements Serializable {
    private static final long serialVersionUID = 1L;

    private String id;
    private String name;
    private double price;
    private String category;
    private boolean isVeg;
    private int prepTimeMinutes;
    private boolean isAvailable;
    private int stockQuantity;

    public FoodItem(String id, String name, double price, String category, boolean isVeg, int prepTimeMinutes, boolean isAvailable, int stockQuantity) {
        if (id == null || id.trim().isEmpty()) {
            throw new IllegalArgumentException("Item ID cannot be empty.");
        }
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Item Name cannot be empty.");
        }
        if (price < 0) {
            throw new IllegalArgumentException("Price cannot be negative.");
        }
        if (stockQuantity < 0) {
            throw new IllegalArgumentException("Stock quantity cannot be negative.");
        }

        this.id = id.trim();
        this.name = name.trim();
        this.price = price;
        this.category = category.trim();
        this.isVeg = isVeg;
        this.prepTimeMinutes = Math.max(1, prepTimeMinutes);
        this.isAvailable = isAvailable;
        this.stockQuantity = stockQuantity;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public double getPrice() { return price; }
    public String getCategory() { return category; }
    public boolean isVeg() { return isVeg; }
    public int getPrepTimeMinutes() { return prepTimeMinutes; }
    public boolean isAvailable() { return isAvailable && stockQuantity > 0; }
    public int getStockQuantity() { return stockQuantity; }

    public void setPrice(double price) {
        if (price < 0) throw new IllegalArgumentException("Price cannot be negative");
        this.price = price;
    }

    public void setAvailable(boolean available) {
        this.isAvailable = available;
    }

    public void setStockQuantity(int stockQuantity) {
        if (stockQuantity < 0) throw new IllegalArgumentException("Stock cannot be negative");
        this.stockQuantity = stockQuantity;
        if (stockQuantity == 0) {
            this.isAvailable = false;
        }
    }

    public synchronized boolean deductStock(int qty) {
        if (qty <= 0) return false;
        if (this.stockQuantity >= qty) {
            this.stockQuantity -= qty;
            if (this.stockQuantity == 0) this.isAvailable = false;
            return true;
        }
        return false;
    }

    public synchronized void restoreStock(int qty) {
        if (qty > 0) {
            this.stockQuantity += qty;
            this.isAvailable = true;
        }
    }

    @Override
    public String toString() {
        return String.format("[%s] %-24s | ₹%-6.2f | %-12s | %s | Stock: %d",
                id, name, price, category, (isVeg ? "VEG" : "NON-VEG"), stockQuantity);
    }
}

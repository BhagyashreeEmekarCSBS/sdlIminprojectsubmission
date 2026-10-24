package com.rscoe.smartcanteen.model;

import java.io.Serializable;

/**
 * OrderItem represents a selected food item with quantity and line total calculation.
 */
public class OrderItem implements Serializable {
    private static final long serialVersionUID = 1L;

    private FoodItem foodItem;
    private int quantity;
    private String customizationNote;

    public OrderItem(FoodItem foodItem, int quantity, String customizationNote) {
        if (foodItem == null) {
            throw new IllegalArgumentException("FoodItem cannot be null");
        }
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }
        this.foodItem = foodItem;
        this.quantity = quantity;
        this.customizationNote = (customizationNote == null) ? "" : customizationNote.trim();
    }

    public FoodItem getFoodItem() { return foodItem; }
    public int getQuantity() { return quantity; }
    public String getCustomizationNote() { return customizationNote; }

    public void setQuantity(int quantity) {
        if (quantity <= 0) throw new IllegalArgumentException("Quantity must be positive");
        this.quantity = quantity;
    }

    public double getLineTotal() {
        return foodItem.getPrice() * quantity;
    }

    @Override
    public String toString() {
        String customStr = customizationNote.isEmpty() ? "" : " (" + customizationNote + ")";
        return String.format("%-22s x %2d @ ₹%-5.2f = ₹%-6.2f%s",
                foodItem.getName(), quantity, foodItem.getPrice(), getLineTotal(), customStr);
    }
}

package com.rscoe.smartcanteen.service;

import com.rscoe.smartcanteen.model.FoodItem;
import java.util.List;

/**
 * MenuService defines abstract operations for canteen menu management.
 */
public interface MenuService {
    List<FoodItem> getAllMenuItems();
    List<FoodItem> getAvailableMenuItems();
    List<FoodItem> getItemsByCategory(String category);
    FoodItem getItemById(String id);
    void addMenuItem(FoodItem item);
    boolean updateItemPrice(String id, double newPrice);
    boolean setItemAvailability(String id, boolean isAvailable);
    boolean updateItemStock(String id, int stockQuantity);
    boolean removeItem(String id);
}

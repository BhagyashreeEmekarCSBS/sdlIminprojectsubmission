import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
public class CanteenService {
    private final List<MenuItem> menu=new ArrayList<MenuItem>();
    private final List<CanteenOrder> orders=new ArrayList<CanteenOrder>();
    private int token=1001;
    public CanteenService(){
        menu.add(new MenuItem(1,"Veg Sandwich","50.00","Snacks"));
        menu.add(new MenuItem(2,"Masala Dosa","70.00","South Indian"));
        menu.add(new MenuItem(3,"Poha","30.00","Breakfast"));
        menu.add(new MenuItem(4,"Veg Burger","60.00","Snacks"));
        menu.add(new MenuItem(5,"Tea","15.00","Beverages"));
        menu.add(new MenuItem(6,"Cold Coffee","45.00","Beverages"));
    }
    public List<MenuItem> getMenu(){return Collections.unmodifiableList(menu);}
    public List<CanteenOrder> getOrders(){return Collections.unmodifiableList(orders);}
    public CanteenOrder placeOrder(String name,List<OrderItem> cart){
        if(name==null||name.trim().isEmpty())throw new IllegalArgumentException("Enter student name.");
        if(cart==null||cart.isEmpty())throw new IllegalArgumentException("Add at least one item to cart.");
        CanteenOrder o=new CanteenOrder(token++,name.trim(),cart); orders.add(o); return o;
    }
}

import java.math.BigDecimal;
public class OrderItem {
    private final MenuItem item;
    private int quantity;
    public OrderItem(MenuItem item, int quantity){this.item=item; this.quantity=quantity;}
    public MenuItem getItem(){return item;}
    public int getQuantity(){return quantity;}
    public void setQuantity(int q){quantity=q;}
    public BigDecimal subtotal(){return item.getPrice().multiply(BigDecimal.valueOf(quantity));}
}

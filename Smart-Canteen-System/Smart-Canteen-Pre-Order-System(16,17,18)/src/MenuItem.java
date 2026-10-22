import java.math.BigDecimal;
public class MenuItem {
    private final int id;
    private final String name, category;
    private final BigDecimal price;
    public MenuItem(int id, String name, String price, String category) {
        this.id=id; this.name=name; this.price=new BigDecimal(price); this.category=category;
    }
    public int getId(){return id;}
    public String getName(){return name;}
    public String getCategory(){return category;}
    public BigDecimal getPrice(){return price;}
}

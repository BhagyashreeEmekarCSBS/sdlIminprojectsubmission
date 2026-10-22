import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
public class CanteenOrder {
    private final int token;
    private final String student;
    private final List<OrderItem> items;
    private final BigDecimal total;
    private String status="Received";
    public CanteenOrder(int token, String student, List<OrderItem> cart) {
        this.token=token; this.student=student; items=new ArrayList<OrderItem>(cart);
        BigDecimal sum=BigDecimal.ZERO;
        for(OrderItem i:items) sum=sum.add(i.subtotal());
        total=sum;
    }
    public int getToken(){return token;}
    public String getStudent(){return student;}
    public List<OrderItem> getItems(){return items;}
    public BigDecimal getTotal(){return total;}
    public String getStatus(){return status;}
    public void setStatus(String s){status=s;}
    public String summary(){
        StringBuilder b=new StringBuilder();
        for(OrderItem i:items){if(b.length()>0)b.append(", "); b.append(i.getItem().getName()).append(" x").append(i.getQuantity());}
        return b.toString();
    }
}

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class SmartCanteenApp extends JFrame {
    private final CanteenService service=new CanteenService();
    private final List<OrderItem> cart=new ArrayList<OrderItem>();
    private DefaultTableModel menuModel,cartModel,studentModel,adminModel;
    private JTable menuTable,cartTable,studentTable,adminTable;
    private JTextField nameField;
    private JLabel totalLabel;
    private JComboBox<String> statusBox;

    public SmartCanteenApp(){
        setTitle("Smart Canteen - Unified Dashboard");
        setSize(1000,620); setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE); setLocationRelativeTo(null);
        JTabbedPane tabs=new JTabbedPane();
        tabs.addTab("1. Order Food (Student)",orderPanel());
        tabs.addTab("2. Live Order Status (Student)",statusPanel());
        tabs.addTab("3. Kitchen Dashboard (Admin)",adminPanel());
        tabs.addChangeListener(e->refreshAll());
        add(tabs); refreshAll();
    }
    private DefaultTableModel model(String... cols){
        return new DefaultTableModel(cols,0){public boolean isCellEditable(int r,int c){return false;}};
    }
    private JPanel orderPanel(){
        JPanel p=new JPanel(new BorderLayout(8,8)); p.setBorder(BorderFactory.createEmptyBorder(10,10,10,10));
        JPanel north=new JPanel(new FlowLayout(FlowLayout.LEFT)); north.add(new JLabel("Student name:"));
        nameField=new JTextField(18); north.add(nameField); p.add(north,BorderLayout.NORTH);
        menuModel=model("ID","Food Item","Category","Price (₹)"); menuTable=new JTable(menuModel);
        cartModel=model("Food Item","Price (₹)","Quantity","Subtotal (₹)"); cartTable=new JTable(cartModel);
        JPanel center=new JPanel(new GridLayout(1,2,10,0)); center.add(tablePanel("Available Menu",menuTable)); center.add(tablePanel("Cart",cartTable)); p.add(center,BorderLayout.CENTER);
        JPanel south=new JPanel(new FlowLayout(FlowLayout.RIGHT));
        JButton add=new JButton("Add Selected Item"), remove=new JButton("Remove Selected"), place=new JButton("Place Order");
        totalLabel=new JLabel("Total: ₹0.00");
        add.addActionListener(e->addItem()); remove.addActionListener(e->removeItem()); place.addActionListener(e->placeOrder());
        south.add(add); south.add(remove); south.add(totalLabel); south.add(place); p.add(south,BorderLayout.SOUTH); return p;
    }
    private JPanel statusPanel(){
        JPanel p=new JPanel(new BorderLayout(8,8)); p.setBorder(BorderFactory.createEmptyBorder(10,10,10,10));
        studentModel=model("Token","Student","Items","Total (₹)","Status"); studentTable=new JTable(studentModel);
        p.add(new JLabel("Submitted orders and current status"),BorderLayout.NORTH); p.add(new JScrollPane(studentTable),BorderLayout.CENTER); return p;
    }
    private JPanel adminPanel(){
        JPanel p=new JPanel(new BorderLayout(8,8)); p.setBorder(BorderFactory.createEmptyBorder(10,10,10,10));
        adminModel=model("Token","Student","Items","Total (₹)","Status"); adminTable=new JTable(adminModel);
        p.add(new JLabel("Kitchen Dashboard — manage incoming orders"),BorderLayout.NORTH); p.add(new JScrollPane(adminTable),BorderLayout.CENTER);
        JPanel south=new JPanel(new FlowLayout(FlowLayout.RIGHT)); statusBox=new JComboBox<String>(new String[]{"Received","Preparing","Ready for Pickup","Completed","Cancelled"});
        JButton update=new JButton("Update Status"); update.addActionListener(e->updateStatus());
        south.add(new JLabel("Status:")); south.add(statusBox); south.add(update); p.add(south,BorderLayout.SOUTH); return p;
    }
    private JPanel tablePanel(String title,JTable table){
        JPanel p=new JPanel(new BorderLayout(5,5)); p.add(new JLabel(title),BorderLayout.NORTH); p.add(new JScrollPane(table),BorderLayout.CENTER); return p;
    }
    private void addItem(){
        int r=menuTable.getSelectedRow(); if(r<0){msg("Select a menu item first.");return;}
        int id=Integer.parseInt(menuModel.getValueAt(r,0).toString()); MenuItem chosen=null;
        for(MenuItem m:service.getMenu())if(m.getId()==id)chosen=m;
        if(chosen==null)return;
        for(OrderItem i:cart)if(i.getItem().getId()==id){i.setQuantity(i.getQuantity()+1);refreshCart();return;}
        cart.add(new OrderItem(chosen,1));refreshCart();
    }
    private void removeItem(){
        int r=cartTable.getSelectedRow(); if(r<0||r>=cart.size()){msg("Select a cart item to remove.");return;}
        cart.remove(r);refreshCart();
    }
    private void placeOrder(){
        try{
            CanteenOrder o=service.placeOrder(nameField.getText(),cart);
            JOptionPane.showMessageDialog(this,"Order placed! Token: "+o.getToken()+"\nTotal: ₹"+o.getTotal());
            cart.clear();refreshAll();
        }catch(IllegalArgumentException ex){msg(ex.getMessage());}
    }
    private void updateStatus(){
        int r=adminTable.getSelectedRow(); if(r<0){msg("Select an order first.");return;}
        int token=Integer.parseInt(adminModel.getValueAt(r,0).toString());
        for(CanteenOrder o:service.getOrders())if(o.getToken()==token)o.setStatus((String)statusBox.getSelectedItem());
        refreshAll();msg("Order status updated.");
    }
    private Object[] orderRow(CanteenOrder o){return new Object[]{o.getToken(),o.getStudent(),o.summary(),o.getTotal().toPlainString(),o.getStatus()};}
    private void refreshAll(){
        if(menuModel!=null){menuModel.setRowCount(0);for(MenuItem m:service.getMenu())menuModel.addRow(new Object[]{m.getId(),m.getName(),m.getCategory(),m.getPrice().toPlainString()});}
        refreshCart();
        if(studentModel!=null){studentModel.setRowCount(0);for(CanteenOrder o:service.getOrders())studentModel.addRow(orderRow(o));}
        if(adminModel!=null){adminModel.setRowCount(0);for(CanteenOrder o:service.getOrders())adminModel.addRow(orderRow(o));}
    }
    private void refreshCart(){
        if(cartModel==null)return; cartModel.setRowCount(0); BigDecimal total=BigDecimal.ZERO;
        for(OrderItem i:cart){cartModel.addRow(new Object[]{i.getItem().getName(),i.getItem().getPrice().toPlainString(),i.getQuantity(),i.subtotal().toPlainString()});total=total.add(i.subtotal());}
        if(totalLabel!=null)totalLabel.setText("Total: ₹"+total.toPlainString());
    }
    private void msg(String s){JOptionPane.showMessageDialog(this,s,"Smart Canteen",JOptionPane.INFORMATION_MESSAGE);}
    public static void main(String[] args){
        try{for(UIManager.LookAndFeelInfo i:UIManager.getInstalledLookAndFeels())if("Nimbus".equals(i.getName())){UIManager.setLookAndFeel(i.getClassName());break;}}
        catch(Exception e){System.out.println("Using default Look and Feel.");}
        SwingUtilities.invokeLater(()->new SmartCanteenApp().setVisible(true));
    }
}

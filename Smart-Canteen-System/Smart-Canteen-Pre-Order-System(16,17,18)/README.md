# Smart Canteen Pre-Order & Token System

A Java Swing desktop mini project for college canteens. Students can view the menu, add food to a cart, place an order, receive a token, and check status. Kitchen staff can update order status.

## Features
- Student ordering and cart
- Bill total calculation
- Token generation
- Live order-status table
- Kitchen/admin order dashboard
- Java Swing GUI and Java Collections

## Technologies
- Core Java (JDK 8+)
- Java Swing / AWT
- ArrayList and List
- JTable and DefaultTableModel
- Eclipse or IntelliJ IDEA

## Project Structure
```text
Smart-Canteen-Pre-Order-Token-System/
├── README.md
├── .gitignore
├── LICENSE
└── src/
    ├── SmartCanteenApp.java
    ├── CanteenService.java
    ├── MenuItem.java
    ├── OrderItem.java
    └── CanteenOrder.java
```

## Run in a terminal
From this project folder, run:
```bash
javac -d out src/*.java
java -cp out SmartCanteenApp
```

## Run in Eclipse
1. Extract this ZIP.
2. Create a Java project in Eclipse.
3. Copy all `.java` files from `src` into the Eclipse project's `src` folder.
4. Run `SmartCanteenApp.java` as **Java Application**.

## How to use
1. Enter a student name in the ordering tab.
2. Select a menu item and add it to the cart.
3. Click **Place Order** to receive a token.
4. Check orders in **Live Order Status**.
5. Select an order in **Kitchen Dashboard**, choose a status, and update it.

## Data storage
This starter project stores data in memory only. Orders reset when the application closes. Database persistence and login can be future enhancements.

## Academic details
Java Mini Project — Smart Canteen Pre-Order & Token System  
Department of Computer Science and Business Systems  
Rajarshi Shahu College of Engineering, Pune

Update this README with your team members' names and PRN numbers before submitting.

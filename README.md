# CampusRide - Campus Transport Management System

## Requirements
- JDK 17 or newer (JDK 25 should also work)
- VS Code Java extensions (optional)

## Compile and run from the project root
PowerShell:
```powershell
javac -d out src/CampusTransportManagement/*.java
java -cp out CampusTransportManagement.CampusTransportGUI
```

## Features
- Dashboard with bus, student and seat counts
- Add bus and driver
- Register student and allocate bus seats
- Search routes by source and destination
- Driver list
- Demo data loads at startup

## OOP concepts
- Abstract class: Person
- Inheritance: Student and Driver extend Person
- Polymorphism: displayDetails() is overridden in Student and Driver
- Interface: TransportService
- Collections: ArrayList for buses, routes, and students

Data is stored in memory and resets when the app closes.

package bhumika;

public class Admin extends Person {

    Admin(String id, String name) {
        super(id, name);
    }

    @Override
    void showDetails() {
        System.out.println("[ADMIN] ID: " + id + ", Name: " + name);
    }
}
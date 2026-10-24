package bhumika;

public class User extends Person {

    User(String id, String name) {
        super(id, name);
    }

    @Override
    void showDetails() {
        System.out.println("[USER] ID: " + id + ", Name: " + name);
    }
}

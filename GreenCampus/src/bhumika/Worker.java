package bhumika;

public class Worker extends Person {

    Worker(String id, String name) {
        super(id, name);
    }

    @Override
    void showDetails() {
        System.out.println("[WORKER] ID: " + id + ", Name: " + name);
    }
}

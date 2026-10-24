package bhumika;


	public class Person {
	    String id;
	    String name;

	    // Constructor: runs when we create a Person
	    Person(String id, String name) {
	        this.id = id;
	        this.name = name;
	    }

	    void showDetails() {
	        System.out.println("ID: " + id + ", Name: " + name);
	    }
	}


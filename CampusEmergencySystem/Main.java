import java.util.NoSuchElementException;

/**
 * Entry point of the Campus Emergency & Alert Management System.
 *
 * Compile:  javac *.java
 * Run:      java Main
 */
public class Main {
    public static void main(String[] args) {
        try {
            new ConsoleUI().start();
        } catch (NoSuchElementException e) {
            // Happens if the input stream is closed (e.g. Ctrl+D)
            System.out.println("\n  Input closed. Goodbye!");
        }
    }
}

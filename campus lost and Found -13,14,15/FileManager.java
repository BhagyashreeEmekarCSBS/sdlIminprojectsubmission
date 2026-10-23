
package CampusLostFound;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class FileManager {

    public static void saveRecords(
            String filename, List<String> records)
            throws IOException {

        try (BufferedWriter writer =
                 new BufferedWriter(new FileWriter(filename))) {

            for (String record : records) {
                writer.write(record);
                writer.newLine();
            }
        }
    }

    public static List<String> loadRecords(
            String filename) throws IOException {

        List<String> records = new ArrayList<>();
        File file = new File(filename);

        if (!file.exists()) {
            return records;
        }

        try (BufferedReader reader =
                 new BufferedReader(new FileReader(file))) {

            String line;

            while ((line = reader.readLine()) != null) {
                records.add(line);
            }
        }

        return records;
    }
}


import java.io.*;
import java.util.*;

/** Business logic: Collections (ArrayList, HashMap) + File Handling. */
public class WasteManager {
    private static final String FILE = "waste_data.txt";

    private ArrayList<Waste> wasteList = new ArrayList<>();
    private ArrayList<String> workers = new ArrayList<>(Arrays.asList("Ramesh", "Suresh", "Anita", "Meena"));
    private int nextId = 1001;

    public ArrayList<Waste> getAll()      { return wasteList; }
    public ArrayList<String> getWorkers() { return workers; }

    /** Creates the right subclass based on category. */
    private Waste create(String category, int id, String loc, String desc, double qty) {
        if (category.equals("Recyclable"))     return new RecyclableWaste(id, loc, desc, qty);
        if (category.equals("Organic"))        return new OrganicWaste(id, loc, desc, qty);
        return new NonRecyclableWaste(id, loc, desc, qty);
    }

    public Waste report(String category, String loc, String desc, double qty) {
        Waste w = create(category, nextId++, loc, desc, qty);
        wasteList.add(w);
        save();
        return w;
    }

    public Waste find(int id) {
        for (Waste w : wasteList) if (w.getId() == id) return w;
        return null;
    }

    public String assign(int id, String worker) {
        Waste w = find(id);
        if (w == null) return "No request with ID " + id;
        if (!w.getStatus().equals("PENDING")) return "Request " + id + " is already " + w.getStatus();
        w.assignTo(worker);
        save();
        return "Request " + id + " assigned to " + worker;
    }

    public String collect(int id) {
        Waste w = find(id);
        if (w == null) return "No request with ID " + id;
        if (!w.getStatus().equals("ASSIGNED")) return "Request " + id + " must be ASSIGNED first";
        w.markCollected();
        save();
        return "Request " + id + " marked COLLECTED";
    }

    /** Total kg per category using a HashMap. */
    public HashMap<String, Double> summary() {
        HashMap<String, Double> map = new HashMap<>();
        for (Waste w : wasteList)
            map.put(w.getCategory(), map.getOrDefault(w.getCategory(), 0.0) + w.getQuantity());
        return map;
    }

    // ---------- File Handling ----------
    public void save() {
        try (PrintWriter pw = new PrintWriter(new FileWriter(FILE))) {
            for (Waste w : wasteList) pw.println(w.toFileString());
        } catch (IOException e) {
            System.out.println("Could not save: " + e.getMessage());
        }
    }

    public void load() {
        wasteList.clear();
        File f = new File(FILE);
        if (!f.exists()) return;
        try (BufferedReader br = new BufferedReader(new FileReader(f))) {
            String line;
            while ((line = br.readLine()) != null) {
                String[] p = line.split("\\|");
                if (p.length < 7) continue;
                int id = Integer.parseInt(p[1]);
                Waste w = create(p[0], id, p[2], p[3], Double.parseDouble(p[4]));
                w.setStatus(p[5]);
                w.setWorker(p[6]);
                wasteList.add(w);
                if (id >= nextId) nextId = id + 1;
            }
        } catch (IOException | NumberFormatException e) {
            System.out.println("Could not load: " + e.getMessage());
        }
    }
}

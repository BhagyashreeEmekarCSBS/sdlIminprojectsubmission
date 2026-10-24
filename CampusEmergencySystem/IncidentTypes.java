/*
 * INHERITANCE + POLYMORPHISM:
 * Four concrete incident types extend the abstract Incident class.
 * Each overrides assessSeverity() with its own keyword rules.
 */

class MedicalIncident extends Incident {

    MedicalIncident(String reporter, String location, String description) {
        super(reporter, location, description);
    }

    @Override
    public String getCategory() {
        return "Medical";
    }

    @Override
    protected Severity assessSeverity() {
        if (containsAny("unconscious", "breath", "bleeding", "heart", "seizure", "faint", "chest pain")) {
            return Severity.CRITICAL;
        }
        if (containsAny("fracture", "broken", "burn", "injur", "vomit", "allergic", "accident")) {
            return Severity.HIGH;
        }
        return Severity.MEDIUM;
    }
}

class FireIncident extends Incident {

    FireIncident(String reporter, String location, String description) {
        super(reporter, location, description);
    }

    @Override
    public String getCategory() {
        return "Fire";
    }

    @Override
    protected Severity assessSeverity() {
        if (containsAny("trapped", "explosion", "spreading", "gas", "cylinder", "chemical")) {
            return Severity.CRITICAL;
        }
        if (containsAny("smell", "small", "false alarm", "alarm")) {
            return Severity.MEDIUM;
        }
        return Severity.HIGH; // any real fire is at least HIGH
    }
}

class SecurityIncident extends Incident {

    SecurityIncident(String reporter, String location, String description) {
        super(reporter, location, description);
    }

    @Override
    public String getCategory() {
        return "Security";
    }

    @Override
    protected Severity assessSeverity() {
        if (containsAny("weapon", "knife", "gun", "assault", "attack", "kidnap", "threat")) {
            return Severity.CRITICAL;
        }
        if (containsAny("theft", "stolen", "harass", "ragging", "intruder", "fight", "stalk")) {
            return Severity.HIGH;
        }
        if (containsAny("lost", "found", "parking")) {
            return Severity.LOW;
        }
        return Severity.MEDIUM;
    }
}

class InfrastructureIncident extends Incident {

    InfrastructureIncident(String reporter, String location, String description) {
        super(reporter, location, description);
    }

    @Override
    public String getCategory() {
        return "Infrastructure";
    }

    @Override
    protected Severity assessSeverity() {
        if (containsAny("collapse", "gas leak", "electrocut")) {
            return Severity.CRITICAL;
        }
        if (containsAny("short circuit", "sparking", "flood", "wire", "crack")) {
            return Severity.HIGH;
        }
        if (containsAny("leak", "lift", "power", "water", "broken")) {
            return Severity.MEDIUM;
        }
        return Severity.LOW;
    }
}

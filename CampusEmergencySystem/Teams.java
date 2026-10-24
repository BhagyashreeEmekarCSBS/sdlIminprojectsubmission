/*
 * INHERITANCE + POLYMORPHISM:
 * Concrete response teams. Each overrides getHandledType(), getEtaMinutes()
 * and getEquipment() with its own behaviour.
 */

class MedicalTeam extends ResponseTeam {

    MedicalTeam(int capacity) {
        super("Medical Team", "Ext. 108 (Ambulance)", capacity);
    }

    @Override
    protected Class<? extends Incident> getHandledType() {
        return MedicalIncident.class;
    }

    @Override
    public int getEtaMinutes(Severity severity) {
        switch (severity) {
            case CRITICAL: return 3;
            case HIGH: return 5;
            case MEDIUM: return 8;
            default: return 12;
        }
    }

    @Override
    public String getEquipment() {
        return "Ambulance, first-aid kits, defibrillator";
    }
}

class FireSafetyTeam extends ResponseTeam {

    FireSafetyTeam(int capacity) {
        super("Fire & Safety Team", "Ext. 101 (Fire Control)", capacity);
    }

    @Override
    protected Class<? extends Incident> getHandledType() {
        return FireIncident.class;
    }

    @Override
    public int getEtaMinutes(Severity severity) {
        switch (severity) {
            case CRITICAL: return 4;
            case HIGH: return 6;
            default: return 10;
        }
    }

    @Override
    public String getEquipment() {
        return "Fire extinguishers, hoses, breathing apparatus";
    }
}

class SecurityTeam extends ResponseTeam {

    SecurityTeam(int capacity) {
        super("Security Team", "Ext. 100 (Control Room)", capacity);
    }

    @Override
    protected Class<? extends Incident> getHandledType() {
        return SecurityIncident.class;
    }

    @Override
    public int getEtaMinutes(Severity severity) {
        switch (severity) {
            case CRITICAL: return 2;
            case HIGH: return 4;
            case MEDIUM: return 7;
            default: return 15;
        }
    }

    @Override
    public String getEquipment() {
        return "Patrol vehicles, radios, CCTV access";
    }
}

class MaintenanceTeam extends ResponseTeam {

    MaintenanceTeam(int capacity) {
        super("Maintenance Team", "Ext. 150 (Estate Office)", capacity);
    }

    @Override
    protected Class<? extends Incident> getHandledType() {
        return InfrastructureIncident.class;
    }

    @Override
    public int getEtaMinutes(Severity severity) {
        switch (severity) {
            case CRITICAL: return 5;
            case HIGH: return 15;
            case MEDIUM: return 30;
            default: return 60;
        }
    }

    @Override
    public String getEquipment() {
        return "Electrical & plumbing tools, barricades";
    }
}

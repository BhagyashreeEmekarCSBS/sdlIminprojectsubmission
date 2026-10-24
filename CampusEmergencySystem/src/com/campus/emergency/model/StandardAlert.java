package com.campus.emergency.model;

public class StandardAlert extends EmergencyAlert {

    public StandardAlert(String alertId, IncidentType incidentType, String description, String location) {
        super(alertId, incidentType, description, location);
    }

    @Override
    public String getPriorityLevel() {
        return "MEDIUM / LOW";
    }
}
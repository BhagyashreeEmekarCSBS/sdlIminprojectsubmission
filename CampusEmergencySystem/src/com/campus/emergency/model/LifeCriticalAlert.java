package com.campus.emergency.model;

public class LifeCriticalAlert extends EmergencyAlert {
    private boolean requiresAmbulance;

    public LifeCriticalAlert(String alertId, IncidentType incidentType, String description, String location, boolean requiresAmbulance) {
        super(alertId, incidentType, description, location);
        this.requiresAmbulance = requiresAmbulance;
    }

    @Override
    public String getPriorityLevel() {
        return "HIGH (IMMEDIATE DISPATCH)";
    }
}
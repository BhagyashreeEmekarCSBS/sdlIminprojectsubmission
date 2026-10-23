package com.campus.emergency.model;

import java.time.LocalDateTime;

public abstract class EmergencyAlert {
    private String alertId;
    private IncidentType incidentType;
    private String description;
    private String location;
    private LocalDateTime timestamp;
    private boolean isResolved;

    public EmergencyAlert(String alertId, IncidentType incidentType, String description, String location) {
        this.alertId = alertId;
        this.incidentType = incidentType;
        this.description = description;
        this.location = location;
        this.timestamp = LocalDateTime.now();
        this.isResolved = false;
    }

    // Abstract method to be overridden by child classes
    public abstract String getPriorityLevel();

    public String getAlertId() { return alertId; }
    public IncidentType getIncidentType() { return incidentType; }
    public String getDescription() { return description; }
    public String getLocation() { return location; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public boolean isResolved() { return isResolved; }
    public void setResolved(boolean resolved) { isResolved = resolved; }

    @Override
    public String toString() {
        return "[" + alertId + "] Type: " + incidentType + " | Location: " + location + 
               " | Priority: " + getPriorityLevel() + " | Status: " + (isResolved ? "RESOLVED" : "PENDING");
    }
}
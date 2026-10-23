package com.campus.emergency.service;

import com.campus.emergency.exception.InvalidIncidentException;
import com.campus.emergency.exception.TeamAssignmentException;
import com.campus.emergency.model.EmergencyAlert;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class CampusAlertService implements AlertManager {
    
    // COLLECTIONS: List for maintaining logged alerts
    private List<EmergencyAlert> alertList = new ArrayList<>();
    
    // COLLECTIONS: Map to route Incident Types to Response Teams
    private Map<String, String> teamRoutingMap = new HashMap<>();

    public CampusAlertService() {
        teamRoutingMap.put("MEDICAL", "Campus Health Center & City Ambulance");
        teamRoutingMap.put("FIRE", "Campus Safety & City Fire Department");
        teamRoutingMap.put("SECURITY", "Campus Security Control Room");
        teamRoutingMap.put("INFRASTRUCTURE", "Campus Maintenance & Electrical Team");
    }

    @Override
    public void logAlert(EmergencyAlert alert) throws InvalidIncidentException {
        if (alert.getLocation() == null || alert.getLocation().trim().isEmpty()) {
            throw new InvalidIncidentException("Alert location cannot be empty!");
        }
        alertList.add(alert);
    }

    @Override
    public String assignResponseTeam(EmergencyAlert alert) throws TeamAssignmentException {
        String team = teamRoutingMap.get(alert.getIncidentType().name());
        if (team == null) {
            throw new TeamAssignmentException("No response team mapped for: " + alert.getIncidentType());
        }
        return team;
    }

    @Override
    public List<EmergencyAlert> getActiveAlerts() {
        return alertList;
    }
}
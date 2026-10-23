package com.campus.emergency.service;

import com.campus.emergency.exception.InvalidIncidentException;
import com.campus.emergency.exception.TeamAssignmentException;
import com.campus.emergency.model.EmergencyAlert;
import java.util.List;

public interface AlertManager {
    void logAlert(EmergencyAlert alert) throws InvalidIncidentException;
    String assignResponseTeam(EmergencyAlert alert) throws TeamAssignmentException;
    List<EmergencyAlert> getActiveAlerts();
}
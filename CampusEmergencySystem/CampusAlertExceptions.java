/*
 * EXCEPTION HANDLING: custom checked exceptions for the system.
 * All extend one base class so they can be caught together or separately.
 */

class CampusAlertException extends Exception {
    CampusAlertException(String message) {
        super(message);
    }
}

/** Thrown when a report has missing or invalid details. */
class InvalidIncidentException extends CampusAlertException {
    InvalidIncidentException(String message) {
        super(message);
    }
}

/** Thrown when a response team is full or no team handles the incident type. */
class NoTeamAvailableException extends CampusAlertException {
    NoTeamAvailableException(String message) {
        super(message);
    }
}

/** Thrown when an incident ID does not exist. */
class IncidentNotFoundException extends CampusAlertException {
    IncidentNotFoundException(int id) {
        super("No incident found with ID #" + id);
    }
}

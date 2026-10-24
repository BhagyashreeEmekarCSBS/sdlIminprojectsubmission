package com.rscoe.smartcanteen;

import com.rscoe.smartcanteen.service.CanteenServiceImpl;
import com.rscoe.smartcanteen.ui.SmartCanteenConsoleApp;

import java.io.File;

/**
 * Main entry point for the Smart Canteen Pre-Order & Token System (Core Java).
 * Demonstrates Classes, Objects, Inheritance, Polymorphism, Abstraction,
 * Interfaces, Collections, Input Validation, Exception Handling, and File Persistence.
 */
public class Main {
    public static void main(String[] args) {
        String dataDir = "data";
        File dir = new File(dataDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        CanteenServiceImpl canteenService = new CanteenServiceImpl(dataDir);

        System.out.println("=================================================");
        System.out.println("  SMART CANTEEN PRE-ORDER & TOKEN SYSTEM - v2.0  ");
        System.out.println("  Rajarshi Shahu College of Engineering, Pune   ");
        System.out.println("=================================================");

        SmartCanteenConsoleApp consoleApp = new SmartCanteenConsoleApp(canteenService);
        consoleApp.start();
    }
}

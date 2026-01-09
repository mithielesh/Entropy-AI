import os

# CONFIGURATION
BASE_DIR = "victim-app/src/main/java/com/entropy/victim"
ROOT_DIR = "victim-app"

# FILE 1: The Main Application
APP_CODE = """package com.entropy.victim;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class VulnerableApplication {
    public static void main(String[] args) {
        SpringApplication.run(VulnerableApplication.class, args);
    }
}
"""

# FILE 2: The Vulnerable Controller
CONTROLLER_CODE = """package com.entropy.victim;

import org.springframework.web.bind.annotation.*;
import java.util.concurrent.*;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

@RestController
@RequestMapping("/api")
public class VulnerableController {

    private static final LinkedBlockingQueue<String> accessLog = new LinkedBlockingQueue<>(1000);
    private int inventory = 100;

    @GetMapping("/log")
    public String logRequest(@RequestParam String data) {
        boolean added = accessLog.offer(data);
        if (!added) return "ERROR: Log capacity full! (Status 503)";
        return "Logged: " + data;
    }

    @GetMapping("/buy")
    public String buyItem() {
        if (inventory > 0) {
            try { Thread.sleep(10); } catch (InterruptedException e) {}
            inventory--;
            return "Purchase Successful! Remaining: " + inventory;
        }
        return "Sold Out!";
    }

    @GetMapping("/heavy-task")
    public CompletableFuture<String> heavyTask() {
        return CompletableFuture.supplyAsync(() -> {
            try {
                double result = 0;
                for (int i = 0; i < 1000000; i++) {
                    result += Math.sqrt(i) * Math.tan(i);
                }
                return "Task Complete: " + result;
            } catch (Exception e) {
                return "Error";
            }
        });
    }
    
    @PostMapping("/reset")
    public String reset() {
        accessLog.clear();
        inventory = 100;
        return "System Reset";
    }
}
"""

# FILE 3: The Maven Build File (The Missing Link!)
POM_XML = """<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" 
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.entropy</groupId>
    <artifactId>victim-app</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>victim-app</name>
    <description>Vulnerable Demo App</description>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
        <relativePath/> 
    </parent>

    <properties>
        <java.version>17</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
"""

def restore():
    # 1. Create directory structure
    print(f"Creating directory: {BASE_DIR}...")
    os.makedirs(BASE_DIR, exist_ok=True)

    # 2. Write Java Files
    with open(os.path.join(BASE_DIR, "VulnerableApplication.java"), "w") as f:
        f.write(APP_CODE)
    
    with open(os.path.join(BASE_DIR, "VulnerableController.java"), "w") as f:
        f.write(CONTROLLER_CODE)

    # 3. Write POM.xml (Crucial for Dependencies)
    with open(os.path.join(ROOT_DIR, "pom.xml"), "w") as f:
        f.write(POM_XML)
        
    print(f"Restored Java files + POM.xml")
    print("\nReady! Now push to GitHub.")

if __name__ == "__main__":
    restore()
package com.entropy.victim;

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

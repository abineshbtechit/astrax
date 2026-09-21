package com.investigation.dms;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@SpringBootApplication
@ConfigurationPropertiesScan
public class DmsApplication {

    private static final Logger log = LoggerFactory.getLogger(DmsApplication.class);

    public static void main(String[] args) {
        loadDotenv();
        SpringApplication.run(DmsApplication.class, args);
    }

    private static void loadDotenv() {
        Path[] candidatePaths = new Path[]{
                Paths.get(".env"),
                Paths.get("..", ".env"),
                Paths.get(".env.example"),
                Paths.get("..", ".env.example")
        };

        for (Path path : candidatePaths) {
            if (Files.exists(path) && !Files.isDirectory(path)) {
                try {
                    List<String> lines = Files.readAllLines(path);
                    for (String line : lines) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) {
                            continue;
                        }
                        int eqIdx = line.indexOf('=');
                        if (eqIdx > 0) {
                            String key = line.substring(0, eqIdx).trim();
                            String value = line.substring(eqIdx + 1).trim();
                            if ((value.startsWith("\"") && value.endsWith("\"")) ||
                                (value.startsWith("'") && value.endsWith("'"))) {
                                value = value.substring(1, value.length() - 1);
                            }
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, value);
                            }
                            if ("MONGODB_URI".equals(key)) {
                                if (System.getProperty("spring.data.mongodb.uri") == null) {
                                    System.setProperty("spring.data.mongodb.uri", value);
                                }
                            }
                        }
                    }
                    log.info("Loaded environment properties from {}", path.toAbsolutePath().normalize());
                    break;
                } catch (IOException e) {
                    log.warn("Failed to read environment file {}: {}", path, e.getMessage());
                }
            }
        }
    }
}


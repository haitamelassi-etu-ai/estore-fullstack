package com.estore;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class EstoreBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(EstoreBackendApplication.class, args);
    }
}

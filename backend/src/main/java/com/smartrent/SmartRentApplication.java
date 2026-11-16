package com.smartrent;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

/** Single backend entry point. Identity provisioning and JWT belong to later tasks. */
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class SmartRentApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartRentApplication.class, args);
    }
}

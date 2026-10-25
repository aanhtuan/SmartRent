package com.smartrent.shared.application;

import java.time.*;
import org.springframework.context.annotation.*;

@Configuration
public class BusinessTime {
  @Bean
  public Clock businessClock() {
    return Clock.system(ZoneId.of("Asia/Ho_Chi_Minh"));
  }
}

package com.smartrent.assistant.api;

import com.smartrent.assistant.application.AssistantService;
import com.smartrent.identity.application.Actor;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;

@RestController
@Profile("!foundation-test")
public class AssistantController {
  private final AssistantService service;

  public AssistantController(AssistantService s) {
    service = s;
  }

  public record Body(String question) {}

  @PostMapping("/api/ai-assistant/messages")
  Object message(@RequestBody Body b) {
    return service.answer(Actor.current(), b.question());
  }
}

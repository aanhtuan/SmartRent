package com.smartrent.maintenance.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.security.MessageDigest;
import java.util.*;
import org.springframework.stereotype.Component;

@Component
public class SubmissionDigest {
  private final ObjectMapper json;

  public SubmissionDigest(ObjectMapper j) {
    json = j;
  }

  public String digest(UUID room, String description) {
    try {
      var m = new LinkedHashMap<String, Object>();
      m.put("v", 1);
      m.put("room_id", room.toString());
      m.put("original_description", description);
      return HexFormat.of()
          .formatHex(MessageDigest.getInstance("SHA-256").digest(json.writeValueAsBytes(m)));
    } catch (Exception ex) {
      throw new IllegalStateException("Digest unavailable");
    }
  }
}

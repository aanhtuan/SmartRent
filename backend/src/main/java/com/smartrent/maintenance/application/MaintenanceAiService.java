package com.smartrent.maintenance.application;

import com.smartrent.aiintegration.application.*;
import com.smartrent.aiintegration.domain.Classification;
import com.smartrent.identity.application.Actor;
import com.smartrent.shared.api.*;
import com.smartrent.shared.application.Inputs;
import java.time.Instant;
import java.util.*;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile("!foundation-test")
public class MaintenanceAiService {
  private final MaintenanceService maintenance;
  private final MaintenanceQueries queries;
  private final AiGateway ai;
  private final PreviewTokens tokens;
  private final SubmissionDigest digests;

  public MaintenanceAiService(
      MaintenanceService m,
      MaintenanceQueries q,
      AiGateway ai,
      PreviewTokens t,
      SubmissionDigest d) {
    maintenance = m;
    queries = q;
    this.ai = ai;
    tokens = t;
    digests = d;
  }

  public record Preview(
      UUID roomId,
      String originalDescription,
      String aiClassificationStatus,
      Classification classification,
      String previewToken,
      Instant expiresAt) {}

  public Preview preview(Actor a, UUID room, String description) {
    Inputs.text(description, 5000);
    maintenance.eligible(a, room);
    String state;
    Classification c = null;
    try {
      c = ai.classify(a.id(), description);
      state = c.missingInformation().isEmpty() ? "CLASSIFIED" : "NEEDS_INFORMATION";
    } catch (AiInvalid e) {
      state = "INVALID";
    } catch (AiUnavailable e) {
      state = "UNAVAILABLE";
    }
    return new Preview(
        room,
        description,
        state,
        c,
        tokens.encode(a.id(), room, digests.digest(room, description), state, c),
        tokens.expires());
  }

  public com.smartrent.maintenance.domain.Maintenance classify(
      Actor a, UUID id, String additional) {
    if (additional != null && additional.length() > 2000) throw ApiFailure.invalid();
    var m = queries.visible(id, a);
    try {
      var result =
          ai.classify(
              a.id(),
              m.originalDescription
                  + (additional == null ? "" : "\nAdditional information: " + additional));
      return maintenance.classification(a, id, m.updatedAt, result);
    } catch (AiInvalid | AiUnavailable e) {
      throw new ApiFailure(
          502,
          "AI_PROVIDER_ERROR",
          "AI classification unavailable; previous information was preserved.");
    }
  }
}

package com.smartrent;

import static org.assertj.core.api.Assertions.*;

import java.nio.file.*;
import org.junit.jupiter.api.Test;

class ArchitectureBoundaryTests {
  @Test
  void domainsAreFrameworkIndependentAndControllersCannotUsePersistence() throws Exception {
    try (var paths = Files.walk(Path.of("src/main/java/com/smartrent"))) {
      for (var p : paths.filter(v -> v.toString().endsWith(".java")).toList()) {
        String s = Files.readString(p), path = p.toString();
        if (path.contains("/domain/")) {
          assertThat(s)
              .as(path)
              .doesNotContain(
                  "import jakarta.",
                  "import org.springframework.",
                  "import com.fasterxml.",
                  "import java.net.http.");
        }
        if (path.endsWith("Controller.java"))
          assertThat(s).as(path).doesNotContain("Repository", "EntityManager", ".persistence.");
        if (path.contains("/aiintegration/"))
          assertThat(s).as(path).doesNotContain("jakarta.persistence", "javax.sql", "JdbcTemplate");
        if (path.contains("/application/")) {
          String own = p.getParent().getParent().getFileName().toString();
          for (String other :
              new String[] {
                "identity",
                "property",
                "room",
                "tenant",
                "contract",
                "payment",
                "maintenance",
                "notification"
              })
            if (!other.equals(own))
              assertThat(s)
                  .as(path)
                  .doesNotContain(
                      "com.smartrent." + other + ".persistence.",
                      "com.smartrent."
                          + other
                          + ".domain."
                          + Character.toUpperCase(other.charAt(0))
                          + other.substring(1)
                          + "Repository");
        }
        assertThat(s)
            .as(path)
            .doesNotContain("@Lazy", "XsltView", "SseEmitter", "text/event-stream");
      }
    }
  }
}

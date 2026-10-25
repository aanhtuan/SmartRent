package com.smartrent.media;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.smartrent.identity.application.Actor;
import com.smartrent.identity.domain.AccountRole;
import com.smartrent.media.application.MediaStorageService;
import com.smartrent.media.domain.*;
import com.smartrent.shared.api.ApiFailure;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class MediaStorageTests {
  private MediaRepository repo;
  private MediaStorageService service;
  private Path tempDir;
  private final Actor tenant = new Actor(UUID.randomUUID(), AccountRole.TENANT);

  @BeforeEach
  void setUp() throws IOException {
    repo = mock(MediaRepository.class);
    tempDir = Files.createTempDirectory("smartrent-media-test");
    service = new MediaStorageService(repo, tempDir.toString());
  }

  @AfterEach
  void tearDown() throws IOException {
    try (var stream = Files.walk(tempDir)) {
      stream.sorted((a, b) -> b.compareTo(a)).forEach(p -> {
        try {
          Files.deleteIfExists(p);
        } catch (IOException ignored) {}
      });
    }
  }

  @Test
  void store_savesValidImage() {
    when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

    byte[] content = "fake-image-bytes".getBytes();
    var file =
        service.store(
            tenant,
            "MAINTENANCE",
            UUID.randomUUID(),
            "photo.jpg",
            "image/jpeg",
            content);

    assertNotNull(file);
    assertEquals("MAINTENANCE", file.targetType);
    assertEquals("photo.jpg", file.fileName);
    assertEquals("image/jpeg", file.mimeType);
    assertTrue(Files.exists(Paths.get(file.filePath)));
  }

  @Test
  void store_rejectsExecutableFile() {
    byte[] content = "malicious".getBytes();
    assertThrows(
        ApiFailure.class,
        () ->
            service.store(
                tenant,
                "MAINTENANCE",
                UUID.randomUUID(),
                "script.exe",
                "application/x-msdownload",
                content));
  }

  @Test
  void store_rejectsInvalidTargetType() {
    byte[] content = "fake-image".getBytes();
    assertThrows(
        ApiFailure.class,
        () ->
            service.store(
                tenant,
                "UNKNOWN_TARGET",
                UUID.randomUUID(),
                "photo.png",
                "image/png",
                content));
  }
}

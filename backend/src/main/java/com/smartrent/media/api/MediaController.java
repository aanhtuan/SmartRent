package com.smartrent.media.api;

import com.smartrent.identity.application.Actor;
import com.smartrent.media.application.MediaStorageService;
import com.smartrent.media.domain.MediaFile;
import com.smartrent.shared.api.ApiFailure;
import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@Profile("!foundation-test")
public class MediaController {
  private final MediaStorageService storage;

  public MediaController(MediaStorageService storage) {
    this.storage = storage;
  }

  public record MediaView(
      UUID id,
      UUID uploaderUserId,
      String targetType,
      UUID targetId,
      String fileName,
      String url,
      String mimeType,
      long fileSize,
      Instant createdAt) {}

  private MediaView view(MediaFile m) {
    return new MediaView(
        m.id,
        m.uploaderUserId,
        m.targetType,
        m.targetId,
        m.fileName,
        "/api/media/" + m.id,
        m.mimeType,
        m.fileSize,
        m.createdAt);
  }

  @PostMapping(value = "/api/media/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @ResponseStatus(HttpStatus.CREATED)
  MediaView upload(
      @RequestParam("file") MultipartFile file,
      @RequestParam("target_type") String targetType,
      @RequestParam(value = "target_id", required = false) UUID targetId) {
    if (file == null || file.isEmpty()) throw ApiFailure.invalid();
    try {
      var m =
          storage.store(
              Actor.current(),
              targetType,
              targetId,
              file.getOriginalFilename(),
              file.getContentType(),
              file.getBytes());
      return view(m);
    } catch (IOException e) {
      throw new RuntimeException("Failed to read uploaded file", e);
    }
  }

  @GetMapping("/api/media/{id}")
  ResponseEntity<byte[]> download(@PathVariable UUID id) {
    var meta = storage.getMetadata(id);
    var bytes = storage.getFileContent(id);
    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(meta.mimeType))
        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + meta.fileName + "\"")
        .body(bytes);
  }

  @GetMapping("/api/media")
  List<MediaView> list(
      @RequestParam("target_type") String targetType,
      @RequestParam("target_id") UUID targetId) {
    return storage.listByTarget(targetType, targetId).stream().map(this::view).toList();
  }

  @DeleteMapping("/api/media/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  void delete(@PathVariable UUID id) {
    storage.delete(id, Actor.current());
  }
}

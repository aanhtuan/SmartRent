package com.smartrent.media.application;

import com.smartrent.identity.application.Actor;
import com.smartrent.media.domain.*;
import com.smartrent.shared.api.ApiFailure;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Profile("!foundation-test")
public class MediaStorageService {
  private final MediaRepository repo;
  private final Path storageDir;

  private static final Set<String> ALLOWED_MIME_TYPES =
      Set.of(
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif",
          "video/mp4",
          "application/pdf");

  private static final long MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB

  public MediaStorageService(
      MediaRepository repo,
      @Value("${SMARTRENT_UPLOAD_DIR:uploads}") String uploadPath) {
    this.repo = repo;
    this.storageDir = Paths.get(uploadPath).toAbsolutePath().normalize();
    try {
      Files.createDirectories(this.storageDir);
    } catch (IOException e) {
      throw new RuntimeException("Could not initialize storage directory", e);
    }
  }

  @Transactional
  public MediaFile store(
      Actor actor,
      String targetType,
      UUID targetId,
      String originalFilename,
      String contentType,
      byte[] bytes) {
    if (targetType == null || !Set.of("MAINTENANCE", "ROOM", "PROPERTY").contains(targetType)) {
      throw ApiFailure.invalid();
    }
    if (bytes == null || bytes.length == 0 || bytes.length > MAX_FILE_SIZE) {
      throw ApiFailure.invalid();
    }
    if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
      throw new ApiFailure(400, "INVALID_FILE_TYPE", "Only images, videos and PDFs are allowed.");
    }

    String ext = "";
    if (originalFilename != null && originalFilename.contains(".")) {
      ext = originalFilename.substring(originalFilename.lastIndexOf("."));
    }

    String storedName = UUID.randomUUID() + ext;
    Path targetFile = storageDir.resolve(storedName);

    try {
      Files.write(targetFile, bytes, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
    } catch (IOException e) {
      throw new RuntimeException("Failed to store file on disk", e);
    }

    var mf = new MediaFile();
    mf.uploaderUserId = actor.id();
    mf.targetType = targetType;
    mf.targetId = targetId;
    mf.fileName = originalFilename != null ? originalFilename : storedName;
    mf.filePath = targetFile.toString();
    mf.mimeType = contentType;
    mf.fileSize = bytes.length;

    return repo.save(mf);
  }

  @Transactional(readOnly = true)
  public MediaFile getMetadata(UUID id) {
    var mf = repo.find(id);
    if (mf == null) throw ApiFailure.missing();
    return mf;
  }

  @Transactional(readOnly = true)
  public byte[] getFileContent(UUID id) {
    var mf = getMetadata(id);
    try {
      return Files.readAllBytes(Paths.get(mf.filePath));
    } catch (IOException e) {
      throw ApiFailure.missing();
    }
  }

  @Transactional(readOnly = true)
  public List<MediaFile> listByTarget(String targetType, UUID targetId) {
    if (targetType == null || targetId == null) throw ApiFailure.invalid();
    return repo.findByTarget(targetType, targetId);
  }

  @Transactional
  public void delete(UUID id, Actor actor) {
    var mf = getMetadata(id);
    if (!mf.uploaderUserId.equals(actor.id()) && !actor.landlord()) {
      throw new ApiFailure(403, "FORBIDDEN", "Access denied.");
    }
    try {
      Files.deleteIfExists(Paths.get(mf.filePath));
    } catch (IOException ignored) {}
    repo.delete(id);
  }
}

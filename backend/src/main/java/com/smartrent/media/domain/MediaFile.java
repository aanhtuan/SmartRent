package com.smartrent.media.domain;

import java.time.Instant;
import java.util.UUID;

public class MediaFile {
  public UUID id;
  public UUID uploaderUserId;
  public String targetType;
  public UUID targetId;
  public String fileName;
  public String filePath;
  public String mimeType;
  public long fileSize;
  public Instant createdAt;
  public Instant updatedAt;
}

package com.smartrent.media.persistence;

import com.smartrent.shared.persistence.StoredRecord;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "media_files")
class MediaFileRecord extends StoredRecord {
  @Column(name = "uploader_user_id", nullable = false)
  public UUID uploaderUserId;

  @Column(name = "target_type", nullable = false)
  public String targetType;

  @Column(name = "target_id")
  public UUID targetId;

  @Column(name = "file_name", nullable = false)
  public String fileName;

  @Column(name = "file_path", nullable = false)
  public String filePath;

  @Column(name = "mime_type", nullable = false)
  public String mimeType;

  @Column(name = "file_size", nullable = false)
  public long fileSize;
}

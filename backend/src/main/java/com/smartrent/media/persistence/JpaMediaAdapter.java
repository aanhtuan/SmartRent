package com.smartrent.media.persistence;

import com.smartrent.media.domain.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.*;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

@Repository
@Profile("!foundation-test")
class JpaMediaAdapter implements MediaRepository {
  @PersistenceContext EntityManager em;

  @Override
  public MediaFile find(UUID id) {
    var e = em.find(MediaFileRecord.class, id);
    return e == null ? null : model(e);
  }

  @Override
  public MediaFile save(MediaFile v) {
    var e = v.id == null ? null : em.find(MediaFileRecord.class, v.id);
    boolean fresh = e == null;
    if (fresh) {
      e = new MediaFileRecord();
      e.id = v.id == null ? UUID.randomUUID() : v.id;
    }
    e.uploaderUserId = v.uploaderUserId;
    e.targetType = v.targetType;
    e.targetId = v.targetId;
    e.fileName = v.fileName;
    e.filePath = v.filePath;
    e.mimeType = v.mimeType;
    e.fileSize = v.fileSize;
    if (fresh) em.persist(e);
    em.flush();
    return model(e);
  }

  @Override
  public List<MediaFile> findByTarget(String targetType, UUID targetId) {
    var q =
        em.createQuery(
            "SELECT m FROM MediaFileRecord m WHERE m.targetType = :targetType AND m.targetId ="
                + " :targetId ORDER BY m.createdAt ASC",
            MediaFileRecord.class);
    q.setParameter("targetType", targetType);
    q.setParameter("targetId", targetId);
    return q.getResultList().stream().map(this::model).toList();
  }

  @Override
  public void delete(UUID id) {
    var e = em.find(MediaFileRecord.class, id);
    if (e != null) {
      em.remove(e);
      em.flush();
    }
  }

  private MediaFile model(MediaFileRecord e) {
    var v = new MediaFile();
    v.id = e.id;
    v.uploaderUserId = e.uploaderUserId;
    v.targetType = e.targetType;
    v.targetId = e.targetId;
    v.fileName = e.fileName;
    v.filePath = e.filePath;
    v.mimeType = e.mimeType;
    v.fileSize = e.fileSize;
    v.createdAt = e.createdAt;
    v.updatedAt = e.updatedAt;
    return v;
  }
}

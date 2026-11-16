package com.smartrent.maintenance.domain;

import java.time.Instant;
import java.util.UUID;

public record MaintenanceWorkLog(
    UUID id,
    UUID maintenanceRequestId,
    UUID recordedByUserId,
    String performedBy,
    String workDescription,
    Instant createdAt) {}

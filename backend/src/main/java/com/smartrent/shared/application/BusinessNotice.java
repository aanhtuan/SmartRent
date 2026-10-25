package com.smartrent.shared.application;

import java.util.UUID;

/** Immutable in-process event. Delivery is best-effort after business commit. */
public record BusinessNotice(UUID recipient, String type, String sourceType, UUID sourceId) {}

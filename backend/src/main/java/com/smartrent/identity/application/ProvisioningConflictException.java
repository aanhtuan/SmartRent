package com.smartrent.identity.application;

public class ProvisioningConflictException extends RuntimeException {
    public ProvisioningConflictException(DevelopmentAccount slot) {
        super("Development account conflict for " + slot.name() + "; stored identity was preserved.");
    }
}

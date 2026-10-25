package com.smartrent.payment.domain;

import java.time.Instant;
import java.util.UUID;

public class LandlordBankAccount {
  public UUID id;
  public UUID landlordUserId;
  public String bankBin;
  public String bankName;
  public String accountNumber;
  public String accountHolderName;
  public Instant createdAt;
  public Instant updatedAt;
}

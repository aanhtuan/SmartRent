package com.smartrent.payment.persistence;

import com.smartrent.shared.persistence.StoredRecord;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "landlord_bank_accounts")
class LandlordBankAccountRecord extends StoredRecord {
  @Column(name = "landlord_user_id", nullable = false)
  public UUID landlordUserId;

  @Column(name = "bank_bin", nullable = false)
  public String bankBin;

  @Column(name = "bank_name", nullable = false)
  public String bankName;

  @Column(name = "account_number", nullable = false)
  public String accountNumber;

  @Column(name = "account_holder_name", nullable = false)
  public String accountHolderName;
}

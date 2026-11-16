package com.smartrent.payment.persistence;

import com.smartrent.payment.domain.*;
import jakarta.persistence.*;
import java.util.*;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

@Repository
@Profile("!foundation-test")
class JpaPaymentAdapter implements PaymentRepository {
  @PersistenceContext EntityManager em;
  @org.springframework.beans.factory.annotation.Autowired java.time.Clock clock;

  public Payment find(UUID id, boolean lock) {
    var e = em.find(PaymentRecord.class, id);
    if (e == null) return null;
    if (lock) em.refresh(e, LockModeType.PESSIMISTIC_WRITE);
    return model(e);
  }

  public Payment findByReference(String reference) {
    if (reference == null || reference.isBlank()) return null;
    var q =
        em.createQuery(
            "SELECT p FROM PaymentRecord p WHERE upper(p.paymentReference) = :ref",
            PaymentRecord.class);
    q.setParameter("ref", reference.trim().toUpperCase());
    var list = q.getResultList();
    return list.isEmpty() ? null : model(list.get(0));
  }

  public Payment save(Payment v) {
    var e = v.id == null ? null : em.find(PaymentRecord.class, v.id);
    boolean fresh = e == null;
    if (fresh) {
      e = new PaymentRecord();
      e.id = v.id == null ? UUID.randomUUID() : v.id;
    }
    e.contractId = v.contractId;
    e.billingPeriod = v.billingPeriod;
    e.dueDate = v.dueDate;
    e.amount = v.amount;
    e.status = v.status;
    if (v.paymentReference == null || v.paymentReference.isBlank()) {
      e.paymentReference = "SR" + e.id.toString().replace("-", "").substring(0, 8).toUpperCase();
    } else {
      e.paymentReference = v.paymentReference;
    }
    if (fresh) em.persist(e);
    em.flush();
    return model(e);
  }

  public List<Payment> visible(
      UUID actor, boolean landlord, UUID filter, String status, int offset, int limit) {
    var q =
        em.createNativeQuery(
            "SELECT x.* FROM payments x WHERE ((:landlord AND EXISTS(SELECT 1 FROM contracts c JOIN"
                + " rooms r ON r.id=c.room_id JOIN properties p ON p.id=r.property_id WHERE"
                + " c.id=x.contract_id AND p.owner_user_id=:actor)) OR (NOT :landlord AND"
                + " EXISTS(SELECT 1 FROM contracts c JOIN tenant_profiles t ON"
                + " t.id=c.tenant_profile_id WHERE c.id=x.contract_id AND t.user_id=:actor))) AND"
                + " (CAST(:filter AS uuid) IS NULL OR x.contract_id=CAST(:filter AS uuid)) AND"
                + " (CAST(:status AS text) IS NULL OR (CASE WHEN x.status='PAID' THEN 'PAID' WHEN"
                + " x.due_date<:today THEN 'OVERDUE' ELSE 'PENDING' END)=CAST(:status AS text))"
                + " ORDER BY x.created_at,x.id",
            PaymentRecord.class);
    q.setParameter("today", java.time.LocalDate.now(clock));
    q.setParameter("actor", actor);
    q.setParameter("landlord", landlord);
    q.setParameter("filter", filter);
    q.setParameter("status", status);
    return ((List<PaymentRecord>) q.setFirstResult(offset).setMaxResults(limit).getResultList())
        .stream().map(this::model).toList();
  }

  public LandlordBankAccount findBankAccountByLandlord(UUID landlordUserId) {
    var q =
        em.createQuery(
            "SELECT b FROM LandlordBankAccountRecord b WHERE b.landlordUserId = :landlordUserId",
            LandlordBankAccountRecord.class);
    q.setParameter("landlordUserId", landlordUserId);
    var list = q.getResultList();
    return list.isEmpty() ? null : bankModel(list.get(0));
  }

  public LandlordBankAccount saveBankAccount(LandlordBankAccount v) {
    var e = v.id == null ? null : em.find(LandlordBankAccountRecord.class, v.id);
    boolean fresh = e == null;
    if (fresh) {
      e = new LandlordBankAccountRecord();
      e.id = v.id == null ? UUID.randomUUID() : v.id;
    }
    e.landlordUserId = v.landlordUserId;
    e.bankBin = v.bankBin;
    e.bankName = v.bankName;
    e.accountNumber = v.accountNumber;
    e.accountHolderName = v.accountHolderName;
    if (fresh) em.persist(e);
    em.flush();
    return bankModel(e);
  }

  private Payment model(PaymentRecord e) {
    var v = new Payment();
    v.id = e.id;
    v.contractId = e.contractId;
    v.billingPeriod = e.billingPeriod;
    v.dueDate = e.dueDate;
    v.amount = e.amount;
    v.status = e.status;
    v.paymentReference = e.paymentReference;
    v.createdAt = e.createdAt;
    v.updatedAt = e.updatedAt;
    return v;
  }

  private LandlordBankAccount bankModel(LandlordBankAccountRecord e) {
    var v = new LandlordBankAccount();
    v.id = e.id;
    v.landlordUserId = e.landlordUserId;
    v.bankBin = e.bankBin;
    v.bankName = e.bankName;
    v.accountNumber = e.accountNumber;
    v.accountHolderName = e.accountHolderName;
    v.createdAt = e.createdAt;
    v.updatedAt = e.updatedAt;
    return v;
  }

  public boolean outsideDates(UUID contract, java.time.LocalDate start, java.time.LocalDate end) {
    return ((Number)
                em.createNativeQuery(
                        "SELECT count(*) FROM payments WHERE contract_id=:contract AND"
                            + " (billing_period>:end OR (billing_period+interval '1 month'-interval"
                            + " '1 day')::date<:start)")
                    .setParameter("contract", contract)
                    .setParameter("start", start)
                    .setParameter("end", end)
                    .getSingleResult())
            .longValue()
        > 0;
  }
}

package com.smartrent.utility.persistence;

import com.smartrent.utility.domain.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.LocalDate;
import java.util.*;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

@Repository
@Profile("!foundation-test")
class JpaUtilityAdapter implements UtilityRepository {
  @PersistenceContext EntityManager em;

  @Override
  public ServiceTariff findTariffByProperty(UUID propertyId) {
    var q =
        em.createQuery(
            "SELECT t FROM ServiceTariffRecord t WHERE t.propertyId = :propertyId",
            ServiceTariffRecord.class);
    q.setParameter("propertyId", propertyId);
    var list = q.getResultList();
    return list.isEmpty() ? null : tariffModel(list.get(0));
  }

  @Override
  public ServiceTariff saveTariff(ServiceTariff v) {
    var e = v.id == null ? null : em.find(ServiceTariffRecord.class, v.id);
    boolean fresh = e == null;
    if (fresh) {
      e = new ServiceTariffRecord();
      e.id = v.id == null ? UUID.randomUUID() : v.id;
    }
    e.propertyId = v.propertyId;
    e.electricityRate = v.electricityRate;
    e.waterRate = v.waterRate;
    e.internetFee = v.internetFee;
    e.garbageFee = v.garbageFee;
    e.otherFees = v.otherFees;
    if (fresh) em.persist(e);
    em.flush();
    return tariffModel(e);
  }

  @Override
  public MeterReading findReading(UUID id) {
    var e = em.find(MeterReadingRecord.class, id);
    return e == null ? null : readingModel(e);
  }

  @Override
  public MeterReading findReadingByContractAndPeriod(UUID contractId, LocalDate billingPeriod) {
    var q =
        em.createQuery(
            "SELECT r FROM MeterReadingRecord r WHERE r.contractId = :contractId AND"
                + " r.billingPeriod = :billingPeriod",
            MeterReadingRecord.class);
    q.setParameter("contractId", contractId);
    q.setParameter("billingPeriod", billingPeriod);
    var list = q.getResultList();
    return list.isEmpty() ? null : readingModel(list.get(0));
  }

  @Override
  @SuppressWarnings("unchecked")
  public List<MeterReading> findReadingsByContract(UUID contractId) {
    var q =
        em.createQuery(
            "SELECT r FROM MeterReadingRecord r WHERE r.contractId = :contractId ORDER BY"
                + " r.billingPeriod DESC",
            MeterReadingRecord.class);
    q.setParameter("contractId", contractId);
    return ((List<MeterReadingRecord>) q.getResultList()).stream().map(this::readingModel).toList();
  }

  @Override
  public MeterReading findLatestReadingByRoom(UUID roomId) {
    var q =
        em.createQuery(
            "SELECT r FROM MeterReadingRecord r WHERE r.roomId = :roomId ORDER BY r.recordedDate"
                + " DESC, r.createdAt DESC",
            MeterReadingRecord.class);
    q.setParameter("roomId", roomId);
    q.setMaxResults(1);
    var list = q.getResultList();
    return list.isEmpty() ? null : readingModel(list.get(0));
  }

  @Override
  public MeterReading saveReading(MeterReading v) {
    var e = v.id == null ? null : em.find(MeterReadingRecord.class, v.id);
    boolean fresh = e == null;
    if (fresh) {
      e = new MeterReadingRecord();
      e.id = v.id == null ? UUID.randomUUID() : v.id;
    }
    e.propertyId = v.propertyId;
    e.roomId = v.roomId;
    e.contractId = v.contractId;
    e.billingPeriod = v.billingPeriod;
    e.recordedDate = v.recordedDate;
    e.oldElectricityKwh = v.oldElectricityKwh;
    e.newElectricityKwh = v.newElectricityKwh;
    e.oldWaterM3 = v.oldWaterM3;
    e.newWaterM3 = v.newWaterM3;
    e.electricityAmount = v.electricityAmount;
    e.waterAmount = v.waterAmount;
    e.servicesAmount = v.servicesAmount;
    e.totalUtilityAmount = v.totalUtilityAmount;
    if (fresh) em.persist(e);
    em.flush();
    return readingModel(e);
  }

  private ServiceTariff tariffModel(ServiceTariffRecord e) {
    var v = new ServiceTariff();
    v.id = e.id;
    v.propertyId = e.propertyId;
    v.electricityRate = e.electricityRate;
    v.waterRate = e.waterRate;
    v.internetFee = e.internetFee;
    v.garbageFee = e.garbageFee;
    v.otherFees = e.otherFees;
    v.createdAt = e.createdAt;
    v.updatedAt = e.updatedAt;
    return v;
  }

  private MeterReading readingModel(MeterReadingRecord e) {
    var v = new MeterReading();
    v.id = e.id;
    v.propertyId = e.propertyId;
    v.roomId = e.roomId;
    v.contractId = e.contractId;
    v.billingPeriod = e.billingPeriod;
    v.recordedDate = e.recordedDate;
    v.oldElectricityKwh = e.oldElectricityKwh;
    v.newElectricityKwh = e.newElectricityKwh;
    v.oldWaterM3 = e.oldWaterM3;
    v.newWaterM3 = e.newWaterM3;
    v.electricityAmount = e.electricityAmount;
    v.waterAmount = e.waterAmount;
    v.servicesAmount = e.servicesAmount;
    v.totalUtilityAmount = e.totalUtilityAmount;
    v.createdAt = e.createdAt;
    v.updatedAt = e.updatedAt;
    return v;
  }
}

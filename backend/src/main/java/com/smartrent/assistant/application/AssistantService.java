package com.smartrent.assistant.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartrent.aiintegration.application.*;
import com.smartrent.contract.application.ContractService;
import com.smartrent.identity.application.Actor;
import com.smartrent.maintenance.application.MaintenanceQueries;
import com.smartrent.payment.application.PaymentService;
import com.smartrent.shared.api.*;
import com.smartrent.shared.application.Inputs;
import java.util.*;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile("!foundation-test")
public class AssistantService {
  private final ContractService contracts;
  private final com.smartrent.contract.application.ContractQueries statuses;
  private final PaymentService payments;
  private final MaintenanceQueries maintenance;
  private final AiGateway ai;
  private final ObjectMapper json;

  public AssistantService(
      ContractService c,
      com.smartrent.contract.application.ContractQueries statuses,
      PaymentService p,
      MaintenanceQueries m,
      AiGateway ai,
      ObjectMapper j) {
    contracts = c;
    this.statuses = statuses;
    payments = p;
    maintenance = m;
    this.ai = ai;
    json = j;
  }

  public AiProvider.Answer answer(Actor a, String question) {
    Inputs.text(question, 2000);
    var c = contracts.list(a, null, null, 1, 20).items();
    var p = payments.list(a, null, null, 1, 20).items();
    var m = maintenance.list(a, null, null, 1, 20, null).items();
    if (c.isEmpty() && p.isEmpty() && m.isEmpty())
      return new AiProvider.Answer(
          "Chưa có dữ liệu thuê nhà thuộc quyền truy cập của bạn. Vui lòng cung cấp thêm thông"
              + " tin.",
          true);
    var context = new LinkedHashMap<String, Object>();
    context.put("context_is_partial", true);
    context.put(
        "contracts",
        c.stream()
            .map(
                v ->
                    Map.of(
                        "id",
                        v.id,
                        "room_id",
                        v.roomId,
                        "start_date",
                        v.startDate,
                        "end_date",
                        v.endDate,
                        "status",
                        statuses.status(v)))
            .toList());
    context.put(
        "payments",
        p.stream()
            .map(
                v ->
                    Map.of(
                        "id",
                        v.id,
                        "contract_id",
                        v.contractId,
                        "amount",
                        v.amount,
                        "billing_period",
                        v.billingPeriod,
                        "due_date",
                        v.dueDate,
                        "status",
                        payments.status(v)))
            .toList());
    context.put(
        "maintenance",
        m.stream().map(v -> Map.of("id", v.id, "room_id", v.roomId, "status", v.status)).toList());
    try {
      return ai.answer(a.id(), question, json.writeValueAsString(context));
    } catch (AiInvalid | AiUnavailable e) {
      throw new ApiFailure(502, "AI_PROVIDER_ERROR", "Assistant is unavailable.");
    } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
      throw new IllegalStateException("Authorized context unavailable.");
    }
  }
}

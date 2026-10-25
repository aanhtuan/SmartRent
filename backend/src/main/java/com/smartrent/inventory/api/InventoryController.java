package com.smartrent.inventory.api;

import com.smartrent.identity.application.Actor;
import com.smartrent.inventory.application.InventoryService;
import com.smartrent.inventory.domain.Deposit;
import com.smartrent.inventory.domain.RoomAsset;
import com.smartrent.shared.api.ApiFailure;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@Profile("!foundation-test")
public class InventoryController {
  private final InventoryService inventoryService;

  public InventoryController(InventoryService inventoryService) {
    this.inventoryService = inventoryService;
  }

  public record DepositView(
      UUID id,
      UUID contractId,
      long amount,
      String status,
      long refundAmount,
      long deductionAmount,
      String deductionReason,
      Instant heldAt,
      Instant resolvedAt,
      Instant createdAt) {}

  public record RoomAssetView(
      UUID id,
      UUID roomId,
      String name,
      String assetCode,
      String conditionStatus,
      String initialNotes,
      String handoverNotes,
      Instant createdAt,
      Instant updatedAt) {}

  public record RecordDepositRequest(long amount) {}

  public record ResolveDepositRequest(
      long refund_amount, long deduction_amount, String deduction_reason) {}

  public record CreateAssetRequest(
      String name, String asset_code, String condition_status, String initial_notes) {}

  public record UpdateAssetRequest(
      String name,
      String asset_code,
      String condition_status,
      String initial_notes,
      String handover_notes) {}

  private DepositView view(Deposit d) {
    if (d == null) return null;
    return new DepositView(
        d.id,
        d.contractId,
        d.amount,
        d.status,
        d.refundAmount,
        d.deductionAmount,
        d.deductionReason,
        d.heldAt,
        d.resolvedAt,
        d.createdAt);
  }

  private RoomAssetView view(RoomAsset a) {
    if (a == null) return null;
    return new RoomAssetView(
        a.id,
        a.roomId,
        a.name,
        a.assetCode,
        a.conditionStatus,
        a.initialNotes,
        a.handoverNotes,
        a.createdAt,
        a.updatedAt);
  }

  @GetMapping("/api/contracts/{contractId}/deposit")
  public DepositView getDeposit(@PathVariable UUID contractId) {
    var d = inventoryService.getDepositByContract(Actor.current(), contractId);
    if (d == null) throw new ApiFailure(404, "NOT_FOUND", "Deposit not found.");
    return view(d);
  }

  @PostMapping("/api/contracts/{contractId}/deposit")
  @ResponseStatus(HttpStatus.CREATED)
  public DepositView recordDeposit(
      @PathVariable UUID contractId, @RequestBody RecordDepositRequest body) {
    return view(inventoryService.recordDeposit(Actor.current(), contractId, body.amount()));
  }

  @PostMapping("/api/deposits/{depositId}/resolve")
  public DepositView resolveDeposit(
      @PathVariable UUID depositId, @RequestBody ResolveDepositRequest body) {
    return view(
        inventoryService.resolveDeposit(
            Actor.current(),
            depositId,
            body.refund_amount(),
            body.deduction_amount(),
            body.deduction_reason()));
  }

  @GetMapping("/api/rooms/{roomId}/assets")
  public List<RoomAssetView> listAssets(@PathVariable UUID roomId) {
    return inventoryService.listAssets(Actor.current(), roomId).stream().map(this::view).toList();
  }

  @PostMapping("/api/rooms/{roomId}/assets")
  @ResponseStatus(HttpStatus.CREATED)
  public RoomAssetView createAsset(
      @PathVariable UUID roomId, @RequestBody CreateAssetRequest body) {
    return view(
        inventoryService.createAsset(
            Actor.current(),
            roomId,
            body.name(),
            body.asset_code(),
            body.condition_status(),
            body.initial_notes()));
  }

  @PutMapping("/api/assets/{assetId}")
  public RoomAssetView updateAsset(
      @PathVariable UUID assetId, @RequestBody UpdateAssetRequest body) {
    return view(
        inventoryService.updateAsset(
            Actor.current(),
            assetId,
            body.name(),
            body.asset_code(),
            body.condition_status(),
            body.initial_notes(),
            body.handover_notes()));
  }

  @DeleteMapping("/api/assets/{assetId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteAsset(@PathVariable UUID assetId) {
    inventoryService.deleteAsset(Actor.current(), assetId);
  }
}

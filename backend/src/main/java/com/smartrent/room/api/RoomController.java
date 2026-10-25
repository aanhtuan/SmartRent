package com.smartrent.room.api;

import com.smartrent.identity.application.Actor;
import com.smartrent.room.application.*;
import com.smartrent.room.domain.Room;
import com.smartrent.shared.api.PageResponse;
import java.util.*;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;

@RestController
@Profile("!foundation-test")
public class RoomController {
  private final RoomService service;
  private final RoomAccess access;

  public RoomController(RoomService s, RoomAccess a) {
    service = s;
    access = a;
  }

  public record Body(String roomCode, String status) {}

  public record View(UUID id, UUID propertyId, String roomCode, String status) {}

  private View view(Room r) {
    return new View(r.id, r.propertyId, r.roomCode, access.status(r));
  }

  @GetMapping("/api/properties/{propertyId}/rooms")
  Object list(
      @PathVariable UUID propertyId,
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(name = "page_size", defaultValue = "20") int size) {
    var p = service.list(Actor.current(), propertyId, page, size);
    var occupied = access.occupiedRooms(p.items().stream().map(v -> v.id).toList());
    return new PageResponse<>(
        p.items().stream()
            .map(
                v ->
                    new View(
                        v.id,
                        v.propertyId,
                        v.roomCode,
                        v.status.equals("INACTIVE")
                            ? "INACTIVE"
                            : occupied.contains(v.id) ? "OCCUPIED" : "AVAILABLE"))
            .toList(),
        page,
        size);
  }

  @PostMapping("/api/properties/{propertyId}/rooms")
  @ResponseStatus(org.springframework.http.HttpStatus.CREATED)
  Object create(@PathVariable UUID propertyId, @RequestBody Body b) {
    if (b.status() != null) throw com.smartrent.shared.api.ApiFailure.invalid();
    return view(service.create(Actor.current(), propertyId, b.roomCode()));
  }

  @GetMapping("/api/rooms/{id}")
  Object get(@PathVariable UUID id) {
    return view(access.visible(id, Actor.current()));
  }

  @PatchMapping("/api/rooms/{id}")
  Object update(@PathVariable UUID id, @RequestBody Body b) {
    return view(service.update(Actor.current(), id, b.roomCode(), b.status()));
  }

  @DeleteMapping("/api/rooms/{id}")
  @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
  void delete(@PathVariable UUID id) {
    service.update(Actor.current(), id, null, "INACTIVE");
  }
}

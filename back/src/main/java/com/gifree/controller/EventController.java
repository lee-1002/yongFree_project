package com.gifree.controller;

import com.gifree.domain.Event;
import com.gifree.dto.EventDTO;
import com.gifree.service.EventService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        return eventService.getEventById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Event> createEvent(@RequestBody EventDTO dto) {
        Event event = convertToEntity(dto);
        return ResponseEntity.ok(eventService.createEvent(event));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable Long id, @RequestBody EventDTO eventDTO) {
        Event updatedEvent = convertToEntity(eventDTO);
        updatedEvent.setId(id);
        return ResponseEntity.ok(eventService.updateEvent(id, updatedEvent));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Event> toggleEventStatus(@PathVariable Long id) {
        return eventService.getEventById(id)
                .map(event -> {
                    event.setActive(!event.isActive());
                    return ResponseEntity.ok(eventService.updateEvent(id, event));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    

    // DTO → Entity 변환 메서드
    private Event convertToEntity(EventDTO dto) {
        return Event.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .imageUrl(dto.getImageUrl())
                .startDate(parseDateTime(dto.getStartDate()))
                .endDate(parseDateTime(dto.getEndDate()))
                .storeName(dto.getStoreName())           // 추가
                .storeAddress(dto.getStoreAddress()) 
                .isActive(dto.isActive())
                .build();
    }

    private LocalDateTime parseDateTime(String dateTimeStr) {
        if (dateTimeStr == null || dateTimeStr.isEmpty()) return null;
        return LocalDateTime.parse(dateTimeStr.replace(" ", "T"));
    }
} 
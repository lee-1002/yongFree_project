package com.gifree.service;

import com.gifree.domain.Event;

import java.util.List;
import java.util.Optional;

public interface EventService {
    List<Event> getAllEvents();
    Optional<Event> getEventById(Long id);
    Event createEvent(Event event);
    Event updateEvent(Long id, Event updatedEvent);
    void deleteEvent(Long id);
}
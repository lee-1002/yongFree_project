package com.gifree.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EventDTO {

    private String title;
    private String description;

    @JsonProperty("image_url")
    private String imageUrl;

    @JsonProperty("start_date")
    private String startDate; // e.g. "2025-07-18 15:00"

    @JsonProperty("end_date")
    private String endDate;

    @JsonProperty("is_active")
    private boolean isActive;
    @JsonProperty("store_name")
    private String storeName; 
    @JsonProperty("store_address")    
    private String storeAddress; 
}
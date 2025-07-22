package com.gifree.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class EventDTO {

    private String title;
    private String description;

   
    private String image_url;

   
    private String start_date; // e.g. "2025-07-18 15:00"

    
    private String end_date;

    
    private boolean is_active;
   
    private String store_name; 
      
    private String store_address; 
}
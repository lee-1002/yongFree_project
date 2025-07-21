package com.gifree.domain;

import java.time.LocalDate;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tbl_donationboard")
@Getter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DonationBoard {
  
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long tno;
  
  private String title;

  private String writer;
  
  private String content;

  private boolean complete;

  private LocalDate dueDate;

  // 상태 변경 메서드들
  public void changeTitle(String title){
    this.title = title;
  }
  
  public void changeContent(String content){
    this.content = content;
  }

  public void changeComplete(boolean complete){
    this.complete = complete;

    
  }

  public void changeDueDate(LocalDate dueDate){
    this.dueDate = dueDate;
  }
}

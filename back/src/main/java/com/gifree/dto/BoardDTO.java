package com.gifree.dto;

public class BoardDTO {
    private Long id;
    private String title;
    private String content;
    private String category;
    private String nickname;
    private Long pno;
    private Long bno;
    private String imageUrl;

    public BoardDTO() {}

    // getters / setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }

    public Long getPno() { return pno; }
    public void setPno(Long pno) { this.pno = pno; }

    public Long getBno() { return bno; }
    public void setBno(Long bno) { this.bno = bno; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}

package com.gifree.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.gifree.domain.DonationBoard;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query; // Query 어노테이션 import

public interface DonationBoardRepository extends JpaRepository<DonationBoard, Long>{
    @Query("SELECT db FROM DonationBoard db LEFT JOIN FETCH db.uploadFileNames")
    Page<DonationBoard> findAllWithImages(Pageable pageable);
}

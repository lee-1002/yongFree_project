package com.gifree.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.gifree.domain.DonationBoard;

public interface DonationBoardRepository extends JpaRepository<DonationBoard, Long>{
    
}

package com.bookmyhotel.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bookmyhotel.entity.UatChecklist;

@Repository
public interface UatChecklistRepository extends JpaRepository<UatChecklist, Long> {

    Optional<UatChecklist> findByHotelId(Long hotelId);
}
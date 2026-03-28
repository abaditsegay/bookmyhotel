package com.bookmyhotel.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bookmyhotel.entity.UatDefect;

@Repository
public interface UatDefectRepository extends JpaRepository<UatDefect, Long> {

    List<UatDefect> findByHotelIdOrderByUpdatedAtDescCreatedAtDesc(Long hotelId);
}
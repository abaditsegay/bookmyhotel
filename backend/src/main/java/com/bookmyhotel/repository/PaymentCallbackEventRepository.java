package com.bookmyhotel.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bookmyhotel.entity.PaymentCallbackEvent;

@Repository
public interface PaymentCallbackEventRepository extends JpaRepository<PaymentCallbackEvent, Long> {

    boolean existsByIdempotencyKey(String idempotencyKey);
}
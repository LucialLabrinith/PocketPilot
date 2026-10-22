package com.pocketpilot.repository;

import com.pocketpilot.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, String> {
    List<Transaction> findByUserIdOrderByTransactionDateDescCreatedAtDesc(String userId);
    List<Transaction> findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(String userId, LocalDate start, LocalDate end);
    Optional<Transaction> findByIdAndUserId(String id, String userId);
}

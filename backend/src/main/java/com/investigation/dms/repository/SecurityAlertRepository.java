package com.investigation.dms.repository;

import com.investigation.dms.common.enums.AlertStatus;
import com.investigation.dms.model.SecurityAlert;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SecurityAlertRepository extends MongoRepository<SecurityAlert, String> {
    List<SecurityAlert> findByStatus(AlertStatus status);
    List<SecurityAlert> findAllByOrderByDetectedAtDesc();
    long countByStatus(AlertStatus status);
}

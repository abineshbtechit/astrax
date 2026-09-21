package com.investigation.dms.repository;

import com.investigation.dms.model.Department;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DepartmentRepository extends MongoRepository<Department, String> {
    Optional<Department> findByDepartmentCode(String departmentCode);
    boolean existsByDepartmentCode(String departmentCode);
}

package com.investigation.dms.service;

import com.investigation.dms.common.exception.ConflictException;
import com.investigation.dms.common.exception.ResourceNotFoundException;
import com.investigation.dms.dto.department.DepartmentRequest;
import com.investigation.dms.dto.department.DepartmentResponse;
import com.investigation.dms.model.Department;
import com.investigation.dms.repository.DepartmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    public List<DepartmentResponse> list() {
        return departmentRepository.findAll().stream().map(this::toResponse).toList();
    }

    public DepartmentResponse create(DepartmentRequest request) {
        if (departmentRepository.existsByDepartmentCode(request.getDepartmentCode())) {
            throw new ConflictException("Department code already exists");
        }
        Department dept = Department.builder()
                .departmentCode(request.getDepartmentCode())
                .name(request.getName())
                .type(request.getType())
                .status("ACTIVE")
                .build();
        return toResponse(departmentRepository.save(dept));
    }

    public DepartmentResponse get(String id) {
        return departmentRepository.findById(id).map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
    }

    public DepartmentResponse toResponse(Department d) {
        return DepartmentResponse.builder()
                .id(d.getId())
                .departmentCode(d.getDepartmentCode())
                .name(d.getName())
                .type(d.getType())
                .status(d.getStatus())
                .build();
    }
}

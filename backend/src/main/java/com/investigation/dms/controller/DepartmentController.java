package com.investigation.dms.controller;

import com.investigation.dms.common.dto.ApiResponse;
import com.investigation.dms.dto.department.DepartmentRequest;
import com.investigation.dms.dto.department.DepartmentResponse;
import com.investigation.dms.service.DepartmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Departments")
@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @Operation(summary = "List departments")
    @GetMapping
    public ResponseEntity<ApiResponse<List<DepartmentResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.ok(departmentService.list()));
    }

    @Operation(summary = "Create a department")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DepartmentResponse>> create(@Valid @RequestBody DepartmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(departmentService.create(request), "Department created"));
    }

    @Operation(summary = "Get a department")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DepartmentResponse>> get(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(departmentService.get(id)));
    }
}

package com.investigation.dms.config;

import com.investigation.dms.common.enums.DepartmentType;
import com.investigation.dms.common.enums.Role;
import com.investigation.dms.model.Department;
import com.investigation.dms.model.User;
import com.investigation.dms.repository.DepartmentRepository;
import com.investigation.dms.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

/**
 * Development-only seeder. Creates a set of dummy departments and a bootstrap
 * admin user on first startup when {@code app.seed.enabled=true}. Disable in
 * production (SEED_ENABLED=false) and never retain dummy credentials.
 */
@Slf4j
@Component
public class DataSeeder implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.enabled:false}")
    private boolean seedEnabled;
    @Value("${app.seed.admin-username:admin}")
    private String adminUsername;
    @Value("${app.seed.admin-email:admin@example.com}")
    private String adminEmail;
    @Value("${app.seed.admin-password:Admin@12345}")
    private String adminPassword;

    public DataSeeder(DepartmentRepository departmentRepository, UserRepository userRepository,
                      PasswordEncoder passwordEncoder) {
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!seedEnabled) {
            return;
        }

        if (departmentRepository.count() == 0) {
            departmentRepository.saveAll(List.of(
                    dept("POLICE", "Police Department", DepartmentType.POLICE),
                    dept("INVEST", "Investigation Bureau", DepartmentType.INVESTIGATION),
                    dept("FORENSIC", "Forensic Science Lab", DepartmentType.FORENSIC),
                    dept("LEGAL", "Legal Affairs", DepartmentType.LEGAL),
                    dept("COURT", "Court Registry", DepartmentType.COURT),
                    dept("ADMIN", "System Administration", DepartmentType.ADMINISTRATION)
            ));
            log.info("Seeded {} dummy departments", departmentRepository.count());
        }

        if (!userRepository.existsByUsername(adminUsername)) {
            String adminDeptId = departmentRepository.findByDepartmentCode("ADMIN")
                    .map(Department::getId).orElse(null);
            User admin = User.builder()
                    .username(adminUsername)
                    .email(adminEmail)
                    .fullName("System Administrator")
                    .passwordHash(passwordEncoder.encode(adminPassword))
                    .roles(Set.of(Role.ADMIN))
                    .departmentId(adminDeptId)
                    .active(true)
                    .build();
            userRepository.save(admin);
            log.warn("Seeded bootstrap admin user '{}' (dev only - change/disable in production)", adminUsername);
        }
    }

    private Department dept(String code, String name, DepartmentType type) {
        return Department.builder()
                .departmentCode(code)
                .name(name)
                .type(type)
                .status("ACTIVE")
                .build();
    }
}

package com.investigation.dms;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Smoke test: verifies the full Spring application context (security, Mongo repos,
 * services, controllers, OpenAPI) boots against an embedded MongoDB instance.
 */
@SpringBootTest
@ActiveProfiles("test")
class ApplicationContextTest {

    @Test
    void contextLoads() {
        // Context startup is the assertion.
    }
}

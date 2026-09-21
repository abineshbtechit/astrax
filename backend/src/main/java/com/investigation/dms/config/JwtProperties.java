package com.investigation.dms.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "app.jwt")
public class JwtProperties {
    /**
     * Base64 or plain secret used to sign HS256 tokens. MUST be overridden in
     * production via environment/secret manager and never committed.
     */
    private String secret;

    /** Access token validity in milliseconds. */
    private long expirationMs = 86_400_000L; // 24h

    /** Token issuer claim. */
    private String issuer = "secure-investigation-dms";
}

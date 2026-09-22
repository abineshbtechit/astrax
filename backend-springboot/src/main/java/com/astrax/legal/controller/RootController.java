package com.astrax.legal.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RootController {

    @GetMapping(value = "/", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> index() {
        String html = """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>AstraX Legal DMS - Spring Boot Backend</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0c0f17; color: #f1f5f9; padding: 40px 20px; margin: 0; }
                    .container { max-width: 800px; margin: 0 auto; background: #131825; border: 1px solid #1e293b; border-radius: 12px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; background: #10b981; color: #000; margin-bottom: 12px; }
                    h1 { margin-top: 0; font-size: 24px; color: #fff; }
                    p { color: #94a3b8; line-height: 1.6; }
                    .btn-group { margin: 24px 0; display: flex; gap: 12px; flex-wrap: wrap; }
                    .btn { display: inline-block; padding: 10px 20px; border-radius: 8px; font-weight: 600; text-decoration: none; font-size: 14px; transition: 0.2s ease; }
                    .btn-primary { background: #3b82f6; color: #fff; }
                    .btn-primary:hover { background: #2563eb; }
                    .btn-secondary { background: #1e293b; color: #cbd5e1; border: 1px solid #334155; }
                    .btn-secondary:hover { background: #334155; }
                    .endpoint-table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
                    .endpoint-table th, .endpoint-table td { padding: 10px 14px; text-align: left; border-bottom: 1px solid #1e293b; }
                    .endpoint-table th { color: #64748b; font-size: 12px; text-transform: uppercase; }
                    .method { font-family: monospace; font-weight: 700; color: #10b981; }
                    a { color: #60a5fa; text-decoration: none; }
                    a:hover { text-decoration: underline; }
                </style>
            </head>
            <body>
                <div class="container">
                    <span class="badge">Online &bull; Port 8085</span>
                    <h1>AstraX Secure Legal &amp; Evidentiary DMS</h1>
                    <p>Spring Boot 3.2.3 REST API Service with MongoDB Atlas Integration.</p>
                    
                    <div class="btn-group">
                        <a href="http://localhost:3000" class="btn btn-primary">&rarr; Open Frontend Application (Port 3000)</a>
                        <a href="/api/health" class="btn btn-secondary">&check; View Health Status</a>
                    </div>

                    <h3 style="margin-top: 30px; font-size: 16px; color: #cbd5e1;">Available REST Endpoints</h3>
                    <table class="endpoint-table">
                        <thead>
                            <tr>
                                <th>Method</th>
                                <th>Endpoint</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><span class="method">GET</span></td>
                                <td><a href="/api/health">/api/health</a></td>
                                <td>System health and MongoDB ping</td>
                            </tr>
                            <tr>
                                <td><span class="method">GET</span></td>
                                <td><a href="/api/cases">/api/cases</a></td>
                                <td>Investigation dossiers &amp; case records</td>
                            </tr>
                            <tr>
                                <td><span class="method">GET</span></td>
                                <td><a href="/api/documents">/api/documents</a></td>
                                <td>Section 65B certified legal documents &amp; checksums</td>
                            </tr>
                            <tr>
                                <td><span class="method">GET</span></td>
                                <td><a href="/api/evidence">/api/evidence</a></td>
                                <td>Physical &amp; digital chain-of-custody exhibits</td>
                            </tr>
                            <tr>
                                <td><span class="method">GET</span></td>
                                <td><a href="/api/audit-logs">/api/audit-logs</a></td>
                                <td>Cryptographic audit logs</td>
                            </tr>
                            <tr>
                                <td><span class="method">GET</span></td>
                                <td><a href="/api/access-requests">/api/access-requests</a></td>
                                <td>Cross-department authorization requests</td>
                            </tr>
                            <tr>
                                <td><span class="method">GET</span></td>
                                <td><a href="/actuator/health">/actuator/health</a></td>
                                <td>Spring Boot Actuator health probe</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </body>
            </html>
            """;
        return ResponseEntity.ok(html);
    }
}

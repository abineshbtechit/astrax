package com.investigation.dms.common.exception;

import org.springframework.http.HttpStatus;

public class FileTooLargeException extends ApiException {
    public FileTooLargeException(String message) {
        super(HttpStatus.PAYLOAD_TOO_LARGE, "FILE_TOO_LARGE", message);
    }
}

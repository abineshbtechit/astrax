package com.investigation.dms.common.exception;

import org.springframework.http.HttpStatus;

public class UnsupportedMediaException extends ApiException {
    public UnsupportedMediaException(String message) {
        super(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "UNSUPPORTED_MEDIA_TYPE", message);
    }
}

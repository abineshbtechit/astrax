package com.investigation.dms.common.exception;

import org.springframework.http.HttpStatus;

public class BusinessValidationException extends ApiException {
    public BusinessValidationException(String message) {
        super(HttpStatus.UNPROCESSABLE_ENTITY, "BUSINESS_VALIDATION_ERROR", message);
    }
}

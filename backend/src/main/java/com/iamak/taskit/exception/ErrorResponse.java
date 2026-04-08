package com.iamak.taskit.exception;

public record ErrorResponse(int status, String message, String timestamp) {}

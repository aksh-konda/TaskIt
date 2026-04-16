package com.iamak.taskit.dto.ai;

import java.time.Instant;
import java.util.List;

import com.iamak.taskit.entity.AiLog;

public class AiLogResponse {

    private String id;
    private String input;
    private List<String> retrievedContext;
    private String output;
    private Instant createdAt;

    public static AiLogResponse from(AiLog aiLog) {
        AiLogResponse response = new AiLogResponse();
        response.setId(aiLog.getId());
        response.setInput(aiLog.getInput());
        response.setRetrievedContext(aiLog.getRetrievedContext());
        response.setOutput(aiLog.getOutput());
        response.setCreatedAt(aiLog.getCreatedAt());
        return response;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getInput() {
        return input;
    }

    public void setInput(String input) {
        this.input = input;
    }

    public List<String> getRetrievedContext() {
        return retrievedContext;
    }

    public void setRetrievedContext(List<String> retrievedContext) {
        this.retrievedContext = retrievedContext;
    }

    public String getOutput() {
        return output;
    }

    public void setOutput(String output) {
        this.output = output;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

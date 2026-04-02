package com.iamak.taskit.dto;

import java.util.List;

public class PlanResponse {
    private List<String> plan;

    public PlanResponse(List<String> plan) {
        this.plan = plan;
    }

    public List<String> getPlan() {
        return plan;
    }

    public void setPlan(List<String> plan) {
        this.plan = plan;
    }
}
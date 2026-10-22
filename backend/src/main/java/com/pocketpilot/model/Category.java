package com.pocketpilot.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "user_id", length = 36)
    private String userId; // NULL for default/system categories

    @Column(nullable = false, length = 80)
    private String name;

    @Column(nullable = false, length = 20)
    private String type; // INCOME, EXPENSE

    @Column(nullable = false, length = 20)
    private String classification = "NONE"; // NEED, WANT, SAVINGS, NONE

    @Column(nullable = false, length = 20)
    private String color = "#6366f1";

    @Column(nullable = false, length = 40)
    private String icon = "tag";

    @Column(name = "monthly_limit", nullable = false, precision = 15, scale = 2)
    private BigDecimal monthlyLimit = BigDecimal.ZERO;

    @Column(name = "is_default", nullable = false)
    private boolean defaultCategory = false;

    public Category() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getClassification() { return classification; }
    public void setClassification(String classification) { this.classification = classification; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public BigDecimal getMonthlyLimit() { return monthlyLimit; }
    public void setMonthlyLimit(BigDecimal monthlyLimit) { this.monthlyLimit = monthlyLimit; }

    public boolean isDefaultCategory() { return defaultCategory; }
    public void setDefaultCategory(boolean defaultCategory) { this.defaultCategory = defaultCategory; }
}

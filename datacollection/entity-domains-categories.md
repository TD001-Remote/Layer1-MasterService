# ENTITY DOMAINS & CATEGORIES

> Classification structure for service providers and asset providers (people/organizations)

---

## 1. Business - Food & Hospitality

```
Food & Hospitality Services
├── Restaurant Owner/Operator
├── Hotel Owner/Operator
├── Cafe Owner
├── Bakery Owner
├── Catering Service
├── Fast Food Operator
├── Sweet Shop Owner
└── Mess Operator
```

---

## 2. Business - Retail & Trade

```
Retail & Trade Services
├── Shop Owner
├── Supermarket Owner
├── Wholesale Trader
├── Distributor
├── E-commerce Business
├── Franchise Owner
└── Market Vendor
```

---

## 3. Business - Manufacturing

```
Manufacturing Services
├── Factory Owner
├── Processing Unit Operator
├── Manufacturing Business
├── Assembly Unit
└── Production House
```

---

## 4. Professional Services - Technical

```
Technical Professionals
├── Civil Engineer
├── Electrical Engineer
├── Mechanical Engineer
├── Architect
├── Plumber
├── Electrician
├── Carpenter
├── Welder
└── HVAC Technician
```

---

## 5. Professional Services - Business

```
Business Professionals
├── Chartered Accountant
├── Lawyer
├── Consultant
├── Auditor
├── Tax Advisor
├── Financial Advisor
└── Business Analyst
```

---

## 6. Professional Services - Creative

```
Creative Professionals
├── Interior Designer
├── Graphic Designer
├── Photographer
├── Videographer
├── Event Planner
└── Advertising Agency
```

---

## 7. Healthcare Services

```
Healthcare Providers
├── Doctor (Multi-specialty, General, Specialist)
├── Dentist
├── Hospital Management
├── Clinic Operator
├── Diagnostic Lab Operator
├── Pharmacy Owner
├── Physiotherapist
└── Veterinarian
```

---

## 8. Education Services

```
Education Providers
├── School Management
├── College Management
├── Coaching Center Owner
├── Tutor
├── Training Institute
├── Preschool Operator
└── Skill Development Center
```

---

## 9. Government Services

```
Government Service Providers
├── Administrative Officer
├── Revenue Officer
├── Police Personnel
├── Judicial Officer
├── Municipal Officer
├── Postal Service
└── Public Welfare Officer
```

---

## 10. Transportation Services

```
Transport Service Providers
├── Taxi Operator
├── Auto Driver
├── Bus Operator
├── Logistics Company
├── Courier Service
├── Goods Transport
└── Moving Service
```

---

## 11. Agricultural Services

```
Agricultural Service Providers
├── Farmer
├── Dairy Farmer
├── Poultry Farm Owner
├── Fishery Operator
├── Agricultural Supplier
└── Farm Equipment Rental
```

---

## 12. Maintenance & Facilities

```
Maintenance Service Providers
├── Cleaning Service
├── Security Service
├── Pest Control
├── Landscaping Service
├── Facility Management
└── Housekeeping Service
```

---

## 13. Financial Services

```
Financial Service Providers
├── Bank
├── Insurance Company
├── Microfinance Institution
├── Investment Firm
├── Money Transfer Service
└── Cooperative Society
```

---

## 14. Technology Services

```
Technology Service Providers
├── IT Company
├── Software Company
├── Web Developer
├── App Developer
├── Data Center Operator
├── Tech Support
└── Digital Marketing Agency
```

---

## 15. Tourism Services

```
Tourism Service Providers
├── Travel Agency
├── Tour Operator
├── Hotel Chain
├── Resort Operator
├── Tourist Guide
└── Adventure Sports Operator
```

---

## Structure Format

**L1 = Domain** (e.g., Business - Food & Hospitality)  
**L2 = Category** (e.g., Restaurant Owner/Operator)  
**L3 = Type** (will be created on-demand in Layer-1 project as needed)

**Key Concept:**
- Entities are **people or organizations** that provide services or own assets
- An entity can have multiple roles:
  - **Asset Provider** (owns physical assets)
  - **Service Provider** (operates/provides services)
  - **Both** (owns and operates)
- Entities can exist with or without linked assets (e.g., freelance plumber)

**Implementation:**
- L1 (Domain) and L2 (Category) are defined here in datacollection folder
- L3 (Type) will be created dynamically in Layer-1 project based on actual requirements
- Types are added only when needed for specific use cases

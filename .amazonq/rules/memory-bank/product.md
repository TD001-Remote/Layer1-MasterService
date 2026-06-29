# Product Overview

## Project Purpose
Layer-1 (L1) geographic registry and entity management console for Tamil Nadu & Puducherry. Provides a structured database for cataloging physical settlement zones, service providers (entities), physical assets (non-entities), and domain-category-type hierarchies — with role-based admin workflows.

## Core Value Proposition
- Two-track registry: **Entities** (service providers) vs **Non-Entities** (physical assets) — completely separate at every layer
- Two-stage workflow: Staging (no geo/zone) → Admin Approval → Assignment (geo/zone + branch) → Active Registry
- DCT lifecycle management: split / convert / merge / modify / stop domains, categories, types with redirect chains
- L1 → L2 data push: domain-split JSON export with Drive links and cron scheduling
- Hierarchical Firestore storage scales to 1M+ records

## Key Features
- **Staging Area** (5 tabs): Create Entity, Create Non-Entity, CSV Bulk Upload, Pending Review, Approved
- **Entity Registry** (3 modes): Pending Assignment, Manage Records (search/filter/table), Branch Operations (tree)
- **Non-Entity Registry** (3 modes): same pattern, separate collection + theme
- **DCT Admin**: Split / Convert / Merge / Modify / Stop + Approval Queue + Archive Recovery
- **Dashboard**: KPI cards + Entity/Non-Entity expandable tree panels
- **Data Upload (L1→L2)**: Per-domain JSON push, Drive link storage, 2-day cron scheduling, history
- **Site Provisioner**: Multi-tenant portal provisioning per zone
- **Geography Manager**: Zone geo-hierarchy management
- **Collapsible Sidebar**: Theme-aware active indicators, glass-morphism header, page theme stripe
- **RBAC**: Master-admin bypasses module checks; admin requires per-module permission (localStorage-persisted)

## Tech Stack
- React 19 + TypeScript 5.8 + Vite 6
- Tailwind CSS 4.1 (Vite plugin)
- React Router 7
- Firebase (Auth + Firestore)
- Lucide React icons
- Motion animation library

## Target Users
- Data administrators managing geographic registries
- Masters admins approving DCT changes
- Field teams uploading CSV data for review

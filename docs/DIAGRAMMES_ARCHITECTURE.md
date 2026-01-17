# 📐 Diagrammes d'Architecture - FHA
**Foundation Health Analyzer - Visualisation Complète**

---

## 🏗️ Architecture Globale

```mermaid
graph TB
    subgraph "Couche Présentation"
        UI[Service Portal /fha]
        API[REST API /api/.../fha]
    end
    
    subgraph "Couche Métier"
        FHA[FHAnalyzer<br/>Entry Point]
        ENG[FHAnalysisEngine<br/>Orchestrator]
        EVAL[FHARuleEvaluator<br/>29 Handlers]
    end
    
    subgraph "Couche Données"
        CONFIG[Configurations]
        ITEMS[Verification Items]
        RULES[Issue Rules]
        RESULTS[Results]
    end
    
    UI -->|runAnalysis| FHA
    API -->|POST /analyze| FHA
    FHA -->|orchestrate| ENG
    ENG -->|evaluate| EVAL
    FHA -.load.-> CONFIG
    ENG -.load.-> ITEMS
    EVAL -.load.-> RULES
    FHA -->|save| RESULTS
    
    style FHA fill:#0c63d4,color:#fff
    style ENG fill:#6f42c1,color:#fff
    style EVAL fill:#d97706,color:#fff
```

---

## 🔄 Flux d'Exécution d'une Analyse

```mermaid
sequenceDiagram
    actor User
    participant Widget as FHA Dashboard
    participant Analyzer as FHAnalyzer
    participant Engine as FHAnalysisEngine
    participant Evaluator as FHARuleEvaluator
    participant DB as Database
    
    User->>Widget: Sélectionne config + "Run Analysis"
    Widget->>Analyzer: runAnalysis(configSysId)
    
    Analyzer->>DB: Load configuration
    DB-->>Analyzer: config + verification_items
    
    Analyzer->>Engine: runVerification(config)
    
    loop For each verification item
        Engine->>DB: Execute query
        DB-->>Engine: records[]
        
        Engine->>DB: Load issue_rules
        DB-->>Engine: rules[]
        
        loop For each record
            Engine->>Evaluator: evaluate(record, rules, context)
            Evaluator-->>Engine: issues[]
        end
    end
    
    Engine-->>Analyzer: result {issues, categories, metadata}
    
    Analyzer->>DB: Save to results table
    DB-->>Analyzer: result_sys_id
    
    Analyzer-->>Widget: {success, analysis_id, health_score}
    Widget->>User: Redirect to results page
```

---

## 📊 Modèle de Données

```mermaid
erDiagram
    CONFIGURATIONS ||--o{ VERIFICATION_ITEMS : contains
    VERIFICATION_ITEMS ||--o{ ISSUE_RULES : applies
    CONFIGURATIONS ||--o{ RESULTS : produces
    
    CONFIGURATIONS {
        string sys_id PK
        string name
        reference table
        boolean active
        boolean deep_scan
        boolean include_children_tables
        glide_list verification_items FK
    }
    
    VERIFICATION_ITEMS {
        string sys_id PK
        string name
        choice category
        reference table
        choice query_type
        string query_value
        script query_script
        string fields
        glide_list issue_rules FK
        boolean active
    }
    
    ISSUE_RULES {
        string sys_id PK
        string name
        string code
        string type
        choice severity
        string params
        script script
        boolean active
    }
    
    RESULTS {
        string sys_id PK
        string number
        choice state
        reference table_name
        integer health_score
        integer issue_found
        reference configuration FK
        json details
    }
```

---

## 🎨 Architecture Service Portal

```mermaid
graph LR
    subgraph "Pages"
        HOME[fha_homepage<br/>/fha]
        DOC[fha_documentation<br/>/fha?id=fha_documentation]
        RES[fha_analysis_results<br/>/fha?id=fha_analysis_results]
    end
    
    subgraph "Widgets"
        DASH[FHA Dashboard<br/>fha_dashboard]
        DETAIL[FHA Analysis Detail<br/>fha_analysis_detail]
        WDOC[FHA Documentation<br/>fha-documentation]
    end
    
    HOME --> DASH
    DOC --> WDOC
    RES --> DETAIL
    
    DASH -->|run analysis| DETAIL
    
    style DASH fill:#0c63d4,color:#fff
    style DETAIL fill:#6f42c1,color:#fff
    style WDOC fill:#d97706,color:#fff
```

---

## 🔌 Architecture REST API

```mermaid
graph TB
    subgraph "Client"
        APP[Application Externe]
        POSTMAN[Postman/cURL]
    end
    
    subgraph "API Gateway"
        AUTH[Authentication<br/>Basic Auth]
        ACL[Authorization<br/>Roles Check]
    end
    
    subgraph "Endpoints"
        GET1[GET /tables]
        POST1[POST /analyze/:table]
        POST2[POST /analyze_by_config/:id]
        GET2[GET /analysis/:id]
        GET3[GET /fields]
        GET4[GET /history]
        GET5[GET /statistics]
        POST3[POST /report/word]
    end
    
    subgraph "Business Logic"
        FHA[FHAnalyzer]
    end
    
    APP --> AUTH
    POSTMAN --> AUTH
    AUTH --> ACL
    
    ACL --> GET1
    ACL --> POST1
    ACL --> POST2
    ACL --> GET2
    ACL --> GET3
    ACL --> GET4
    ACL --> GET5
    ACL --> POST3
    
    GET1 --> FHA
    POST1 --> FHA
    POST2 --> FHA
    GET2 --> FHA
    GET3 --> FHA
    GET4 --> FHA
    GET5 --> FHA
    POST3 --> FHA
```

---

## 🧩 Système de Règles (Rule Engine)

```mermaid
graph TB
    subgraph "Configuration"
        VIT[Verification Item<br/>Table: sys_script<br/>Query: active=true]
        RULES[Issue Rules<br/>1. inactive<br/>2. br_density<br/>3. hardcoded_sys_id]
    end
    
    subgraph "Execution"
        QUERY[Execute Query<br/>GlideRecord]
        RECORDS[Records Array<br/>81 Business Rules]
    end
    
    subgraph "Evaluation"
        LOOP[For Each Record]
        EVAL[FHARuleEvaluator]
        
        subgraph "Handlers"
            H1[Handler: inactive]
            H2[Handler: br_density]
            H3[Handler: hardcoded_sys_id]
        end
        
        subgraph "Scripts"
            S1[Custom Script 1]
            S2[Custom Script 2]
        end
    end
    
    subgraph "Results"
        ISSUES[Issues Array<br/>12 issues found]
        SCORE[Health Score<br/>65/100]
    end
    
    VIT --> QUERY
    QUERY --> RECORDS
    RECORDS --> LOOP
    LOOP --> EVAL
    
    RULES --> EVAL
    
    EVAL --> H1
    EVAL --> H2
    EVAL --> H3
    EVAL --> S1
    EVAL --> S2
    
    H1 --> ISSUES
    H2 --> ISSUES
    H3 --> ISSUES
    S1 --> ISSUES
    S2 --> ISSUES
    
    ISSUES --> SCORE
```

---

## 📦 Structure des Composants

```mermaid
graph TB
    subgraph "Script Includes ACTIFS"
        A1[FHAnalyzer<br/>~200 lines]
        A2[FHAnalysisEngine<br/>~400 lines]
        A3[FHARuleEvaluator<br/>~800 lines]
    end
    
    subgraph "Script Includes INACTIFS"
        I1[FHCheckTable]
        I2[FHCheckAutomation]
        I3[FHCheckIntegration]
        I4[FHCheckSecurity]
        I5[FHCheckRegistry]
        I6[FHAnalysisContext]
        I7[FHOptionsHandler]
        I8[FHScanUtils]
        I9[FHAUtils]
    end
    
    subgraph "Tables"
        T1[configurations]
        T2[verification_items]
        T3[issue_rules]
        T4[results]
    end
    
    subgraph "REST APIs"
        R1[/tables]
        R2[/analyze/:table]
        R3[/analyze_by_config/:id]
        R4[/analysis/:id]
        R5[/fields]
        R6[/history]
        R7[/statistics]
        R8[/report/word]
    end
    
    subgraph "Widgets"
        W1[FHA Dashboard]
        W2[FHA Analysis Detail]
        W3[FHA Documentation]
    end
    
    A1 --> A2
    A2 --> A3
    A1 -.-> T1
    A2 -.-> T2
    A3 -.-> T3
    A1 --> T4
    
    R1 --> A1
    R2 --> A1
    R3 --> A1
    R4 --> A1
    R5 --> A1
    R6 --> A1
    R7 --> A1
    R8 --> A1
    
    W1 --> A1
    W2 -.-> T4
    
    style A1 fill:#0c63d4,color:#fff
    style A2 fill:#6f42c1,color:#fff
    style A3 fill:#d97706,color:#fff
    style I1 fill:#dc2626,color:#fff
    style I2 fill:#dc2626,color:#fff
    style I3 fill:#dc2626,color:#fff
    style I4 fill:#dc2626,color:#fff
    style I5 fill:#dc2626,color:#fff
    style I6 fill:#dc2626,color:#fff
    style I7 fill:#dc2626,color:#fff
    style I8 fill:#dc2626,color:#fff
    style I9 fill:#dc2626,color:#fff
```

---

## 🎯 Handler Types (29 Handlers)

```mermaid
mindmap
  root((FHARuleEvaluator<br/>29 Handlers))
    CORE Handlers
      count_threshold
      br_density
      inactive
      system_created
      missing_field
      size_threshold
      duplicate
      hardcoded_sys_id
      field_check
      pattern_scan
      aggregate_metric
    LEGACY Handlers
      missing_acl
      acl_issue
      br_heavy
      cs_heavy
      ui_action
      job_error
      job_inactive
      flow_error
      flow_config
      ... 9 autres
    Custom Scripts
      JavaScript
      Access to item
      Access to context
      Return issues[]
```

---

## 🚀 Workflow Utilisateur Complet

```mermaid
journey
    title Parcours Utilisateur - Analyse FHA
    section Préparation
      Se connecter à ServiceNow: 5: User
      Naviguer vers /fha: 5: User
    section Configuration
      Sélectionner configuration: 4: User
      Vérifier options: 3: User
    section Exécution
      Cliquer "Run Analysis": 5: User
      Attendre traitement: 2: System
      Redirection automatique: 5: System
    section Consultation
      Voir health score: 5: User
      Filtrer issues: 4: User
      Consulter détails: 4: User
    section Actions
      Exporter JSON: 3: User
      Créer tasks correctives: 2: User
      Partager rapport: 3: User
```

---

## 📊 Evolution de l'Architecture

```mermaid
timeline
    title Evolution FHA
    section v1.0 (Jan 2026)
        : Check Modules Architecture
        : FHCheckTable
        : FHCheckAutomation
        : FHCheckIntegration
        : Couplage fort
        : Difficile à étendre
    section v2.0 (Jan 2026)
        : Rule-Based Architecture
        : FHARuleEvaluator
        : 29 Handlers Built-in
        : Scripts Custom
        : Flexible & Extensible
    section v1.3 (17 Jan 2026 - Actuel)
        : Documentation Consolidée
        : 50+ pages
        : 29 handlers documentés
        : Guides cleanup
        : Widget documentation v1.3
    section Future (Q2-Q3 2026)
        : Tests ATF
        : Dashboard Analytique
        : Cache & Performance
        : AI Recommendations
```

---

## 💡 Pattern Handler : Individuel vs Agrégé

```mermaid
graph LR
    subgraph "Handler INDIVIDUEL"
        I1[Record 1]
        I2[Record 2]
        I3[Record 3]
        
        I1 -->|inactive handler| II1[Issue ou rien]
        I2 -->|inactive handler| II2[Issue ou rien]
        I3 -->|inactive handler| II3[Issue ou rien]
    end
    
    subgraph "Handler AGRÉGÉ"
        A1[Record 1]
        A2[Record 2]
        A3[Record 3]
        
        A1 -->|br_density| CHECK{Count > threshold?}
        A2 --> CHECK
        A3 --> CHECK
        
        CHECK -->|Oui| ISSUE[1 issue globale]
        CHECK -->|Non| NOTHING[Rien]
    end
    
    II1 --> RES1[0-3 issues]
    II2 --> RES1
    II3 --> RES1
    
    ISSUE --> RES2[0 ou 1 issue]
    NOTHING --> RES2
```

---

## 🔐 Sécurité & Rôles

```mermaid
graph TB
    subgraph "Utilisateurs"
        U1[Admin ServiceNow]
        U2[Développeur]
        U3[Consultant]
        U4[Manager]
    end
    
    subgraph "Rôles FHA"
        R1[x_1310794_founda_0.admin]
        R2[x_1310794_founda_0.user]
    end
    
    subgraph "Permissions"
        P1[✅ Run Analysis]
        P2[✅ View Results]
        P3[✅ Manage Configs]
        P4[✅ Manage Rules]
        P5[✅ Delete Results]
        
        P6[✅ View Results]
        P7[✅ Export Reports]
        P8[❌ Run Analysis]
        P9[❌ Manage Configs]
    end
    
    U1 --> R1
    U2 --> R1
    U3 --> R2
    U4 --> R2
    
    R1 --> P1
    R1 --> P2
    R1 --> P3
    R1 --> P4
    R1 --> P5
    
    R2 --> P6
    R2 --> P7
    R2 --> P8
    R2 --> P9
    
    style R1 fill:#0c63d4,color:#fff
    style R2 fill:#6f42c1,color:#fff
```

---

## 📈 Métriques & Performance

```mermaid
graph TB
    subgraph "Analyse Simple"
        S1[Config: Incident Basic]
        S2[Records: 1000]
        S3[Rules: 5]
        S4[Duration: 2-5 sec]
        S5[Issues: 0-10]
    end
    
    subgraph "Analyse Moyenne"
        M1[Config: User Complete]
        M2[Records: 5000]
        M3[Rules: 10]
        M4[Duration: 10-30 sec]
        M5[Issues: 10-50]
    end
    
    subgraph "Analyse Lourde"
        L1[Config: All BR Deep Scan]
        L2[Records: 50000]
        L3[Rules: 20]
        L4[Duration: 2-5 min]
        L5[Issues: 50-200]
    end
    
    S1 --> S2 --> S3 --> S4 --> S5
    M1 --> M2 --> M3 --> M4 --> M5
    L1 --> L2 --> L3 --> L4 --> L5
    
    style S1 fill:#16a34a,color:#fff
    style M1 fill:#d97706,color:#fff
    style L1 fill:#dc2626,color:#fff
```

---

## 🎨 Widget Dashboard - States

```mermaid
stateDiagram-v2
    [*] --> Initialized
    Initialized --> Loading: Load configs
    Loading --> Ready: Configs loaded
    Ready --> Analyzing: User clicks "Run Analysis"
    Analyzing --> Completed: Analysis done
    Analyzing --> Error: Analysis failed
    Completed --> ViewingResults: Redirect to results page
    Error --> Ready: User retries
    ViewingResults --> Ready: User returns to dashboard
    Ready --> [*]
    
    note right of Analyzing
        Shows loading spinner
        Disables button
    end note
    
    note right of Completed
        Shows success message
        Redirects in 2 seconds
    end note
```

---

## 🔄 Cycle de Vie d'une Issue

```mermaid
stateDiagram-v2
    [*] --> Detected: Handler finds problem
    Detected --> Recorded: Stored in results.details
    Recorded --> Displayed: Shown in widget
    Displayed --> Filtered: User applies filters
    Filtered --> Displayed: User removes filters
    Displayed --> Exported: User exports JSON
    Exported --> Shared: User shares with team
    Shared --> Resolved: Team fixes issue
    Resolved --> [*]
    
    Displayed --> Ignored: User dismisses
    Ignored --> [*]
    
    note right of Detected
        code, message, severity, details
    end note
    
    note right of Resolved
        Manual action outside FHA
    end note
```

---

## 📦 Déploiement & Installation

```mermaid
graph TB
    subgraph "Development"
        DEV[Dev Instance]
        CODE[Source Control]
    end
    
    subgraph "Quality Assurance"
        TEST[Test Instance]
        ATF[Automated Tests]
    end
    
    subgraph "Production"
        PROD[Prod Instance]
        USERS[End Users]
    end
    
    DEV -->|Commit| CODE
    CODE -->|Update Set| TEST
    TEST -->|Run Tests| ATF
    ATF -->|✅ Pass| PROD
    ATF -->|❌ Fail| DEV
    PROD --> USERS
    
    style DEV fill:#0c63d4,color:#fff
    style TEST fill:#d97706,color:#fff
    style PROD fill:#16a34a,color:#fff
```

---

## 🎯 Roadmap Future

```mermaid
gantt
    title FHA Roadmap 2026
    dateFormat  YYYY-MM-DD
    section Phase 1 - Cleanup
    Supprimer composants obsolètes    :done,    p1, 2026-01-17, 1w
    Consolider widgets                 :done,    p2, 2026-01-17, 3d
    Update documentation widget        :active,  p3, 2026-01-20, 2d
    
    section Phase 2 - Demo
    Créer configs demo                 :         p4, 2026-01-24, 2d
    Créer issue rules standards        :         p5, 2026-01-26, 2d
    Quick Start Guide                  :         p6, 2026-01-28, 1d
    
    section Phase 3 - Tests
    Créer tests ATF                    :         p7, 2026-01-31, 5d
    Améliorer gestion erreurs          :         p8, 2026-02-05, 2d
    
    section Phase 4 - Performance
    Implémenter cache                  :         p9, 2026-02-10, 3d
    Pagination                         :         p10, 2026-02-13, 2d
    Optimiser queries                  :         p11, 2026-02-15, 3d
    
    section Phase 5 - Advanced
    Dashboard analytique               :         p12, 2026-02-20, 5d
    Export avancé                      :         p13, 2026-02-27, 3d
    Recommandations IA                 :         p14, 2026-03-05, 5d
```

---

## 📊 Utilisation de ces Diagrammes

### Pour Présentation Client
1. **Architecture Globale** - Vue d'ensemble système
2. **Flux d'Exécution** - Comment ça marche
3. **Modèle de Données** - Stockage des informations
4. **Roadmap Future** - Vision long terme

### Pour Documentation Technique
1. **Structure des Composants** - Inventaire complet
2. **Système de Règles** - Rule engine détaillé
3. **Architecture REST API** - Intégrations
4. **Métriques & Performance** - Benchmarks

### Pour Développeurs
1. **Pattern Handler** - Comment créer handlers
2. **Cycle de Vie d'une Issue** - De la détection à la résolution
3. **Déploiement & Installation** - CI/CD
4. **Widget Dashboard - States** - Machine à états

---

## 💡 Comment Utiliser ces Diagrammes

### Dans PowerPoint/Keynote
1. Copier le code Mermaid
2. Aller sur https://mermaid.live
3. Coller le code
4. Export en PNG/SVG
5. Insérer dans slides

### Dans Markdown (GitHub, GitLab)
Les diagrammes s'afficheront automatiquement si Mermaid est supporté.

### Dans Confluence
Utiliser le plugin "Mermaid for Confluence" pour afficher les diagrammes.

### Dans ServiceNow
Créer un widget Service Portal avec la librairie Mermaid.js :
```html
<script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
<div class="mermaid">
  <!-- Code mermaid ici -->
</div>
```

---

**Créé par** : Claude (Expert ServiceNow)  
**Date** : 17 janvier 2026  
**Version** : 1.0  
**Format** : Mermaid Diagrams

**Liens Utiles** :
- **Mermaid Live Editor** : https://mermaid.live
- **Mermaid Documentation** : https://mermaid.js.org
- **Retour Index** : [INDEX_DOCUMENTATION.md](../INDEX_DOCUMENTATION.md)

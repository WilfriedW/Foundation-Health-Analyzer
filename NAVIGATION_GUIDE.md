# 🗺️ Foundation Health Analyzer - Navigation Guide

> **Quick Reference Card for Documentation Navigation**

---

## 🚀 Quick Navigation

### I'm a... (Choose Your Path)

```
┌─────────────────────────────────────────────────────────────┐
│                    WHO ARE YOU?                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  👤 New User / Business Analyst                             │
│     → START HERE: START_HERE.md                             │
│     → Portal: /fha?id=fha_documentation                     │
│                                                              │
│  ⚙️ Administrator / Configuration Manager                    │
│     → START HERE: CONSOLIDATED_DOCUMENTATION.md             │
│     → Widget Update: WIDGET_UPDATE_INSTRUCTIONS.md          │
│                                                              │
│  👨‍💻 Developer / Technical Architect                          │
│     → START HERE: CONSOLIDATED_DOCUMENTATION.md             │
│     → Handlers: docs/handlers/HANDLERS_REFERENCE.md         │
│     → Cleanup: OBSOLETE_COMPONENTS_CLEANUP.md               │
│                                                              │
│  🇫🇷 French Speaker (Francophone)                            │
│     → START HERE: RESUME_TRAVAUX_2026-01-17.md              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📚 Documentation Files (By Purpose)

### 🎯 Getting Started

| File | Time | Purpose |
|------|------|---------|
| **START_HERE.md** | 5 min | Quick overview, first steps |
| **RESUME_TRAVAUX_2026-01-17.md** | 10 min | Summary in French (Résumé en français) |
| **NAVIGATION_GUIDE.md** | 2 min | This file - navigation help |

### 📖 Complete Documentation

| File | Time | Purpose |
|------|------|---------|
| **CONSOLIDATED_DOCUMENTATION.md** | 2-3 hours | Complete FHA documentation (50+ pages) |
| **README.md** | 15 min | Technical README with quick links |

### 🔧 Technical Guides

| File | Time | Purpose |
|------|------|---------|
| **WIDGET_UPDATE_INSTRUCTIONS.md** | 30 min | Update documentation widget to v1.3.0 |
| **OBSOLETE_COMPONENTS_CLEANUP.md** | 1 hour | Remove 9 obsolete Script Includes |
| **DOCUMENTATION_OVERHAUL_SUMMARY.md** | 20 min | Summary of all work done |

### 📁 Additional Documentation

| Folder | Purpose |
|--------|---------|
| **docs/handlers/** | 29 rule handlers documentation |
| **docs/features/** | Feature-specific documentation |
| **docs/api/** | REST API documentation |
| **docs/guides/** | Deployment and testing guides |

---

## 🎯 By Task (What Do You Want to Do?)

### Run Analysis

```
GOAL: Run my first analysis
PATH: Portal → /fha → Select config → Run Analysis
DOCS: START_HERE.md § Quick Start
TIME: 5 minutes
```

### Learn FHA

```
GOAL: Understand how FHA works
PATH: CONSOLIDATED_DOCUMENTATION.md
      → Read: Overview, Architecture, Analysis Workflow
DOCS: Sections 1-6
TIME: 30 minutes
```

### Configure Rules

```
GOAL: Create or modify issue rules
PATH: CONSOLIDATED_DOCUMENTATION.md § Issue Rules System
      → docs/handlers/HANDLERS_REFERENCE.md (29 handlers)
      → docs/handlers/SCRIPTS_LIBRARY.md (ready-to-use scripts)
DOCS: Handlers documentation
TIME: 1-2 hours
```

### Use REST API

```
GOAL: Integrate FHA via REST API
PATH: CONSOLIDATED_DOCUMENTATION.md § REST API Reference
      → 8 endpoints with complete examples
DOCS: Section 8
TIME: 30 minutes
```

### Update Documentation Widget

```
GOAL: Update widget to v1.3.0
PATH: WIDGET_UPDATE_INSTRUCTIONS.md
      → Follow step-by-step procedure
DOCS: Complete guide with code snippets
TIME: 30 minutes
```

### Clean Up Obsolete Code

```
GOAL: Remove 9 inactive Script Includes
PATH: OBSOLETE_COMPONENTS_CLEANUP.md
      → Phase 1: Pre-Cleanup (Week 1)
      → Phase 2: Cleanup (Week 2-3)
      → Phase 3: Post-Cleanup (Week 4)
DOCS: Complete 3-phase procedure
TIME: 2-4 weeks
```

### Troubleshoot Issue

```
GOAL: Fix a problem with FHA
PATH: CONSOLIDATED_DOCUMENTATION.md § Troubleshooting
      → 5+ common issues with solutions
DOCS: Section 12
TIME: 10-20 minutes
```

### Understand Components

```
GOAL: Know what components exist
PATH: CONSOLIDATED_DOCUMENTATION.md § Components Inventory
      → Active: 3 Script Includes, 4 Widgets, 8 APIs
      → Obsolete: 9 Script Includes (marked for removal)
DOCS: Section 4
TIME: 15 minutes
```

---

## 🗂️ File Size Reference

| Size | Files | Time to Read |
|------|-------|--------------|
| **Small** (< 10 pages) | START_HERE.md, NAVIGATION_GUIDE.md | 5-10 min |
| **Medium** (10-20 pages) | RESUME_TRAVAUX, WIDGET_UPDATE, README | 15-30 min |
| **Large** (20-50 pages) | CONSOLIDATED_DOCUMENTATION, OBSOLETE_CLEANUP | 1-3 hours |
| **Very Large** (50+ pages) | Full documentation set | Multiple sessions |

---

## 📊 Visual Documentation Map

```
                    Foundation Health Analyzer
                              v1.3.0
                                │
                ┌───────────────┴───────────────┐
                │                               │
         🚀 Quick Start                  📚 Complete Docs
                │                               │
        ┌───────┴───────┐               ┌──────┴──────┐
        │               │               │             │
   START_HERE     Portal: /fha    CONSOLIDATED_   README
                                  DOCUMENTATION
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
              🔧 Technical        🧹 Cleanup          📊 Summary
                    │                   │                   │
            ┌───────┴───────┐      OBSOLETE_        DOCUMENTATION_
            │               │      COMPONENTS_      OVERHAUL_
     WIDGET_UPDATE    docs/        CLEANUP          SUMMARY
     INSTRUCTIONS   handlers/
                       │
                ┌──────┴──────┐
                │             │
          HANDLERS_    SCRIPTS_
          REFERENCE    LIBRARY
          (29 rules)   (15+ scripts)
```

---

## 🎨 Color-Coded Priority

### 🟢 Start Here (High Priority)
- **START_HERE.md** - First file to read
- **CONSOLIDATED_DOCUMENTATION.md** - Main documentation
- **Portal: /fha?id=fha_documentation** - Live documentation

### 🟡 Important (Medium Priority)
- **WIDGET_UPDATE_INSTRUCTIONS.md** - Update widget
- **README.md** - Quick reference
- **docs/handlers/HANDLERS_REFERENCE.md** - Rule handlers

### 🟠 Maintenance (As Needed)
- **OBSOLETE_COMPONENTS_CLEANUP.md** - Cleanup guide
- **DOCUMENTATION_OVERHAUL_SUMMARY.md** - Summary
- **docs/** folder - Additional documentation

### 🔵 Reference (Keep for Later)
- **NAVIGATION_GUIDE.md** - This file
- **CHANGELOG.md** - Version history
- **INDEX_LIVRABLES.md** - Handlers index

---

## 📱 One-Page Cheat Sheet

### Files to Read (In Order)

1. **START_HERE.md** (5 min) - Get oriented
2. **CONSOLIDATED_DOCUMENTATION.md** (30 min) - Overview sections
3. **Choose your path**:
   - User → Portal: `/fha?id=fha_documentation`
   - Admin → **WIDGET_UPDATE_INSTRUCTIONS.md**
   - Developer → **docs/handlers/HANDLERS_REFERENCE.md**

### Quick Links

- **Portal Documentation**: `/fha?id=fha_documentation`
- **Dashboard**: `/fha` or `/fha?id=fha_homepage`
- **Source Code**: `d852994c8312321083e1b4a6feaad3e6/update/`

### Key Components

- **3** Active Script Includes
- **4** Service Portal Widgets
- **8** REST API Endpoints
- **29** Rule Handlers
- **9** Obsolete Components (to remove)

### Need Help?

1. **Troubleshooting**: CONSOLIDATED_DOCUMENTATION.md § Troubleshooting
2. **API**: CONSOLIDATED_DOCUMENTATION.md § REST API Reference
3. **Handlers**: docs/handlers/HANDLERS_REFERENCE.md
4. **Français**: RESUME_TRAVAUX_2026-01-17.md

---

## 🔗 Essential Links

| Link | Description |
|------|-------------|
| [START_HERE.md](START_HERE.md) | 🚀 Start here if you're new |
| [CONSOLIDATED_DOCUMENTATION.md](CONSOLIDATED_DOCUMENTATION.md) | 📚 Complete documentation (50+ pages) |
| [RESUME_TRAVAUX_2026-01-17.md](RESUME_TRAVAUX_2026-01-17.md) | 🇫🇷 Résumé en français |
| [WIDGET_UPDATE_INSTRUCTIONS.md](WIDGET_UPDATE_INSTRUCTIONS.md) | 🔧 Update widget to v1.3.0 |
| [OBSOLETE_COMPONENTS_CLEANUP.md](OBSOLETE_COMPONENTS_CLEANUP.md) | 🧹 Remove obsolete components |
| [docs/handlers/HANDLERS_REFERENCE.md](docs/handlers/HANDLERS_REFERENCE.md) | 📖 29 rule handlers reference |
| [docs/handlers/SCRIPTS_LIBRARY.md](docs/handlers/SCRIPTS_LIBRARY.md) | 💾 15+ ready-to-use scripts |

---

## ❓ FAQ

**Q: Where do I start?**  
A: Read [START_HERE.md](START_HERE.md) (5 minutes)

**Q: I want complete documentation**  
A: Read [CONSOLIDATED_DOCUMENTATION.md](CONSOLIDATED_DOCUMENTATION.md) (50+ pages)

**Q: Je parle français**  
A: Lisez [RESUME_TRAVAUX_2026-01-17.md](RESUME_TRAVAUX_2026-01-17.md)

**Q: How do I update the widget?**  
A: Follow [WIDGET_UPDATE_INSTRUCTIONS.md](WIDGET_UPDATE_INSTRUCTIONS.md)

**Q: Which components are obsolete?**  
A: See [OBSOLETE_COMPONENTS_CLEANUP.md](OBSOLETE_COMPONENTS_CLEANUP.md) - 9 Script Includes

**Q: Where's the API documentation?**  
A: [CONSOLIDATED_DOCUMENTATION.md § REST API Reference](CONSOLIDATED_DOCUMENTATION.md#rest-api-reference)

**Q: How do I create a custom rule?**  
A: [docs/handlers/HANDLERS_REFERENCE.md](docs/handlers/HANDLERS_REFERENCE.md) + [docs/handlers/SCRIPTS_LIBRARY.md](docs/handlers/SCRIPTS_LIBRARY.md)

---

**Version**: 1.0  
**Created**: 2026-01-17  
**Purpose**: Quick navigation reference  
**Language**: English (+ français links)

**Happy navigating! 🗺️**


# Roomr - Project Context

## Stack

- React
- TypeScript
- TanStack Router
- Supabase
- Tailwind CSS

## Roles

- External
- Internal
- Admin

## Architecture Principles

- Incremental development
- One task at a time
- No unrelated changes
- Shared components when possible
- Preserve existing business rules

## AI Workflow

1. Read documentation
2. Analyze
3. Implement
4. Stop


# Roomr — Project Context

## Overview

Roomr is a corporate room and space reservation platform built with React, TypeScript and Supabase.

The application supports different user roles, each with its own permissions and workflows.

The project is developed incrementally. Every change must preserve existing business rules and avoid unnecessary refactoring.

---

# Tech Stack

Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

Routing

* TanStack Router (File-Based Routing)

Backend

* Supabase
* PostgreSQL
* Supabase Auth
* RPC Functions

UI

* shadcn/ui
* Lucide Icons

---

# User Roles

## External User

Can:

* View own reservations
* Create external reservation requests
* Access personal dashboard
* View calendar

Cannot:

* Access internal reservations
* Access admin tools

---

## Internal User

Can:

* View internal dashboard
* Create internal reservation requests
* Access calendar

Cannot:

* Access admin tools

---

## Administrator

Can:

* Review reservations
* Manage reservations
* Access all dashboards
* Create reservations on behalf of Internal or External users (future feature)

---

# Architecture Principles

The project follows these principles:

* Incremental development
* One task at a time
* Preserve existing functionality
* Avoid unnecessary refactoring
* Prefer composition over duplication
* Reuse existing components whenever possible
* Keep routes stable
* Keep URLs stable

---

# Development Workflow

Every development task follows this process:

1. Read project documentation
2. Analyze the requested task
3. Propose a solution (for architectural changes)
4. Implement only the approved task
5. Stop
6. Wait for review

Never continue to the next task automatically.

---

# Project Documentation

Always read:

docs/BACKLOG.md

docs/SPRINT.md

docs/ARCHITECTURE.md

docs/AI_GUIDELINES.md

docs/CHANGELOG.md

docs/PROJECT.md

docs/CONTEXT.md

docs/AI_MASTER_PROMPT.md

---

# Git Workflow

Each task is implemented in its own feature branch.

Example:

feature/task-02-shared-layout

Never work directly on main.

---

# Coding Principles

Always:

* Preserve existing business logic
* Preserve authentication
* Preserve authorization
* Preserve Supabase integration
* Preserve RPCs
* Preserve database schema
* Keep components reusable
* Keep code readable
* Minimize file modifications

Never:

* Rewrite unrelated code
* Introduce breaking changes
* Change URLs
* Change role permissions
* Modify unrelated files

---

# Project Goal

Build a scalable, maintainable corporate reservation platform with clean architecture, reusable components and isolated responsibilities.

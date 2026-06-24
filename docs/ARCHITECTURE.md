# Architecture Decisions

## ADR-001

Data

24/06/2026

Decisão

Cada perfil possui sua própria configuração de navegação.

Motivo

Evitar condicionais espalhadas pelo projeto.

---

## ADR-002

Claude Code

Pode:

- editar arquivos

Não pode:

- commit
- push
- merge
- rebase

---

## ADR-003

Toda alteração deve ser implementada em pequenas tarefas.

Nunca executar grandes refatorações em uma única etapa.
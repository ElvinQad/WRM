# CodeViz Research Context

> **Note**: This file contains research context from CodeViz. Most recent contexts are at the bottom.

---

## Research Query

explain .bmad-core's work

*Session: 44107ddbfe73bc579c45b174f18093b5 | Generated: 7/17/2025, 11:35:46 PM*

### Analysis Summary

# .bmad-core: The Brain of the BMad System

The **.bmad-core** directory serves as the central configuration and resource hub for the BMad system, orchestrating its behavior, defining its operational components, and providing foundational data and templates. It acts as the "brain" that dictates how BMad agents operate, what tasks they can perform, and how project documentation and workflows are structured.

## Core Configuration

The core behavior of the BMad system is defined by two primary configuration files:

*   **core-config.yaml**: This file [core-config.yaml](.bmad-core/core-config.yaml) specifies global settings for the BMad system, including versioning, markdown processing, and the structure for Product Requirement Documents (PRDs) and architecture documents. It defines where these documents are located and how they are sharded. It also lists files that should always be loaded for development and specifies logging and story locations.
*   **install-manifest.yaml**: This file [install-manifest.yaml](.bmad-core/install-manifest.yaml) records the installation details of the BMad system, including the version, installation timestamp, type of installation, and a list of all core files with their hashes and modification status. It also tracks installed IDE setups and expansion packs.

## Agent Management

The system leverages various AI agents, which are organized into individual definitions and teams.

### Agents

The [agents](.bmad-core/agents/) directory contains individual Markdown files, each defining the role, responsibilities, and perhaps specific instructions for a particular AI agent within the BMad ecosystem. Examples include:

*   **analyst.md**: Defines the role of an [Analyst agent](.bmad-core/agents/analyst.md).
*   **architect.md**: Defines the role of an [Architect agent](.bmad-core/agents/architect.md).
*   **dev.md**: Defines the role of a [Developer agent](.bmad-core/agents/dev.md).
*   **bmad-orchestrator.md**: Defines the role of the central [BMad Orchestrator agent](.bmad-core/agents/bmad-orchestrator.md).

### Agent Teams

The [agent-teams](.bmad-core/agent-teams/) directory contains YAML files that define predefined teams of agents. These team configurations specify which agents work together for specific types of projects or tasks. Examples include:

*   **team-all.yaml**: A team comprising [all available agents](.bmad-core/agent-teams/team-all.yaml).
*   **team-fullstack.yaml**: A team tailored for [fullstack development tasks](.bmad-core/agent-teams/team-fullstack.yaml).
*   **team-ide-minimal.yaml**: A minimal team configuration, possibly for [IDE-integrated workflows](.bmad-core/agent-teams/team-ide-minimal.yaml).

## Workflows

The [workflows](.bmad-core/workflows/) directory houses YAML files that define structured processes or sequences of tasks for different project types. These workflows guide the agents through various stages of development, from greenfield (new projects) to brownfield (existing projects). Examples include:

*   **greenfield-fullstack.yaml**: A workflow for [new fullstack projects](.bmad-core/workflows/greenfield-fullstack.yaml).
*   **brownfield-ui.yaml**: A workflow for [UI development on existing projects](.bmad-core/workflows/brownfield-ui.yaml).

## Tasks

The [tasks](.bmad-core/tasks/) directory contains Markdown files that describe specific, actionable tasks that agents can perform. These tasks range from documentation generation to story creation and validation. Examples include:

*   **create-doc.md**: Defines the task for [creating documentation](.bmad-core/tasks/create-doc.md).
*   **review-story.md**: Defines the task for [reviewing a user story](.bmad-core/tasks/review-story.md).
*   **generate-ai-frontend-prompt.md**: Defines a task for [generating AI prompts for frontend development](.bmad-core/tasks/generate-ai-frontend-prompt.md).

## Templates

The [templates](.bmad-core/templates/) directory provides YAML files that serve as blueprints for various project artifacts and documents, ensuring consistency and adherence to predefined structures. Examples include:

*   **prd-tmpl.yaml**: A template for [Product Requirement Documents](.bmad-core/templates/prd-tmpl.yaml).
*   **architecture-tmpl.yaml**: A template for [architecture documents](.bmad-core/templates/architecture-tmpl.yaml).
*   **story-tmpl.yaml**: A template for [user stories](.bmad-core/templates/story-tmpl.yaml).

## Checklists

The [checklists](.bmad-core/checklists/) directory contains Markdown files that provide structured lists of items to verify or complete during different phases of a project or by specific roles. Examples include:

*   **architect-checklist.md**: A checklist for [architects](.bmad-core/checklists/architect-checklist.md).
*   **story-dod-checklist.md**: A "Definition of Done" checklist for [user stories](.bmad-core/checklists/story-dod-checklist.md).

## Data

The [data](.bmad-core/data/) directory stores foundational knowledge and reference materials that the agents can access and utilize. Examples include:

*   **bmad-kb.md**: A [knowledge base](.bmad-core/data/bmad-kb.md) for the BMad system.
*   **technical-preferences.md**: Documenting [technical preferences](.bmad-core/data/technical-preferences.md).

## Utilities

The [utils](.bmad-core/utils/) directory contains utility Markdown files that might provide general guidance or helper information for the BMad system's operation.

*   **workflow-management.md**: Provides information on [workflow management](.bmad-core/utils/workflow-management.md).
*   **bmad-doc-template.md**: A general [BMad document template](.bmad-core/utils/bmad-doc-template.md).


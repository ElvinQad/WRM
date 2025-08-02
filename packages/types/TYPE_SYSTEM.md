 WRM Type System Documentation

This document provides a comprehensive overview of the type system architecture in the WRM (Work Resource Management) project and guidelines for maintaining type consistency.

## 📁 Type Architecture Overview

### Single Source of Truth: `@wrm/types`

All types are centralized in the `packages/types` package to ensure consistency across:
- **Backend** (NestJS + Prisma)
- **Frontend** (React + Redux)  
- **Testing** (Deno test suites)

### Core Type Categories

#### 1. **Entity Types** (Database Layer)
- `TicketEntity` - Direct mapping to database schema (snake_case)
- `TicketTypeEntity` - Ticket type definitions with schema mapping
- `AgentEntity` & `AgentCollaborationEntity` - AI assistant entities

#### 2. **API Types** (Backend Layer)
- `BaseTicket` - Core ticket interface for API communication
- `CreateTicketDto` & `UpdateTicketDto` - Request DTOs
- `MoveTicketDto` & `ResizeTicketDto` - Timeline-specific operations

#### 3. **Frontend Types** (UI Layer)
- `FrontendTicket` - Enhanced with UI properties and Date objects
- `TicketWithPosition` - Timeline rendering with calculated positions
- `TimelineProps` & related interfaces - Component props

#### 4. **Transformer Functions**
- `entityToTicket()` - Database → API (snake_case → camelCase)
- `ticketToEntity()` - API → Database (camelCase → snake_case) 
- `baseToFrontendTicket()` - API → Frontend (strings → Dates + UI props)
- `frontendToBaseTicket()` - Frontend → API (Dates → strings)

## 🔄 Data Flow & Transformations

```
Database (snake_case) ←→ API (camelCase) ←→ Frontend (Dates + UI)
     TicketEntity    ←→   BaseTicket   ←→  FrontendTicket
```

### Timeline-Specific Flow
```
FrontendTicket → TicketWithPosition (+ position calculations)
                         ↓
              Timeline Component Rendering
```

## 📋 Type Consistency Rules

### ✅ DO:
1. **Always import from `@wrm/types`** - Never define duplicate types locally
2. **Use transformers** - Always convert between layers using provided functions
3. **Follow naming conventions**:
   - Database: `snake_case` (matches Prisma schema)
   - API/Frontend: `camelCase` (TypeScript standard)
4. **Add new types to the shared package** first, then import elsewhere
5. **Run validation** before committing: `deno task validate`

### ❌ DON'T:
1. **Define duplicate interfaces** in component files
2. **Mix naming conventions** within the same layer
3. **Skip transformers** when converting between layers
4. **Import relative types** when shared types exist
5. **Modify entity interfaces** without updating the database schema

## 🛠️ Development Guidelines

### Adding New Types

1. **Define in `@wrm/types`**:
   ```typescript
   // packages/types/src/lib/types.ts
   export interface NewFeature {
     id: string;
     name: string;
     // ... other fields
   }
   ```

2. **Export from index**:
   ```typescript
   // packages/types/src/index.ts
   export type { NewFeature } from './lib/types.ts';
   ```

3. **Add transformers if needed**:
   ```typescript
   // packages/types/src/lib/transformers.ts
   export function entityToNewFeature(entity: NewFeatureEntity): NewFeature {
     // transformation logic
   }
   ```

4. **Import in consuming packages**:
   ```typescript
   import { NewFeature } from '@wrm/types';
   ```

### Modifying Existing Types

1. **Update the shared type** in `@wrm/types`
2. **Update transformers** if the change affects data conversion
3. **Update database schema** if entity types change
4. **Run validation** to check for breaking changes
5. **Update dependent code** in frontend/backend

## 🧪 Type Validation

### Automated Validation
```bash
# Run type consistency validation
cd packages/types
deno task validate

# Check type compilation
deno task type-check
```

### Manual Validation Checklist

- [ ] No duplicate type definitions across packages
- [ ] All imports use `@wrm/types` instead of relative paths
- [ ] Database schema matches entity interfaces
- [ ] Transformers handle all entity ↔ API conversions
- [ ] Frontend components use `FrontendTicket` appropriately
- [ ] Timeline types include position calculations

## 📊 Current Type Coverage

### ✅ Fully Covered
- **Tickets**: Complete pipeline (Entity → API → Frontend → Timeline)
- **Ticket Types**: Full CRUD with transformers
- **Agents**: Basic entity and collaboration types
- **Timeline**: Comprehensive UI and interaction types

### 🔄 Partial Coverage  
- **User Management**: Basic types exist, may need enhancement
- **Authentication**: JWT and session types need review

### ❌ Missing Coverage
- **Real-time Events**: WebSocket message types
- **File Uploads**: Attachment and media types
- **Reporting**: Analytics and export types

## 🚀 Advanced Type Features

### Epic-Specific Enhancements

#### Epic 1: Timeline Dynamics
- **Time-aware states**: `TicketStatus` with past/present/future logic
- **Position calculations**: `TicketWithPosition` with pixel-perfect rendering
- **Drag & drop**: `DragState` with conflict detection

#### Epic 2: Custom Properties
- **Schema validation**: `CustomFieldDefinition` with type constraints
- **Dynamic forms**: Type-safe custom property handling

#### Epic 3: AI Integration
- **Agent collaboration**: Structured workflow types
- **Context tracking**: AI-generated content metadata

### Performance Considerations

1. **Lazy loading**: Timeline types load position data only when needed
2. **Memory efficiency**: Transformers reuse objects where possible
3. **Validation caching**: Type validation results cached during development

## 🔧 Troubleshooting

### Common Issues

1. **Import errors**: Check if importing from `@wrm/types` instead of relative paths
2. **Type mismatches**: Verify transformers are used between layers
3. **Build failures**: Run `deno task type-check` to identify issues
4. **Runtime errors**: Ensure Date objects are properly converted to/from strings

### Debugging Commands

```bash
# Validate all types
deno task validate

# Check specific file
deno check packages/frontend/src/components/timeline/Timeline.tsx

# Find type usage
grep -r "FrontendTicket" packages/frontend/src/

# Check imports  
grep -r "@wrm/types" packages/
```

## 📈 Future Improvements

### Planned Enhancements

1. **Schema-first approach**: Generate types directly from Prisma schema
2. **Real-time validation**: Live type checking during development
3. **Documentation generation**: Auto-generate API docs from types
4. **Performance monitoring**: Track type conversion overhead

### Contributing

When contributing new features:

1. **Design types first** - Think about the data flow
2. **Start with the shared package** - Define core interfaces
3. **Add transformers** - Handle layer conversions properly  
4. **Test thoroughly** - Validate type safety at boundaries
5. **Update documentation** - Keep this guide current

---

*Last updated: August 2, 2025*
*Maintained by: WRM Development Team*

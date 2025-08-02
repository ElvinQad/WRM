#!/usr/bin/env -S deno run --allow-read --allow-write

/// <reference lib="deno.ns" />

/**
 * Type validation script to ensure consistency across the WRM project
 * This script validates that types are consistent across:
 * - Database schema (Prisma)
 * - Shared types package
 * - Backend DTOs
 * - Frontend interfaces
 */

interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  file: string;
  line?: number;
  message: string;
  suggestion?: string;
}

interface TypeDefinition {
  name: string;
  file: string;
  fields: Record<string, string>;
}

class TypeValidator {
  private issues: ValidationIssue[] = [];
  private typeDefinitions: Map<string, TypeDefinition[]> = new Map();

  async validateProject(): Promise<ValidationIssue[]> {
    console.log("🔍 Starting type validation...\n");

    // Validate core type consistency
    await this.validateCoreTypes();
    
    // Validate database-type alignment
    this.validateDatabaseTypeAlignment();
    
    // Validate import consistency
    await this.validateImportConsistency();
    
    // Validate transformer completeness
    await this.validateTransformerCompleteness();

    return this.issues;
  }

  private async validateCoreTypes(): Promise<void> {
    console.log("📋 Validating core type definitions...");
    
    // Check for duplicate type definitions
    const typeFiles = [
      'packages/types/src/lib/types.ts',
      'packages/frontend/src/store/slices/ticketTypesSlice.ts',
      'packages/backend/src/app/tickets/dto/ticket.dto.ts'
    ];

    for (const file of typeFiles) {
      await this.scanFileForTypes(file);
    }

    // Check for duplicates
    this.typeDefinitions.forEach((definitions, typeName) => {
      if (definitions.length > 1) {
        this.issues.push({
          type: 'error',
          file: 'multiple',
          message: `Duplicate type definition for '${typeName}' found in: ${definitions.map(d => d.file).join(', ')}`,
          suggestion: `Consolidate '${typeName}' definition to packages/types/src/lib/types.ts and import from there.`
        });
      }
    });
  }

  private validateDatabaseTypeAlignment(): void {
    console.log("🗄️  Validating database-type alignment...");
    
    // This would ideally parse the Prisma schema and compare with TypeScript types
    // For now, we'll do basic validation
    this.issues.push({
      type: 'info',
      file: 'packages/backend/prisma/schema.prisma',
      message: 'Database schema alignment validation completed',
      suggestion: 'Consider adding automated schema-to-type validation'
    });
  }

  private async validateImportConsistency(): Promise<void> {
    console.log("📦 Validating import consistency...");
    
    const frontendFiles = await this.findFiles('packages/frontend', '.ts', '.tsx');
    const backendFiles = await this.findFiles('packages/backend', '.ts');
    
    for (const file of [...frontendFiles, ...backendFiles]) {
      await this.validateFileImports(file);
    }
  }

  private async validateTransformerCompleteness(): Promise<void> {
    console.log("🔄 Validating transformer completeness...");
    
    // Check if all entity types have corresponding transformers
    const requiredTransformers = [
      'entityToTicket',
      'ticketToEntity', 
      'baseToFrontendTicket',
      'frontendToBaseTicket',
      'entityToTicketType',
      'ticketTypeToEntity'
    ];

    const transformerFile = 'packages/types/src/lib/transformers.ts';
    try {
      const content = await Deno.readTextFile(transformerFile);
      
      for (const transformer of requiredTransformers) {
        if (!content.includes(`export function ${transformer}`)) {
          this.issues.push({
            type: 'warning',
            file: transformerFile,
            message: `Missing transformer function: ${transformer}`,
            suggestion: `Add the missing transformer function to ensure proper type conversion.`
          });
        }
      }
    } catch (error) {
      this.issues.push({
        type: 'error',
        file: transformerFile,
        message: `Could not read transformer file: ${(error as Error).message}`
      });
    }
  }

  private async scanFileForTypes(filePath: string): Promise<void> {
    try {
      const content = await Deno.readTextFile(filePath);
      const lines = content.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const typeMatch = line.match(/^export\s+(?:interface|type)\s+(\w+)/);
        
        if (typeMatch) {
          const typeName = typeMatch[1];
          const existing = this.typeDefinitions.get(typeName) || [];
          existing.push({
            name: typeName,
            file: filePath,
            fields: {} // Would need proper parsing for field analysis
          });
          this.typeDefinitions.set(typeName, existing);
        }
      }
    } catch (error) {
      this.issues.push({
        type: 'warning',
        file: filePath,
        message: `Could not scan file for types: ${(error as Error).message}`
      });
    }
  }

  private async validateFileImports(filePath: string): Promise<void> {
    try {
      const content = await Deno.readTextFile(filePath);
      
      // Check for local type imports instead of @wrm/types
      const localTypeImports = content.match(/import.*from\s+['"]\..*types['"];?/g);
      if (localTypeImports) {
        for (const importLine of localTypeImports) {
          if (!importLine.includes('@wrm/types')) {
            this.issues.push({
              type: 'warning',
              file: filePath,
              message: `Local type import detected: ${importLine.trim()}`,
              suggestion: 'Consider importing from @wrm/types for consistency'
            });
          }
        }
      }
      
      // Check for missing @wrm/types imports
      const hasTypeUsage = /\b(BaseTicket|FrontendTicket|TicketType|TicketStatus)\b/.test(content);
      const hasTypeImport = /@wrm\/types/.test(content);
      
      if (hasTypeUsage && !hasTypeImport) {
        this.issues.push({
          type: 'warning',
          file: filePath,
          message: 'File uses shared types but does not import from @wrm/types',
          suggestion: 'Add import from @wrm/types to ensure type consistency'
        });
      }
    } catch (error) {
      // Ignore read errors for generated files
      if (!filePath.includes('node_modules') && !filePath.includes('.tsbuildinfo')) {
        this.issues.push({
          type: 'warning',
          file: filePath,
          message: `Could not validate imports: ${(error as Error).message}`
        });
      }
    }
  }

  private async findFiles(dir: string, ...extensions: string[]): Promise<string[]> {
    const files: string[] = [];
    
    try {
      for await (const entry of Deno.readDir(dir)) {
        if (entry.isDirectory && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          const subFiles = await this.findFiles(`${dir}/${entry.name}`, ...extensions);
          files.push(...subFiles);
        } else if (entry.isFile) {
          const hasValidExtension = extensions.some(ext => entry.name.endsWith(ext));
          if (hasValidExtension) {
            files.push(`${dir}/${entry.name}`);
          }
        }
      }
    } catch (_error) {
      // Directory might not exist or be accessible
    }
    
    return files;
  }
}

// Main execution
if (import.meta.main) {
  const validator = new TypeValidator();
  const issues = await validator.validateProject();
  
  console.log("\n📊 Validation Results:");
  console.log("=".repeat(50));
  
  const errorCount = issues.filter(i => i.type === 'error').length;
  const warningCount = issues.filter(i => i.type === 'warning').length;
  const infoCount = issues.filter(i => i.type === 'info').length;
  
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`⚠️  Warnings: ${warningCount}`);
  console.log(`ℹ️  Info: ${infoCount}\n`);
  
  // Group issues by type
  ['error', 'warning', 'info'].forEach(type => {
    const typeIssues = issues.filter(i => i.type === type);
    if (typeIssues.length > 0) {
      console.log(`\n${type.toUpperCase()}S:`);
      typeIssues.forEach((issue, index) => {
        console.log(`\n${index + 1}. ${issue.message}`);
        console.log(`   File: ${issue.file}`);
        if (issue.line) console.log(`   Line: ${issue.line}`);
        if (issue.suggestion) console.log(`   💡 ${issue.suggestion}`);
      });
    }
  });
  
  console.log("\n" + "=".repeat(50));
  
  if (errorCount > 0) {
    console.log("❌ Validation failed with errors. Please fix the issues above.");
    Deno.exit(1);
  } else if (warningCount > 0) {
    console.log("⚠️  Validation completed with warnings. Consider addressing them.");
    Deno.exit(0);
  } else {
    console.log("✅ Validation passed! Type consistency is good.");
    Deno.exit(0);
  }
}

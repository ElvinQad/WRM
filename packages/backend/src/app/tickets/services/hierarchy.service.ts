import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service.ts';
import { 
  CreateChildTicketDto, 
  HierarchyResponseDto, 
  CompletionSettingsDto, 
  MoveHierarchyDto, 
  CompletionProgressResponseDto,
  BulkHierarchyOperationDto,
  TicketWithHierarchyDto,
  HierarchyProgressDto 
} from '../dto/hierarchy.dto.ts';
import pkg, { Ticket } from '@prisma/client';

const { TicketStatus } = pkg;

interface TicketWithChildren extends Ticket {
  childTickets?: TicketWithChildren[];
  hierarchyParent?: Ticket | null;
}

@Injectable()
export class HierarchyService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a child ticket under a parent ticket
   * Subtask 2.1: Child ticket creation with selective property inheritance
   */
  async createChildTicket(parentId: string, userId: string, createChildDto: CreateChildTicketDto): Promise<TicketWithHierarchyDto> {
    // Validate parent ticket exists and belongs to user
    const parentTicket = await this.prisma.ticket.findFirst({
      where: { id: parentId, userId },
      include: { ticketType: true }
    });

    if (!parentTicket) {
      throw new NotFoundException('Parent ticket not found');
    }

    // Check nesting level limit (max 3 levels: 0,1,2,3)
    if (parentTicket.nestingLevel >= 3) {
      throw new BadRequestException('Maximum nesting level reached (3 levels)');
    }

    // Prepare child ticket data
    const childTicketData: any = {
      userId,
      title: createChildDto.title,
      description: createChildDto.description,
      typeId: parentTicket.typeId, // Always inherit ticket type
      hierarchyParentId: parentId,
      nestingLevel: parentTicket.nestingLevel + 1,
      startTime: createChildDto.startTime ? new Date(createChildDto.startTime) : new Date(),
      endTime: createChildDto.endTime ? new Date(createChildDto.endTime) : new Date(Date.now() + 60 * 60 * 1000), // Default 1 hour
      status: TicketStatus.FUTURE,
      customProperties: {},
      autoCompleteOnChildrenDone: false,
      childCompletionCount: 0,
      totalChildCount: 0,
      isRecurring: false,
      isInPool: false,
      aiGenerated: false
    };

    // Handle selective custom property inheritance
    if (createChildDto.inheritCustomProperties && createChildDto.inheritCustomProperties.length > 0) {
      const parentProperties = parentTicket.customProperties as any || {};
      const inheritedProperties: any = {};
      
      for (const propertyKey of createChildDto.inheritCustomProperties) {
        if (parentProperties[propertyKey] !== undefined) {
          inheritedProperties[propertyKey] = parentProperties[propertyKey];
        }
      }
      
      childTicketData.customProperties = inheritedProperties;
    }

    // Calculate child order (next in sequence)
    const siblingCount = await this.prisma.ticket.count({
      where: { hierarchyParentId: parentId }
    });
    childTicketData.childOrder = siblingCount + 1;

    // Create child ticket
    const childTicket = await this.prisma.ticket.create({
      data: childTicketData,
      include: {
        childTickets: true,
        hierarchyParent: true,
        ticketType: true
      }
    });

    return this.mapToHierarchyDto(childTicket);
  }

  /**
   * Get hierarchy information for a ticket
   * Subtask 2.3: Hierarchy-aware ticket retrieval
   */
  async getHierarchy(ticketId: string, userId: string): Promise<HierarchyResponseDto> {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, userId },
      include: {
        childTickets: {
          include: {
            childTickets: {
              include: {
                childTickets: true // Support up to 3 levels
              }
            }
          },
          orderBy: { childOrder: 'asc' }
        },
        hierarchyParent: true
      }
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const children = ticket.childTickets.map(child => this.mapToHierarchyDto(child));
    const completionProgress = this.calculateCompletionProgress(ticket.childTickets);
    const maxDepth = this.calculateMaxDepth(ticket);

    return {
      ticket: this.mapToHierarchyDto(ticket),
      children,
      completionProgress,
      maxDepth
    };
  }

  /**
   * Update parent completion settings
   * Subtask 2.5: Configurable auto-completion logic
   */
  async updateCompletionSettings(ticketId: string, userId: string, settings: CompletionSettingsDto): Promise<void> {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, userId }
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        autoCompleteOnChildrenDone: settings.autoCompleteOnChildrenDone
      }
    });
  }

  /**
   * Move ticket in hierarchy
   * Subtask 2.2: Hierarchy validation to prevent circular references
   */
  async moveTicketInHierarchy(ticketId: string, userId: string, moveData: MoveHierarchyDto): Promise<void> {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, userId }
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Validate new parent if provided
    if (moveData.newParentId) {
      const newParent = await this.prisma.ticket.findFirst({
        where: { id: moveData.newParentId, userId }
      });

      if (!newParent) {
        throw new NotFoundException('New parent ticket not found');
      }

      // Prevent circular dependency
      await this.validateNoCircularDependency(ticketId, moveData.newParentId);

      // Check nesting level if validation enabled
      if (moveData.validateNesting !== false) {
        const newNestingLevel = newParent.nestingLevel + 1;
        await this.validateNestingLevel(ticketId, newNestingLevel);
      }
    }

    // Calculate new nesting level
    let newNestingLevel = 0;
    if (moveData.newParentId) {
      const parent = await this.prisma.ticket.findUnique({
        where: { id: moveData.newParentId }
      });
      newNestingLevel = parent!.nestingLevel + 1;
    }

    // Update ticket hierarchy
    await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        hierarchyParentId: moveData.newParentId || null,
        nestingLevel: newNestingLevel
      }
    });

    // Update all descendants' nesting levels
    await this.updateDescendantNestingLevels(ticketId);
  }

  /**
   * Get completion progress for a parent ticket
   * Subtask 2.4: Parent completion status calculation
   */
  async getCompletionProgress(ticketId: string, userId: string): Promise<CompletionProgressResponseDto> {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, userId },
      include: { childTickets: true }
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const completedChildren = ticket.childTickets.filter(
      child => child.status === TicketStatus.PAST_CONFIRMED || child.status === TicketStatus.ACTIVE
    ).length;

    const totalChildren = ticket.childTickets.length;
    const percentage = totalChildren > 0 ? Math.round((completedChildren / totalChildren) * 100) : 0;
    const canAutoComplete = ticket.autoCompleteOnChildrenDone && completedChildren === totalChildren && totalChildren > 0;

    return {
      completedChildren,
      totalChildren,
      percentage,
      canAutoComplete
    };
  }

  /**
   * Bulk operations for hierarchy management
   * Subtask 2.6: Bulk operations for hierarchy management
   */
  async bulkHierarchyOperation(userId: string, bulkOperation: BulkHierarchyOperationDto): Promise<void> {
    // Validate all tickets belong to user
    const tickets = await this.prisma.ticket.findMany({
      where: {
        id: { in: bulkOperation.ticketIds },
        userId
      }
    });

    if (tickets.length !== bulkOperation.ticketIds.length) {
      throw new ForbiddenException('Some tickets not found or access denied');
    }

    switch (bulkOperation.operation) {
      case 'move':
        if (!bulkOperation.targetParentId) {
          throw new BadRequestException('Target parent ID required for move operation');
        }
        for (const ticketId of bulkOperation.ticketIds) {
          await this.moveTicketInHierarchy(ticketId, userId, { 
            newParentId: bulkOperation.targetParentId 
          });
        }
        break;

      case 'delete':
        await this.prisma.ticket.deleteMany({
          where: {
            id: { in: bulkOperation.ticketIds },
            userId
          }
        });
        break;

      case 'complete':
        await this.prisma.ticket.updateMany({
          where: {
            id: { in: bulkOperation.ticketIds },
            userId
          },
          data: {
            status: TicketStatus.PAST_CONFIRMED
          }
        });
        break;
    }
  }

  /**
   * Check and trigger auto-completion of parent tickets
   * Called when child ticket status changes
   */
  async checkAndTriggerAutoCompletion(childTicketId: string): Promise<void> {
    const childTicket = await this.prisma.ticket.findUnique({
      where: { id: childTicketId },
      include: {
        hierarchyParent: {
          include: { childTickets: true }
        }
      }
    });

    if (!childTicket?.hierarchyParent) return;

    const parent = childTicket.hierarchyParent;
    if (!parent.autoCompleteOnChildrenDone) return;

    // Check if all children are completed
    const completedChildren = parent.childTickets.filter(
      child => child.status === TicketStatus.PAST_CONFIRMED
    ).length;

    const totalChildren = parent.childTickets.length;

    if (completedChildren === totalChildren && totalChildren > 0) {
      // Auto-complete parent
      await this.prisma.ticket.update({
        where: { id: parent.id },
        data: { status: TicketStatus.PAST_CONFIRMED }
      });

      // Recursively check parent's parent
      if (parent.hierarchyParentId) {
        await this.checkAndTriggerAutoCompletion(parent.id);
      }
    }
  }

  // Private helper methods

  private async validateNoCircularDependency(ticketId: string, newParentId: string): Promise<void> {
    // Check if newParentId is a descendant of ticketId
    const descendants = await this.getDescendantIds(ticketId);
    if (descendants.includes(newParentId)) {
      throw new BadRequestException('Circular dependency: Cannot move ticket under its own descendant');
    }
  }

  private async getDescendantIds(ticketId: string): Promise<string[]> {
    const children = await this.prisma.ticket.findMany({
      where: { hierarchyParentId: ticketId },
      select: { id: true }
    });

    let descendants: string[] = children.map(c => c.id);

    // Recursively get descendants
    for (const child of children) {
      const childDescendants = await this.getDescendantIds(child.id);
      descendants = descendants.concat(childDescendants);
    }

    return descendants;
  }

  private async validateNestingLevel(ticketId: string, newLevel: number): Promise<void> {
    if (newLevel > 3) {
      throw new BadRequestException('Moving ticket would exceed maximum nesting level (3)');
    }

    // Check if any descendants would exceed limit
    const maxDescendantDepth = await this.getMaxDescendantDepth(ticketId);
    if (newLevel + maxDescendantDepth > 3) {
      throw new BadRequestException('Moving ticket would cause descendants to exceed maximum nesting level');
    }
  }

  private async getMaxDescendantDepth(ticketId: string, currentDepth: number = 0): Promise<number> {
    const children = await this.prisma.ticket.findMany({
      where: { hierarchyParentId: ticketId },
      select: { id: true }
    });

    if (children.length === 0) return currentDepth;

    let maxDepth = currentDepth;
    for (const child of children) {
      const childDepth = await this.getMaxDescendantDepth(child.id, currentDepth + 1);
      maxDepth = Math.max(maxDepth, childDepth);
    }

    return maxDepth;
  }

  private async updateDescendantNestingLevels(ticketId: string): Promise<void> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { childTickets: true }
    });

    if (!ticket || ticket.childTickets.length === 0) return;

    // Update direct children
    for (const child of ticket.childTickets) {
      const newLevel = ticket.nestingLevel + 1;
      await this.prisma.ticket.update({
        where: { id: child.id },
        data: { nestingLevel: newLevel }
      });

      // Recursively update descendants
      await this.updateDescendantNestingLevels(child.id);
    }
  }

  private calculateCompletionProgress(children: Ticket[]): HierarchyProgressDto {
    const completed = children.filter(
      child => child.status === TicketStatus.PAST_CONFIRMED || child.status === TicketStatus.ACTIVE
    ).length;
    
    const total = children.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  }

  private calculateMaxDepth(ticket: TicketWithChildren, currentDepth: number = 0): number {
    if (!ticket.childTickets || ticket.childTickets.length === 0) {
      return currentDepth;
    }

    let maxDepth = currentDepth;
    for (const child of ticket.childTickets) {
      const childDepth = this.calculateMaxDepth(child, currentDepth + 1);
      maxDepth = Math.max(maxDepth, childDepth);
    }

    return maxDepth;
  }

  private mapToHierarchyDto(ticket: any): TicketWithHierarchyDto {
    return {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      startTime: ticket.startTime,
      endTime: ticket.endTime,
      hierarchyParentId: ticket.hierarchyParentId,
      nestingLevel: ticket.nestingLevel,
      childOrder: ticket.childOrder,
      autoCompleteOnChildrenDone: ticket.autoCompleteOnChildrenDone,
      childCompletionCount: ticket.childCompletionCount,
      totalChildCount: ticket.totalChildCount,
      customProperties: ticket.customProperties,
      childTickets: ticket.childTickets ? ticket.childTickets.map((child: any) => this.mapToHierarchyDto(child)) : undefined
    };
  }
}

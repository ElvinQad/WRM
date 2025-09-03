-- Add check constraint for nesting level (max 3 levels: 0,1,2,3)
ALTER TABLE "public"."tickets" ADD CONSTRAINT "tickets_nesting_level_check" CHECK ("nesting_level" >= 0 AND "nesting_level" <= 3);

-- Add check constraint to prevent circular dependencies at database level
-- This constraint ensures a ticket cannot be its own ancestor
CREATE OR REPLACE FUNCTION check_hierarchy_circular() RETURNS trigger AS $$
DECLARE
    current_parent_id TEXT;
    level_count INTEGER := 0;
BEGIN
    -- Skip check if no parent
    IF NEW.hierarchy_parent_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Check if trying to set itself as parent
    IF NEW.id = NEW.hierarchy_parent_id THEN
        RAISE EXCEPTION 'Circular dependency: Ticket cannot be its own parent';
    END IF;
    
    -- Walk up the hierarchy to check for circular reference and max depth
    current_parent_id := NEW.hierarchy_parent_id;
    WHILE current_parent_id IS NOT NULL AND level_count < 10 LOOP
        -- Check if we've encountered the ticket being updated
        IF current_parent_id = NEW.id THEN
            RAISE EXCEPTION 'Circular dependency detected in ticket hierarchy';
        END IF;
        
        -- Get the next parent in the chain
        SELECT hierarchy_parent_id INTO current_parent_id 
        FROM tickets 
        WHERE id = current_parent_id;
        
        level_count := level_count + 1;
    END LOOP;
    
    -- If we hit the limit, there might be a cycle
    IF level_count >= 10 THEN
        RAISE EXCEPTION 'Hierarchy too deep or circular dependency detected';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_hierarchy_circular_trigger
    BEFORE INSERT OR UPDATE OF hierarchy_parent_id ON "public"."tickets"
    FOR EACH ROW EXECUTE FUNCTION check_hierarchy_circular();

-- Create function to update child counts when hierarchy changes
CREATE OR REPLACE FUNCTION update_parent_child_counts() RETURNS trigger AS $$
BEGIN
    -- Handle INSERT or UPDATE where hierarchy_parent_id is added/changed
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.hierarchy_parent_id IS DISTINCT FROM NEW.hierarchy_parent_id) THEN
        -- Update new parent's child count
        IF NEW.hierarchy_parent_id IS NOT NULL THEN
            UPDATE tickets 
            SET total_child_count = (
                SELECT COUNT(*) 
                FROM tickets 
                WHERE hierarchy_parent_id = NEW.hierarchy_parent_id
            )
            WHERE id = NEW.hierarchy_parent_id;
        END IF;
        
        -- Update old parent's child count (for UPDATE case)
        IF TG_OP = 'UPDATE' AND OLD.hierarchy_parent_id IS NOT NULL THEN
            UPDATE tickets 
            SET total_child_count = (
                SELECT COUNT(*) 
                FROM tickets 
                WHERE hierarchy_parent_id = OLD.hierarchy_parent_id
            )
            WHERE id = OLD.hierarchy_parent_id;
        END IF;
    END IF;
    
    -- Handle status change for completion counting
    IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
        IF NEW.hierarchy_parent_id IS NOT NULL THEN
            UPDATE tickets 
            SET child_completion_count = (
                SELECT COUNT(*) 
                FROM tickets 
                WHERE hierarchy_parent_id = NEW.hierarchy_parent_id 
                AND status IN ('PAST_CONFIRMED', 'ACTIVE')
            )
            WHERE id = NEW.hierarchy_parent_id;
        END IF;
    END IF;
    
    -- Handle DELETE
    IF TG_OP = 'DELETE' THEN
        -- Update old parent's counts
        IF OLD.hierarchy_parent_id IS NOT NULL THEN
            UPDATE tickets 
            SET 
                total_child_count = (
                    SELECT COUNT(*) 
                    FROM tickets 
                    WHERE hierarchy_parent_id = OLD.hierarchy_parent_id
                ),
                child_completion_count = (
                    SELECT COUNT(*) 
                    FROM tickets 
                    WHERE hierarchy_parent_id = OLD.hierarchy_parent_id 
                    AND status IN ('PAST_CONFIRMED', 'ACTIVE')
                )
            WHERE id = OLD.hierarchy_parent_id;
        END IF;
        RETURN OLD;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_parent_child_counts_trigger
    AFTER INSERT OR UPDATE OR DELETE ON "public"."tickets"
    FOR EACH ROW EXECUTE FUNCTION update_parent_child_counts();
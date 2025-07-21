    -- Initial schema for WRM Backend
    -- Based on the OpenAPI specification

    -- Enable necessary extensions
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Ticket Types table
    CREATE TABLE ticket_types (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        properties_schema JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Tickets table
    CREATE TABLE tickets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        start_time TIMESTAMP WITH TIME ZONE NOT NULL,
        end_time TIMESTAMP WITH TIME ZONE NOT NULL,
        type_id UUID NOT NULL REFERENCES ticket_types(id) ON DELETE RESTRICT,
        custom_properties JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        
        -- Constraints
        CONSTRAINT tickets_end_after_start CHECK (end_time > start_time)
    );

    -- Agents table
    CREATE TABLE agents (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        description TEXT,
        system_prompt TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Agent Collaborations table
    CREATE TABLE agent_collaborations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
        agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
        status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')),
        started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        ended_at TIMESTAMP WITH TIME ZONE,
        results JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        
        -- Unique constraint to prevent duplicate collaborations
        UNIQUE(ticket_id, agent_id)
    );

    -- Indexes for performance
    CREATE INDEX idx_tickets_user_id ON tickets(user_id);
    CREATE INDEX idx_tickets_type_id ON tickets(type_id);
    CREATE INDEX idx_tickets_start_time ON tickets(start_time);
    CREATE INDEX idx_tickets_end_time ON tickets(end_time);
    CREATE INDEX idx_agent_collaborations_ticket_id ON agent_collaborations(ticket_id);
    CREATE INDEX idx_agent_collaborations_agent_id ON agent_collaborations(agent_id);
    CREATE INDEX idx_agent_collaborations_status ON agent_collaborations(status);

    -- Updated_at trigger function
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    -- Apply updated_at triggers
    CREATE TRIGGER update_ticket_types_updated_at 
        BEFORE UPDATE ON ticket_types 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_tickets_updated_at 
        BEFORE UPDATE ON tickets 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_agents_updated_at 
        BEFORE UPDATE ON agents 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_agent_collaborations_updated_at 
        BEFORE UPDATE ON agent_collaborations 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    -- Row Level Security (RLS) policies
    -- Enable RLS on all tables
    ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;
    ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
    ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
    ALTER TABLE agent_collaborations ENABLE ROW LEVEL SECURITY;

    -- Ticket Types policies (readable by all authenticated users, modifiable by service role)
    CREATE POLICY "Ticket types are viewable by authenticated users" 
        ON ticket_types FOR SELECT 
        TO authenticated 
        USING (true);

    -- Tickets policies (users can only see their own tickets)
    CREATE POLICY "Users can view their own tickets" 
        ON tickets FOR SELECT 
        TO authenticated 
        USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own tickets" 
        ON tickets FOR INSERT 
        TO authenticated 
        WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own tickets" 
        ON tickets FOR UPDATE 
        TO authenticated 
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own tickets" 
        ON tickets FOR DELETE 
        TO authenticated 
        USING (auth.uid() = user_id);

    -- Agents policies (readable by all authenticated users)
    CREATE POLICY "Agents are viewable by authenticated users" 
        ON agents FOR SELECT 
        TO authenticated 
        USING (true);

    -- Agent Collaborations policies (users can only see collaborations for their tickets)
    CREATE POLICY "Users can view collaborations for their tickets" 
        ON agent_collaborations FOR SELECT 
        TO authenticated 
        USING (
            EXISTS (
                SELECT 1 FROM tickets 
                WHERE tickets.id = agent_collaborations.ticket_id 
                AND tickets.user_id = auth.uid()
            )
        );

    CREATE POLICY "Users can create collaborations for their tickets" 
        ON agent_collaborations FOR INSERT 
        TO authenticated 
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM tickets 
                WHERE tickets.id = agent_collaborations.ticket_id 
                AND tickets.user_id = auth.uid()
            )
        );

    CREATE POLICY "Users can update collaborations for their tickets" 
        ON agent_collaborations FOR UPDATE 
        TO authenticated 
        USING (
            EXISTS (
                SELECT 1 FROM tickets 
                WHERE tickets.id = agent_collaborations.ticket_id 
                AND tickets.user_id = auth.uid()
            )
        )
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM tickets 
                WHERE tickets.id = agent_collaborations.ticket_id 
                AND tickets.user_id = auth.uid()
            )
        );

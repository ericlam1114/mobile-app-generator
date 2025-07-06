-- Database schema for Mobile App Generator with project persistence

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    initial_prompt TEXT NOT NULL,
    business_name TEXT,
    template_type TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Iterations table (stores each version/iteration of a project)
CREATE TABLE IF NOT EXISTS iterations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    prompt TEXT NOT NULL,
    generated_code JSONB NOT NULL,
    features TEXT[],
    modification_summary TEXT,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, version_number)
);

-- Messages table (stores chat history for each project)
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    iteration_id UUID REFERENCES iterations(id) ON DELETE SET NULL,
    message_type TEXT NOT NULL CHECK (message_type IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at);
CREATE INDEX IF NOT EXISTS idx_iterations_project_id ON iterations(project_id);
CREATE INDEX IF NOT EXISTS idx_iterations_created_at ON iterations(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_project_id ON messages(project_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at for projects
CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to ensure only one current iteration per project
CREATE OR REPLACE FUNCTION ensure_single_current_iteration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_current = TRUE THEN
        -- Set all other iterations for this project to not current
        UPDATE iterations 
        SET is_current = FALSE 
        WHERE project_id = NEW.project_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to maintain single current iteration
CREATE TRIGGER ensure_single_current_iteration_trigger
    BEFORE INSERT OR UPDATE ON iterations
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_current_iteration();

-- Row Level Security (RLS) policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE iterations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Users can view their own projects" ON projects
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own projects" ON projects
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
    FOR DELETE USING (auth.uid()::text = user_id);

-- Iterations policies
CREATE POLICY "Users can view iterations of their projects" ON iterations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = iterations.project_id 
            AND projects.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert iterations for their projects" ON iterations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = iterations.project_id 
            AND projects.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can update iterations of their projects" ON iterations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = iterations.project_id 
            AND projects.user_id = auth.uid()::text
        )
    );

-- Messages policies
CREATE POLICY "Users can view messages of their projects" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = messages.project_id 
            AND projects.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert messages for their projects" ON messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = messages.project_id 
            AND projects.user_id = auth.uid()::text
        )
    );

-- Function to get project with latest iteration
CREATE OR REPLACE FUNCTION get_project_with_latest_iteration(project_uuid UUID)
RETURNS TABLE (
    project_id UUID,
    project_name TEXT,
    project_description TEXT,
    initial_prompt TEXT,
    business_name TEXT,
    template_type TEXT,
    status TEXT,
    project_created_at TIMESTAMP WITH TIME ZONE,
    project_updated_at TIMESTAMP WITH TIME ZONE,
    iteration_id UUID,
    version_number INTEGER,
    prompt TEXT,
    generated_code JSONB,
    features TEXT[],
    modification_summary TEXT,
    iteration_created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.description,
        p.initial_prompt,
        p.business_name,
        p.template_type,
        p.status,
        p.created_at,
        p.updated_at,
        i.id,
        i.version_number,
        i.prompt,
        i.generated_code,
        i.features,
        i.modification_summary,
        i.created_at
    FROM projects p
    LEFT JOIN iterations i ON p.id = i.project_id AND i.is_current = TRUE
    WHERE p.id = project_uuid;
END;
$$ LANGUAGE plpgsql; 
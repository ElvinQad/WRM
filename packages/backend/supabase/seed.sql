-- Seed data for development and testing

-- Insert default ticket types
INSERT INTO ticket_types (name, description, properties_schema) VALUES
('Meeting', 'Standard meeting ticket', '{
  "type": "object",
  "properties": {
    "location": {"type": "string", "description": "Meeting location"},
    "attendees": {"type": "array", "items": {"type": "string"}, "description": "List of attendees"},
    "agenda": {"type": "string", "description": "Meeting agenda"}
  }
}'),
('Development', 'Development work ticket', '{
  "type": "object", 
  "properties": {
    "technology": {"type": "string", "description": "Technology stack"},
    "priority": {"type": "string", "enum": ["low", "medium", "high", "critical"]},
    "repository": {"type": "string", "description": "Git repository URL"},
    "branch": {"type": "string", "description": "Git branch name"}
  }
}'),
('Personal', 'Personal time ticket', '{
  "type": "object",
  "properties": {
    "category": {"type": "string", "enum": ["break", "lunch", "appointment", "other"]},
    "notes": {"type": "string", "description": "Additional notes"}
  }
}'),
('Review', 'Code or design review ticket', '{
  "type": "object",
  "properties": {
    "reviewType": {"type": "string", "enum": ["code", "design", "architecture", "documentation"]},
    "pullRequestUrl": {"type": "string", "description": "URL to pull request"},
    "reviewers": {"type": "array", "items": {"type": "string"}, "description": "List of reviewers"}
  }
}');

-- Insert default agents
INSERT INTO agents (name, description, system_prompt) VALUES
('Code Assistant', 'AI agent specialized in code analysis and development tasks', 
 'You are a code assistant AI. Your role is to help analyze code, suggest improvements, and assist with development tasks. Always provide clear, actionable feedback and consider best practices in software development.'),
 
('Meeting Facilitator', 'AI agent that helps organize and facilitate meetings',
 'You are a meeting facilitator AI. Your role is to help structure meetings, track action items, and ensure productive discussions. Focus on time management and clear outcomes.'),
 
('Documentation Writer', 'AI agent specialized in creating and maintaining documentation',
 'You are a documentation specialist AI. Your role is to help create clear, comprehensive documentation. Focus on accuracy, clarity, and usefulness for the target audience.'),
 
('Quality Assurance', 'AI agent focused on testing and quality control',
 'You are a QA specialist AI. Your role is to help identify potential issues, suggest test cases, and ensure quality standards are met. Be thorough and consider edge cases.'),
 
('Project Analyst', 'AI agent that analyzes project progress and provides insights',
 'You are a project analyst AI. Your role is to analyze project data, identify trends, and provide actionable insights for project improvement. Focus on data-driven recommendations.');

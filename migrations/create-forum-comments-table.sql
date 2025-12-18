/**
 * Migration: Create forum_comments table
 * This migration creates the forum_comments table to store comments on forum posts.
 * 
 * Run this SQL in your PostgreSQL database:
 */

const up = `
CREATE TABLE IF NOT EXISTS forum_comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS forum_comments_post_id_index ON forum_comments(post_id);
CREATE INDEX IF NOT EXISTS forum_comments_user_id_index ON forum_comments(user_id);
CREATE INDEX IF NOT EXISTS forum_comments_post_id_created_at_index ON forum_comments(post_id, created_at);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_forum_comments_updated_at BEFORE UPDATE ON forum_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

const down = `
DROP TRIGGER IF EXISTS update_forum_comments_updated_at ON forum_comments;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP TABLE IF EXISTS forum_comments;
`;

module.exports = {
    up,
    down
};


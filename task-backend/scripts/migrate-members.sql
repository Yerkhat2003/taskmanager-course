-- Add all users as members of all existing boards that have no members yet
INSERT OR IGNORE INTO BoardMember (boardId, userId, role, createdAt)
SELECT b.id, u.id, 'member', datetime('now')
FROM Board b
CROSS JOIN User u
WHERE NOT EXISTS (
  SELECT 1 FROM BoardMember bm WHERE bm.boardId = b.id
);

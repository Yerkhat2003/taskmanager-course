-- Set the first member of each board as 'owner'
UPDATE BoardMember
SET role = 'owner'
WHERE id IN (
  SELECT MIN(id) FROM BoardMember GROUP BY boardId
);

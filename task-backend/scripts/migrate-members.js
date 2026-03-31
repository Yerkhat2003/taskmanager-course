const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrate() {
  const boards = await prisma.board.findMany({
    include: { members: true },
  });

  const allUsers = await prisma.user.findMany({ select: { id: true } });

  for (const board of boards) {
    if (board.members.length === 0) {
      for (const u of allUsers) {
        try {
          await prisma.boardMember.create({
            data: { boardId: board.id, userId: u.id, role: 'member' },
          });
          console.log(`Added user ${u.id} to board ${board.id} (${board.title})`);
        } catch (e) {
          // already exists
        }
      }
    }
  }

  await prisma.$disconnect();
  console.log('Done');
}

migrate().catch(console.error);

import { PrismaClient } from '@prisma/client';
import { screens } from '../seed-data/screens';
import { mapAuditFields } from './helpers';

export async function seedScreens(prisma: PrismaClient, usernameToId: Record<string, number>, bootstrapUserId: number) {
  const screenIds: number[] = [];
  for (const item of screens) {
    // parent_screen_id is a 1-based index in seed data, map to actual screen_id or null
    let mappedParentScreenId: number | null = null;
    if (typeof item.parent_screen_id === 'number' && item.parent_screen_id !== null) {
      mappedParentScreenId = screenIds[item.parent_screen_id - 1] ?? null;
    }
    // Map audit fields
    const auditFields = mapAuditFields(item, usernameToId, bootstrapUserId);
    const screen = await prisma.screen.create({
      data: {
        ...item,
        parent_screen_id: mappedParentScreenId,
        ...auditFields,
      },
    });
    screenIds.push(screen.screen_id);
  }
  console.log('Seeded screens');
  return screenIds;
}

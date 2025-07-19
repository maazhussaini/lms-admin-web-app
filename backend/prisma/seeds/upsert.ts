import { PrismaClient } from '@prisma/client';

export async function upsertMany({ model, data, uniqueKey, extraFields = {} }: {
  model: any,
  data: any[],
  uniqueKey: string,
  extraFields?: Record<string, any>
}) {
  await Promise.all(data.map((item) => {
    return model.upsert({
      where: { [uniqueKey]: item[uniqueKey] },
      update: {},
      create: {
        ...item,
        ...extraFields,
      },
    });
  }));
}

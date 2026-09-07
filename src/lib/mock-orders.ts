import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export type MockOrder = {
  id: string;
  reference: string;
  name: string;
  email: string;
  phone: string;
  seatCount: number;
  receiptPath: string;
  uploadReference: string;
  status: "pending";
  createdAt: string;
};

const dataDirectory = path.join(process.cwd(), "data");
const databasePath = path.join(dataDirectory, "mock-orders.json");
let writeQueue = Promise.resolve();

async function readOrders(): Promise<MockOrder[]> {
  try {
    const contents = await readFile(databasePath, "utf8");
    const parsed: unknown = JSON.parse(contents);
    return Array.isArray(parsed) ? (parsed as MockOrder[]) : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

export function appendMockOrder(order: MockOrder): Promise<void> {
  const operation = writeQueue.then(async () => {
    await mkdir(dataDirectory, { recursive: true });
    const orders = await readOrders();
    orders.push(order);

    const temporaryPath = `${databasePath}.${process.pid}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(orders, null, 2)}\n`, "utf8");
    await rename(temporaryPath, databasePath);
  });

  writeQueue = operation.catch(() => undefined);
  return operation;
}

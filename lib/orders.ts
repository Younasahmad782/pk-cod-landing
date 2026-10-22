import { promises as fs } from "fs";
import path from "path";

// Demo-grade order storage: a JSON file in /data.
// For high-volume production, swap these two functions for a
// real database (PostgreSQL/Supabase) or Google Sheets.
export interface Order {
  orderId: string;
  createdAt: string;
  name: string;
  mobile: string;
  city: string;
  packId: string;
  qty: number;
  amount: number;
}

const DATA_FILE = path.join(process.cwd(), "data", "orders.json");

export async function readOrders(): Promise<Order[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw) as Order[];
  } catch {
    return [];
  }
}

export async function saveOrder(order: Order) {
  const orders = await readOrders();
  orders.push(order);
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(orders, null, 2), "utf8");
}

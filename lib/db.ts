import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

const sqlite = new Database('data.db');

// // Enable automatic casing here
// export const db = drizzle(sqlite, { 
//   schema, 
//   casing: 'snake_case' 
// });

export default drizzle(sqlite);
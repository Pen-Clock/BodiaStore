import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"
import * as schema from "./schema"

const url = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN

if (!url) {
  throw new Error("Missing TURSO_DATABASE_URL")
}

if (!authToken) {
  throw new Error("Missing TURSO_AUTH_TOKEN")
}

const client = createClient({ url, authToken })

const db = drizzle(client, { schema })

export default db
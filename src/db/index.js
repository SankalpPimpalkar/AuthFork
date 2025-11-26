import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const client = neon(process.env.DATABASE_URL);
const db = drizzle({ client: client });
export default db
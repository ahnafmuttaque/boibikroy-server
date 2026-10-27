import { Pool } from "pg";
import env from "@/config/env.config.js";

const db = new Pool({ connectionString: env.DATABASE_CONNECTION_STRING });

export default db;

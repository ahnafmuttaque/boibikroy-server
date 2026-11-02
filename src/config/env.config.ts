import "dotenv/config";

const nodeEnvs = ["development", "test", "production"] as const;
type NodeEnv = (typeof nodeEnvs)[number];

function fail(message: string): never {
  console.error(`[env] ${message}`);
  process.exit(1);
}

function getRequired(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    fail(`missing required environment variable: ${name}`);
  }
  return value;
}

function isNodeEnv(value: string): value is NodeEnv {
  return (nodeEnvs as readonly string[]).includes(value);
}

function getNodeEnv(): NodeEnv {
  const value = getRequired("NODE_ENV");
  if (!isNodeEnv(value)) {
    fail(`NODE_ENV must be one of [${nodeEnvs.join(", ")}] (got "${value}")`);
  }
  return value;
}

function getPort(): number {
  const raw = getRequired("PORT");
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    fail(`PORT must be an integer between 1 and 65535 (got "${raw}")`);
  }
  return port;
}

function getDatabaseUrl(): string {
  const value = getRequired("DATABASE_CONNECTION_STRING");
  if (!/^postgres(ql)?:\/\//i.test(value)) {
    fail("DATABASE_CONNECTION_STRING must be a postgres:// or postgresql:// URI");
  }
  return value;
}

function getJwtSecret(): string {
  const value = getRequired("JWT_SECRET");
  if (value.length < 32) {
    console.warn(
      "[env] JWT_SECRET is shorter than 32 characters; use a longer secret in production",
    );
  }
  return value;
}

const env = {
  NODE_ENV: getNodeEnv(),
  PORT: getPort(),
  DATABASE_CONNECTION_STRING: getDatabaseUrl(),
  JWT_SECRET: getJwtSecret(),
} as const;

export default env;

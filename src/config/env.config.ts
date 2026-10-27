import "dotenv/config";

let env = {
  NODE_ENV: process.env.NODE_ENV!,
  PORT: process.env.PORT!,
  DATABASE_CONNECTION_STRING: process.env.DATABASE_CONNECTION_STRING!,
};

function validateEnvs() {
  for (const variable in env) {
    if (!env[variable as keyof typeof env]) {
      console.error("couldn't find environment variables");
      process.exit(1);
    }
  }
  return env;
}
env = validateEnvs();

export default env;

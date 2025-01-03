/* eslint-disable no-process-env */
// Import necessary modules

// Enum for environment variables
enum EnvVarEnum {
  NODE_ENV = 'NODE_ENV',
  PORT = 'PORT',
  REDISCLOUD_URL = 'REDISCLOUD_URL',
  DB_NAME = 'DB_NAME',
  DB_PASSWORD = 'DB_PASSWORD',
  HUGGINGFACEHUB_API_KEY = 'HUGGINGFACEHUB_API_KEY',
  LOGTAIL_KEY = 'LOGTAIL_KEY',
  AIRTABLE_API_KEY = 'AIRTABLE_API_KEY',
  AIRTABLE_BASE_ID = 'AIRTABLE_BASE_ID',
}

// Load environment variables in non-production environments
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Prepare a list of environment variable keys
const envVarList: EnvVarEnum[] = Object.values(EnvVarEnum);

// Initialize a Map to hold the environment variables
const envVars = new Map<EnvVarEnum, string>();

// Populate the Map with environment variables, log if any are missing
envVarList.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error('Missing env var: ' + envVar);
  } else {
    envVars.set(envVar, process.env[envVar] as string);
  }
});

type EnvVars = {
  [key in EnvVarEnum]?: string;
};

// Create a Proxy for more convenient access to the environment variables
const envProxy: EnvVars = new Proxy({}, {
  get(target, name: string) {
    const envVar = envVars.get(name as EnvVarEnum);
    return envVar;
  }
});

// Export the Proxy and the EnvVarEnum for use elsewhere in the application
export { envProxy as envVars };

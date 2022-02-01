import { ConnectionOptions, Migration } from "typeorm";

export function getConnectionOptions(logger: (message: string) => void): ConnectionOptions {
  
  if (!process.env.SLS_TYPEORM_MIGRATIONS_ENGINE) {
    logger("SLS_TYPEORM_MIGRATIONS_ENGINE environment variable required");
    process.exit(1);
  }

  if (!process.env.SLS_TYPEORM_MIGRATIONS_FOLDER) {
    logger("SLS_TYPEORM_MIGRATIONS_FOLDER environment variable required");
    process.exit(1);
  }

  if (
    !process.env.SLS_TYPEORM_MIGRATIONS_DATABASE_URL && 
    (
      !process.env.SLS_TYPEORM_MIGRATIONS_DATABASE_USERNAME || 
      !process.env.SLS_TYPEORM_MIGRATIONS_DATABASE_PASSWORD || 
      !process.env.SLS_TYPEORM_MIGRATIONS_DATABASE_NAME || 
      !process.env.SLS_TYPEORM_MIGRATIONS_DATABASE_HOST || 
      !process.env.SLS_TYPEORM_MIGRATIONS_DATABASE_PORT
    ) && (
      !process.env.SLS_TYPEORM_MIGRATIONS_RESOURCE_ARN || 
      !process.env.SLS_TYPEORM_MIGRATIONS_SECRET_ARN || 
      !process.env.SLS_TYPEORM_MIGRATIONS_REGION || 
      !process.env.SLS_TYPEORM_MIGRATIONS_DATABASE_NAME
    )
  ) {
    logger("SLS_TYPEORM_MIGRATIONS_DATABASE_URL or [SLS_TYPEORM_MIGRATIONS_DATABASE_USERNAME, SLS_TYPEORM_MIGRATIONS_DATABASE_PASSWORD, SLS_TYPEORM_MIGRATIONS_DATABASE_NAME, SLS_TYPEORM_MIGRATIONS_DATABASE_HOST, SLS_TYPEORM_MIGRATIONS_DATABASE_PORT] or [SLS_TYPEORM_MIGRATIONS_RESOURCE_ARN, SLS_TYPEORM_MIGRATIONS_SECRET_ARN, SLS_TYPEORM_MIGRATIONS_REGION, SLS_TYPEORM_MIGRATIONS_DATABASE_NAME] environment variable required");
    process.exit(1);
  }

  let dbOptions: {
    secretArn?: string,
    resourceArn?: string,
    region?: string,
    url?: string,
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    database?: string;
  } = {};
  
  if (process.env.SLS_TYPEORM_MIGRATIONS_DATABASE_URL) {
    dbOptions.url = process.env.SLS_TYPEORM_MIGRATIONS_DATABASE_URL!!;
  } else if (process.env.SLS_TYPEORM_MIGRATIONS_DATABASE_HOST){
    dbOptions.host = process.env.SLS_TYPEORM_MIGRATIONS_DATABASE_HOST!!;
    dbOptions.port = parseInt(process.env.SLS_TYPEORM_MIGRATIONS_DATABASE_PORT!!);
    dbOptions.database = process.env.SLS_TYPEORM_MIGRATIONS_DATABASE_NAME!!;
    dbOptions.username = process.env.SLS_TYPEORM_MIGRATIONS_DATABASE_USERNAME!!;
    dbOptions.password = Buffer.from(process.env.SLS_TYPEORM_MIGRATIONS_DATABASE_PASSWORD!!, 'base64').toString('ascii');
  } else {
    dbOptions.resourceArn = process.env.SLS_TYPEORM_MIGRATIONS_RESOURCE_ARN!!;
    dbOptions.secretArn = process.env.SLS_TYPEORM_MIGRATIONS_SECRET_ARN!!;
    dbOptions.region = process.env.SLS_TYPEORM_MIGRATIONS_REGION!!;
    dbOptions.database = process.env.SLS_TYPEORM_MIGRATIONS_DATABASE_NAME!!;
  }
  return {
    type: process.env.SLS_TYPEORM_MIGRATIONS_ENGINE as any,
    url: process.env.SLS_TYPEORM_MIGRATIONS_DATABASE_URL,
    migrations: [process.env.SLS_TYPEORM_MIGRATIONS_FOLDER],
    ...dbOptions,
  };
}

export function logMigrations(
  logger: (message: string) => void,
  migrations: Migration[] | undefined
) {
  if (typeof migrations !== "undefined" && migrations?.length > 0) {
    migrations?.forEach((migration) => logger(`Migrated: ${migration.name}`));
  } else {
    logger("No new migrations to run");
  }
}

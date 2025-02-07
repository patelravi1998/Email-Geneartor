import { DataSource, EntitySchema } from "typeorm";
import logger from "../utils/logger";
import { env_variables } from "./env";
import * as Entities from "../entities";

const config: any = {
  DEVELOPMENT: {
    username: env_variables.MYSQL_USERNAME_DEV,
    password: env_variables.MYSQL_PASSSWORD_DEV,
    database: env_variables.MYSQL_DATABASE_DEV,
    host: env_variables.MYSQL_HOST_DEV,
    dialect: "mysql",
  },
  LOCAL: {
    username: env_variables.MYSQL_USERNAME_LOCAL,
    password: env_variables.MYSQL_PASSSWORD_LOCAL,
    database: env_variables.MYSQL_DATABASE_LOCAL,
    host: env_variables.MYSQL_HOST_LOCAL,
    dialect: "mysql",
  },
  PRODUCTION: {
    username: env_variables.MYSQL_USERNAME_PROD,
    password: env_variables.MYSQL_PASSSWORD_PROD,
    database: env_variables.MYSQL_DATABASE_PROD,
    host: env_variables.MYSQL_HOST_PROD,
    dialect: "mysql",
  },
};
// Adjust the path as per your project structure

// Read the database configuration from config.json
let databaseConfig: any = {};

// console.log('env',process.env.NODE_ENV);

const environment = process.env.NODE_ENV || "DEVELOPMENT";
console.log(environment);
databaseConfig = config[environment];

let mySQl_dataSource: DataSource | null = null;
const connectDB = async (options?: { journeyId?: string }) => {
  const { journeyId } = options || {};

  try {
    if (!databaseConfig) {
      throw new Error(
        "Database configuration not found. Check your config file."
      );
    }
    // Log database connection attempt with journeyId
    logger.info(
      `[${journeyId || "Unknown"}] Attempting to connect to MySQL...`
    );
    logger.info(JSON.stringify(databaseConfig));
    const entities = Object.values(Entities) as (
      | string
      | Function
      | EntitySchema<any>
    )[];

    mySQl_dataSource = new DataSource({
      type: "mysql",
      host: databaseConfig.host,
      port: 3306, // Adjust port if necessary
      username: databaseConfig.username,
      password: databaseConfig.password,
      database: databaseConfig.database,
      // entities: entities, // Add all your entities here
      entities: [...Object.values(entities)],
      synchronize: true, // Use synchronize: true only in development, to auto-create database schema
      // timezone: 'Asia/Kolkata', // Adjust timezone as per your application needs
      logging: true,
      extra: {
        connectionLimit: 10, // Adjust based on your application's needs
      },
    });

    // Initialize the connection
    await mySQl_dataSource.initialize();
    console.log("MySQL connected successfully");

    // Log successful connection with journeyId
    logger.info(`[${journeyId || "Unknown"}] MySQL connected`);

    return mySQl_dataSource;
  } catch (err) {
    // Log connection error with journeyId
    console.log(err);

    logger.error(
      `[${journeyId || "Unknown"}] MySQL connection error: ${
        (err as Error).message
      }`
    );
    process.exit(1); // Exit process on connection error
  }
};

const getDataSource = () => {
  if (!mySQl_dataSource) {
    throw new Error("DataSource is not initialized. Call connectDB first.");
  }
  return mySQl_dataSource;
};

export { connectDB, getDataSource };

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

let sequelize;

if (process.env.DATABASE_URL) {
  // Strip URL query parameters (like ?ssl=...) because mysql2 expects SSL options in dialectOptions
  let cleanUrl = process.env.DATABASE_URL.split('?')[0];

  try {
    const parsed = new URL(cleanUrl);
    // If no database name is specified, use default 'test' database where user has full CREATE permissions
    if (!parsed.pathname || parsed.pathname === '/') {
      parsed.pathname = '/test';
      cleanUrl = parsed.toString();
    }
  } catch (e) {
    console.error('URL parse note:', e.message);
  }

  sequelize = new Sequelize(cleanUrl, {
    dialect: 'mysql',
    logging: false,
    dialectOptions: process.env.DB_SSL === 'false' ? {} : {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'rail_madad',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      dialect: 'mysql',
      logging: false,
      dialectOptions: process.env.DB_SSL === 'true' ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      } : {}
    }
  );
}

export default sequelize;


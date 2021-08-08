const Pool = require("pg").Pool;
require("dotenv").config();

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    ssl: process.env.NODE_ENV === "development" ? false : { rejectUnauthorized: false },
    port: 5432,
});

export = pool;

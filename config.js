
// Import environment variables
require('dotenv').config();

const config = {
    database: {
        host: process.env.DATABASE_HOST || "localhost",
        port: process.env.DATABASE_PORT || "",
        user: process.env.DATABASE_USER || "admin",
        password: process.env.DATABASE_PASSWORD || "admin",
        database: process.env.DATABASE_NAME || "wppsender",
        multipleStatements: true
    },
    port: process.env.PORT || 4000,

}

module.exports = config;
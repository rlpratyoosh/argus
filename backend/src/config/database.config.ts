import { registerAs } from "@nestjs/config";

export default registerAs('database', () => ({
    database_url: process.env.DATABASE_URL
}));
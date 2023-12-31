// get all user data from a the name
import { Pool } from 'pg';

const pool = new Pool({
    // connectionString: process.env.POSTGRES_URL
    connectionString: "postgres://default:RcXhD7Ag9wUV@ep-green-bird-78301737-pooler.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require"
});

const searchUserUID = `
    SELECT *
    FROM user_data
    WHERE user_data."name" LIKE $1
    LIMIT 1;
    `;

export default async (req, res) => {
    console.log("api is called at getInfofromName");
    if (req.method === 'POST') {
        try {
            const name = req.body.name;
            // console.log(name);
            const values = [`%${name}%`];
            // console.log(values);
            const result = await pool.query(searchUserUID, values);

            res.json({ success: true, data: result });
        } catch (err) {
            console.error('Error in getting UID, problem in API:', err);
            res.status(500).json({ error: err.message });
        }
    } else {
        res.status(405).end();  // Method Not Allowed
    }
};

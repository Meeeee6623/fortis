// get data to display streaks (github like thing)
import { Pool } from 'pg';

const pool = new Pool({
    // connectionString: process.env.POSTGRES_URL
    connectionString: "postgres://default:RcXhD7Ag9wUV@ep-green-bird-78301737-pooler.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require"
});

const Streaks = `
    SELECT "Date", "Duration"
    FROM activity
    WHERE activity."Uid" = $1
    ORDER BY "Date" DESC;
    `;


export default async (req, res) => {
    if (req.method === 'POST') {
        const searchQuery = req.body.searchQuery;
        try {
            // Insert user
            const values = [`${searchQuery}`];
            //console.log('yippers');
            const results = await pool.query(Streaks, values);

            res.json({ success: true, data: results });
        } catch (err) {
            console.log('AnalStreaks.js error');
            console.error(err);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    } else {
        res.status(405).end();  // Method Not Allowed
    }
};

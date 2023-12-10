// get AID for individual Uid
// this is not called since AID is now a trigger
import { Pool } from 'pg';

const pool = new Pool({
    // connectionString: process.env.POSTGRES_URL
    connectionString: "postgres://default:RcXhD7Ag9wUV@ep-green-bird-78301737-pooler.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require"
});

const getAID = `
    SELECT activity."Aid"
    FROM activity
    WHERE activity."Uid" = $1
    ORDER BY activity."Date" DESC, activity."Start_time" DESC
    LIMIT 1;
    `;

export default async (req, res) => {
    if (req.method === 'POST') {
        const searchQuery = req.body.searchQuery;

        try {
            // Insert user
            const values = [`${searchQuery}`];
            console.log('hi');
            const results = await pool.query(getAID, values);

            res.json({ success: true, data: results });
        } catch (err) {
            console.log('getAID.js error');
            console.error(err);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    } else {
        res.status(405).end();  // Method Not Allowed
    }
};

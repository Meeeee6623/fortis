// this is for quick add
// last 10 exercises can be shown to be added as a template

import { Pool } from 'pg';

const pool = new Pool({
    // connectionString: process.env.POSTGRES_URL
    connectionString: "postgres://default:RcXhD7Ag9wUV@ep-green-bird-78301737-pooler.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require"
});

const History = `
    SELECT *
    FROM activity
    WHERE activity."Uid" = $1
    ORDER BY activity."Aid" DESC
    LIMIT 10;
    `;

export default async (req, res) => {
    if (req.method === 'POST') {
        const { uid } = req.body;

        try {
            const values = [uid];
            const results = await pool.query(History, values);

            res.json({ success: true, data: results });
        } catch (err) {
            console.log('templateActivitiesLog.js error');
            console.error(err);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    } else {
        res.status(405).end();  // Method Not Allowed
    }
};

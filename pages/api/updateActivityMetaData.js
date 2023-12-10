// this query will update metadata like time and date for activity

import { Pool } from 'pg';

const pool = new Pool({
    // connectionString: process.env.POSTGRES_URL
    connectionString: "postgres://default:RcXhD7Ag9wUV@ep-green-bird-78301737-pooler.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require"
});

const query = `
UPDATE activity
SET 
    "Date" = $4,
    "Duration" = $5,
    "Activity_name" = $3
WHERE 
    "Uid" = $1
    AND "Aid" = $2
`;

export default async (req, res) => {
    if (req.method === 'POST') {
        const { uid, aid, name, date, duration } = req.body;

        try {
            const values = [uid, aid, name, date, duration];
            await pool.query(query, values);

            res.status(200).json({ message: 'EndTime and Duration Updated Successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
};
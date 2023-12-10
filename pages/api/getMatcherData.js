// get the matcher data for a particular user

import { Pool } from 'pg';

const pool = new Pool({
    // connectionString: process.env.POSTGRES_URL
    connectionString: "postgres://default:RcXhD7Ag9wUV@ep-green-bird-78301737-pooler.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require"
});

const matchyboo = `
    SELECT *
    FROM public.matcher 
    WHERE "Uid" = $1
    `;

export default async (req, res) => {
    if (req.method === 'POST') {
        const uid = req.body.uid;

        try {
            // Insert user
            const values = [uid];
            console.log('getMatcherData.js');
            const results = await pool.query(matchyboo, values);

            res.json({ success: true, data: results });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    } else {
        res.status(405).end();  // Method Not Allowed
    }
};

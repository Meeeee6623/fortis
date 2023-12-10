// for exploring exercises
// order by popularity

import { Pool } from 'pg';

const pool = new Pool({
    connectionString: "postgres://default:RcXhD7Ag9wUV@ep-green-bird-78301737-pooler.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require"
});

const DefaultSort = `
SELECT * FROM exercise
ORDER BY popularity DESC
LIMIT 15;
`;

export default async (req, res) => {
    if (req.method === 'GET') {  // Change to handle GET requests

        try {
            const results = await pool.query(DefaultSort);
            // Return the results in the expected format
            res.status(200).json({ data: { rows: results.rows } });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    } else {
        res.status(405).end();  // Method Not Allowed
    }
};

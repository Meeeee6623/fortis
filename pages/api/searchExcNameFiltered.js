// same as searchExcName but it filters based on gym

import { Pool } from 'pg';

const pool = new Pool({
    // connectionString: process.env.POSTGRES_URL
    connectionString: "postgres://default:RcXhD7Ag9wUV@ep-green-bird-78301737-pooler.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require"
});

const searchExcName = `
    SELECT * FROM exercise 
    WHERE name LIKE $1 AND (gym LIKE $2 or gym LIKE 'both')
    ORDER BY popularity DESC;
    `;

export default async (req, res) => {
    if (req.method === 'POST') {
        const searchQuery = req.body.searchQuery;
        const gym = req.body.gym;

        try {
            // Insert user
            const values = [`%${searchQuery}%`, gym];
            console.log('searchExcNameFiltered.js');
            const results = await pool.query(searchExcName, values);

            res.json({ success: true, data: results });
        } catch (err) {
            console.log('error in searchExcNameFiltered.js');
            console.error(err);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    } else {
        res.status(405).end();  // Method Not Allowed
    }
};

// get user data using email 
// since email is unique 

import { Pool } from 'pg';

const pool = new Pool({
    // connectionString: process.env.POSTGRES_URL
    connectionString: "postgres://default:RcXhD7Ag9wUV@ep-green-bird-78301737-pooler.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require"
});

const searchUserEmail = `
    SELECT * FROM users
    WHERE email LIKE $1
    LIMIT 1;
    `;

export default async (req, res) => {
    if (req.method === 'POST') {
        const searchQuery = req.body.searchQuery;
        console.log(searchQuery);

        try {
            const values = [`%${searchQuery}%`];
            const results = await pool.query(searchUserEmail, values);

            console.log('Success! GetUIDfromEmail');
            res.json({ success: true, data: results });
        } catch (err) {
            console.log('Error in GetUIDfromEmail');
            console.error(err);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    } else {
        res.status(405).end();  // Method Not Allowed
    }
};

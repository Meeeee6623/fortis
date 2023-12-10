// insert user data into user_data

import { Pool } from 'pg';

const pool = new Pool({
    // connectionString: process.env.POSTGRES_URL
    connectionString: "postgres://default:RcXhD7Ag9wUV@ep-green-bird-78301737-pooler.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require"
});

const insertUser = `
    INSERT INTO "user_data" (uid, name)
    VALUES ($1, $2)
`;

export default async (req, res) => {
    if (req.method === 'POST') {
        const { uid, name } = req.body;

        try {
            // Insert user
            console.log('Success! insertUserData.js');
            await pool.query(insertUser, [uid, name]);

            res.status(200).send('Data saved successfully');
        } catch (err) {
            console.log('Error in insertUserData.js');
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    } else {
        res.status(405).end();  // Method Not Allowed
    }
};

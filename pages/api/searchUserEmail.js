import { Pool } from 'pg';

const pool = new Pool({
    // connectionString: process.env.POSTGRES_URL
    connectionString: "postgres://default:RcXhD7Ag9wUV@ep-green-bird-78301737.us-east-1.postgres.vercel-storage.com:5432/verceldb"
});

const searchUserEmail = `
    SELECT * FROM users
    WHERE Email LIKE $1
    `;

export default async (req, res) => {
    if (req.method === 'POST') {
        const searchQuery = req.body.searchQuery;;

        try {
            // Insert user
            const values = [`%${searchQuery}%`];
            console.log('hi2');
            const results = await pool.query(searchUserEmail, values);
            
            res.json({ success: true, data: results });
        } catch (err) {
            console.log('hello2');
            console.error(err);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    } else {
        res.status(405).end();  // Method Not Allowed
    }
};

// get all data related to an exercise using eid
import { Pool } from 'pg';

const pool = new Pool({
    // connectionString: process.env.POSTGRES_URL
    connectionString: "postgres://default:RcXhD7Ag9wUV@ep-green-bird-78301737-pooler.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require"
});

const History = `
    SELECT * FROM exercise
    WHERE EID = $1;
    `;

export default async (req, res) => {
    if (req.method === 'POST') {
        const searchQuery = req.body.searchQuery;

        try {
            const values = [`${searchQuery}`];
            const results = await pool.query(History, values);

            //    console.log('Success! ExcDatafromEID');
            res.json({ success: true, data: results });
        } catch (err) {
            console.log('error in ExcDatafromEID');
            console.error(err);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    } else {
        res.status(405).end();  // Method Not Allowed
    }
};

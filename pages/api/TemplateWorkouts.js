// get workout information for template in discover
import { Pool } from 'pg';

const pool = new Pool({
    // connectionString: process.env.POSTGRES_URL
    connectionString: "postgres://default:RcXhD7Ag9wUV@ep-green-bird-78301737-pooler.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require"
});

const History = `
    SELECT *
    FROM workouts
    WHERE workouts."Aid" = $1 AND workouts."Uid" = $2
    ORDER BY workouts."Seq_num";
`;

export default async (req, res) => {
    if (req.method === 'POST') {
        const searchQuery = req.body.searchQuery;
        const uid = req.body.uid;
        try {
            const values = [`${searchQuery}`, uid];

            console.log('Success! TemplateWorkouts');
            const results = await pool.query(History, values);


            res.json({ success: true, data: results });
        } catch (err) {
            console.log('error in TemplateWorkouts');
            console.error(err);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    } else {
        res.status(405).end();  // Method Not Allowed
    }
};
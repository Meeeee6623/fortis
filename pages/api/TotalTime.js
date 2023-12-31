// find total time
import { Pool } from 'pg';

const pool = new Pool({
    // connectionString: process.env.POSTGRES_URL
    connectionString: "postgres://default:RcXhD7Ag9wUV@ep-green-bird-78301737-pooler.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require"
});

const timey = `
    SELECT 
        SUM(CASE WHEN "Date" >= current_date - INTERVAL '1 week' THEN EXTRACT(EPOCH FROM "Duration") / 60 ELSE 0 END) AS total_workout_minutes,
        SUM(CASE WHEN "Date" >= current_date - INTERVAL '2 week' AND "Date" < current_date - INTERVAL '1 week' THEN EXTRACT(EPOCH FROM "Duration") / 60 ELSE 0 END) AS previous_week_minutes
    FROM 
        public.activity
    WHERE 
        "Uid" = $1
        AND "Date" >= current_date - INTERVAL '2 week';
    `; 


export default async (req, res) => {
    if (req.method === 'POST') {
        const searchQuery = req.body.searchQuery;
        try {
            const values = [`${searchQuery}`];

            console.log('Success! TotalTime');
            const results = await pool.query(timey, values);

            res.json({ success: true, data: results });
        } catch (err) {
            console.log('error in TotalTime');
            console.error(err);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    } else {
        res.status(405).end();  // Method Not Allowed
    }
};
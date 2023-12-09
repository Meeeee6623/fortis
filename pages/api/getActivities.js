import { Pool } from 'pg';

const pool = new Pool({
    // connectionString: process.env.POSTGRES_URL
    connectionString: "postgres://default:RcXhD7Ag9wUV@ep-green-bird-78301737.us-east-1.postgres.vercel-storage.com:5432/verceldb"
});

const History = `
    SELECT 
        *, 
        to_char(activity."Date", 'YYYY-MM-DD') AS formatted_date
    FROM 
        activity
    WHERE 
        activity."Uid" = $1 
        AND activity."Aid" = $2
`;


export default async (req, res) => {
    if (req.method === 'POST') {
        const searchQuery = req.body.searchQuery;
        const aid = req.body.aid;

        try {
            // Insert user
            const values = [`${searchQuery}`, aid];
            console.log('Success! HistoryActivities');
            const results = await pool.query(History, values);

            res.json({ success: true, data: results });
        } catch (err) {
            console.log('Error in HistoryActivites');
            console.error(err);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    } else {
        res.status(405).end();  // Method Not Allowed
    }
};

// get information required for bobby
import { Pool } from 'pg';

const pool = new Pool({
    // connectionString: process.env.POSTGRES_URL
    connectionString: "postgres://default:RcXhD7Ag9wUV@ep-green-bird-78301737-pooler.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require"
});
const Bobby = `
    SELECT 
        unnested_muscle_group AS muscle_group,
        SUM(w."Set") AS total_sets
    FROM 
        public.workouts w
    INNER JOIN 
        public.exercise e ON w."Eid" = e.eid
    INNER JOIN 
        public.activity a ON w."Aid" = a."Aid" AND w."Uid" = a."Uid"
    CROSS JOIN 
        LATERAL unnest(string_to_array(e.muscle_group, ', ')) AS unnested_muscle_group
    WHERE 
        w."Uid" = $1
        AND a."Date" >= current_date - INTERVAL '1 week'
    GROUP BY 
        unnested_muscle_group;
`;
export default async (req, res) => {
    if (req.method === 'POST') {
        const searchQuery = req.body.searchQuery;
        try {
            const values = [`${searchQuery}`];

            console.log('Success! Bobby');
            const results = await pool.query(Bobby, values);

            res.json({ success: true, data: results });
        } catch (err) {
            console.log('Error in Bobby');
            console.error(err);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    } else {
        res.status(405).end();  // Method Not Allowed
    }
};
// number of likes or favorites 
// called if someone uses aid as template

import { Pool } from 'pg';

const pool = new Pool({
    // connectionString: process.env.POSTGRES_URL
    connectionString: "postgres://default:RcXhD7Ag9wUV@ep-green-bird-78301737-pooler.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require"
});

const query = `
    UPDATE public.activity
    SET "Favorite" = CASE
                        WHEN "Favorite" > 0 THEN "Favorite" + 1
                        WHEN "Favorite" < 0 THEN "Favorite" - 1
                        ELSE "Favorite"
                    END
    WHERE "Aid" = $1;
`;

export default async (req, res) => {
    if (req.method === 'POST') {
        const { Aid } = req.body;

        try {
            const values = [Aid];
            await pool.query(query, values);

            res.status(200).json({ message: 'favorites updated successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
};
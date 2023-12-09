// delete highest AID from uid
import { Pool } from 'pg';

const pool = new Pool({
    // connectionString: process.env.POSTGRES_URL
    connectionString: "postgres://default:RcXhD7Ag9wUV@ep-green-bird-78301737-pooler.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require"
});

const deleteActivity = `
    DELETE FROM activity
    WHERE "Aid" = (
        SELECT "Aid" FROM activity
        WHERE "Uid" = $1
        ORDER BY "Aid" DESC
        LIMIT 1
    ) AND
    "Uid" = $1
`;

export default async (req, res) => {
    if (req.method === 'POST') {
        const { uid } = req.body;

        try {
            const values = [uid];
            await pool.query(deleteActivity, values);

            res.status(200).json({ message: 'Activity deleted successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
};
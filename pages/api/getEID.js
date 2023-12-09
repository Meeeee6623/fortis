

//   // USELESS STUFF, JUST CHECKING
//   const getEID = async (query: any) => {
//     const response = await fetch('/api/getEID', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         searchQuery: query
//       }),
//     });

//     if (!response.ok) {
//       throw new Error('Failed to save query');
//     }

//     const data = await response.json();
//     console.log(data)
//   };

//     // END OF USELESS STUFF, JUST CHECKING



// WHen you click a button: 
//   "   getEID(value);    "  <-   This needs to be called.



import { Pool } from 'pg';

const pool = new Pool({
    // connectionString: process.env.POSTGRES_URL
    connectionString: "postgres://default:RcXhD7Ag9wUV@ep-green-bird-78301737-pooler.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require"
});

const getEID = `
    SELECT exercise."eid"
    FROM exercise
    WHERE exercise."name" LIKE $1;
    `;

export default async (req, res) => {
    if (req.method === 'POST') {
        const searchQuery = req.body.searchQuery;

        try {
            // Insert user
            const values = [`%${searchQuery}%`];
            console.log('hi');
            const results = await pool.query(getEID, values);

            res.json({ success: true, data: results });
        } catch (err) {
            console.log('hello');
            console.error(err);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    } else {
        res.status(405).end();  // Method Not Allowed
    }
};

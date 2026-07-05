import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
    || 'postgres://kiworks:kiworks@127.0.0.1:5432/kiworks',
  max: 10,
});

export const query = (text, params) => pool.query(text, params);
export default pool;

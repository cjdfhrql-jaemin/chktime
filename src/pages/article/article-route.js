import { Hono } from 'hono';
import { Feeds } from '../../functions/db/feeds';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import dbConfig from '../../../db_opt.json';

const articleRoute = new Hono();

articleRoute.get('/:id', async (c) => {
    const { id } = c.req.param();
    
    // 🚀 URI 파싱해서 'ssl-mode' 경고 지우는 로직 (완벽함)
    const url = new URL(c.env.HH_DB.connectionString);
    url.searchParams.delete('ssl-mode'); 

    // 🚀 가벼워진 dbConfig.hh_db 옵션만 주입!
    const pool = mysql.createPool({
        uri: url.toString(),
        ...dbConfig.hh_db
    });
    
    const feeds = new Feeds(drizzle(pool)); 

    try {
        const list = await feeds.select({ limit: 1 });
        return c.json(list);
    } catch (err) {
        console.error("라우트 에러:", err);
        return c.json({ error: err.message }, 500);
    } finally {
        await feeds.destroy(); 
    }
});

export default articleRoute;
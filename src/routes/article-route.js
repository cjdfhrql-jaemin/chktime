import { Hono } from 'hono';
import { Feeds } from '../functions/db/feeds';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import dbConfig from '../../db_opt.json';
import { Layout } from '../pages/layout/template.jsx';


/** @jsx jsx */
import { jsx } from 'hono/jsx'

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
    
    const feeds = new Feeds(pool); 

    try {
        const list = await feeds.getFeeds({table:'g5_write_dev_manual', id:id});
        const content = list[0].content;
        return c.html(
            <Layout title="Article">
                <div class="card article" dangerouslySetInnerHTML={{ __html: content }} />
            </Layout>
        );

    } catch (err) {
        console.error("라우트 에러:", err);
        return c.json({ error: err.message }, 500);
    } finally {
        await pool.end();
    }
});

export default articleRoute;
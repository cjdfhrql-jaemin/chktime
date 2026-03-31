import { Hono } from 'hono'

import { getLanguage } from './functions/lang'
import { Pages } from './pages'
import { Layout } from './layout.jsx'
import { handleBase } from './base.js'

import { getConnection } from './functions/db_conn.js';
import { sql } from 'drizzle-orm'
import { prettyHtml } from './functions/pretty-html.js'

import articleRoute from './pages/article/index.js'
import apiRoute from './functions/api/index.js'

/** @jsx jsx */
import { jsx } from 'hono/jsx'


const domain = 'chktime.com';
const app = new Hono();

app.notFound((c) => {
	return c.body(null, 204);
});

app.get("/db-test", async (c) => {
	let db;

	try {
		db = await getConnection(c);
		const result = await db.execute(sql`SELECT 1`);

		return c.json({
			success: true,
			data: result,
		});

	} catch (e) {
		console.error(e);
		return c.json({
			success: false,
			error: e.message,
		});

	}
});

app.use('*', async (c, next) => {
	const url = new URL(c.req.url);
	const pathname = url.pathname;

	try {
		const baseResponse = handleBase(url);
		if (baseResponse) {
			return baseResponse;
		}
	} catch (error) {
		return c.notFound();
	}

	if (pathname.includes('.') || pathname.startsWith('/assets/')) {
		return await next();
	}

	const cf = c.req.raw.cf || {};
	c.set('data', {
		lang: getLanguage(cf),
		userLat: cf.latitude || 37.5665,
		userLng: cf.longitude || 126.9780
	});

	await next();

	const contentType = c.res.headers.get('Content-Type');
	if(contentType && contentType.includes('text/html')) {
		const html = await c.res.text();
		const prettyHTMLResult = await prettyHtml(html);
		c.res = new Response(prettyHTMLResult, {
            status: c.res.status,
            statusText: c.res.statusText,
            headers: c.res.headers
        });
	}
});

app.get('/', async (c) => {
	const data = c.get('data');
	const host = c.req.header('host') || 'chktime.com';
	const Main = Pages.main;
	const query = `
	SELECT 
        domain, 
        SUM(hit_count) as total_hit
    FROM 
        tb_chktime_domain 
    GROUP BY 
        domain 
    ORDER BY 
        total_hit DESC 
    LIMIT 10
`
	const { results } = await c.env.DB.prepare(query).all();

	return c.html(
		<Layout title={host}>
			<Main data={data} results={results}/>
		</Layout>
	);
});

app.route('/api', apiRoute);
app.route('/article', articleRoute);

app.get('/:page', (c) => {
	const { page } = c.req.param();
	const pageKey = page.toLowerCase();
	let Component = Pages[pageKey];

	if (!Component) {
		return c.notFound();
	}

	const host = c.req.header('host') || domain;
	const data = c.get('data');
	
	return c.html(
		<Layout title={host}>
			<Component data={data} />
		</Layout>
	);
});


export default app;
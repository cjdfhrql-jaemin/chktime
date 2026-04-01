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
import { drizzle } from 'drizzle-orm/d1';
import { desc } from 'drizzle-orm';

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
	if (contentType && contentType.includes('text/html')) {
		const html = await c.res.text();
		const prettyHTMLResult = await prettyHtml(html);
		c.res = new Response(prettyHTMLResult, {
			status: c.res.status,
			statusText: c.res.statusText,
			headers: c.res.headers
		});
	}
});

import Domains from './functions/db/domains.js';

app.get('/', async (c) => {
	const data = c.get('data');
	const host = c.req.header('host') || 'chktime.com';
	const Main = Pages.main;
	const dao = new Domains(drizzle(c.env.DB));
	const results = await dao.getList({ orders: { hit_count: 'desc' } });
	data.results = results;

	return c.html(
		<Layout title={host}>
			<Main data={data} />
		</Layout>
	);
});

app.route('/api', apiRoute);
app.route('/article', articleRoute);

app.get('/:page', async (c) => {
	const { page } = c.req.param();
	const paths = [
		`./pages/${page}.jsx`,
		`./pages/${page}/index.jsx`,
		`./pages/main.jsx`
	];
	let Component = null; 

	for (const path of paths) {
		try {
			const jsxFile = await import(path);
			Component = jsxFile.default;
			break; // 찾았으면 지체 없이 stop!
		} catch (e) {
		}
	}

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
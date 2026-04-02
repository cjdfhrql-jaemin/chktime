import { Hono } from 'hono'

import { getLanguage } from './functions/lang'
import { Layout } from './pages/layout/template.jsx'
import { handleBase } from './base.js'

import { prettyHtml } from './functions/pretty-html.js'

import articleRoute from './pages/article/article-route.js'
import apiRoute from './functions/api/api-route.js'

/** @jsx jsx */
import { jsx } from 'hono/jsx'

const app = new Hono();

app.notFound((c) => {
	return c.body(null, 204);
});

app.get('/assets/*', async (c, next) => {
	await next();

	c.res.headers.append('Cache-Control', 'public, max-age=31536000, immutable');
});

app.use('*', async (c, next) => {
	const url = new URL(c.req.url);
	const pathname = url.pathname;

	if (pathname.includes('.')) {
		return next();
	}

	try {

		const baseResponse = handleBase(url);
		if (baseResponse) {
			return baseResponse;
		}

	} catch (error) {
		return c.notFound();
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
import { drizzle } from 'drizzle-orm/d1'

app.get('/', async (c) => {
	const data = c.get('data');
	const host = c.req.header('host') || 'chktime.com';
	const Main = (await import('./pages/main.jsx')).default;
	const db = drizzle(c.env.DB);
	const domains = Domains.getInstance(db);
	const results = await domains.getList({ orders: { hit_count: 'desc' } });
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

	let module = null; 

	for (const ext of ['.jsx', '/index.jsx']) {
        try {
            module = await import(`./pages/${page}${ext}`);
        } catch (e) {
            continue; // 에러 나면(파일 없으면) 다음 확장자 시도
        }
    }

	if(!module) {
		return c.notFound();
	}
	
    const Component = module.default;

	const host = c.req.header('host') || 'chktime.com';
	const data = c.get('data');

	return c.html(
		<Layout title={host}>
			<Component data={data} />
		</Layout>
	);
});

export default app;
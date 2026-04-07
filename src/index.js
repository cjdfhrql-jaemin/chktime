import { Hono } from 'hono'

import { getLanguage } from './functions/lang'
import { Layout } from './pages/layout/template.jsx'
import { handleMetaFile } from './handle-metafile.js'

import { prettyHtml } from './functions/pretty-html.js'

/** @jsx jsx */
import { jsx } from 'hono/jsx'

const app = new Hono();

const getDomain = (c) => { 
	const encoded = c.req.header('x-encoded-host');
	let domain = 'chktime.com'; // 기본값

	if (encoded) {
		try {
			// Base64를 다시 텍스트로 변환
			domain = atob(encoded); 
		} catch (e) {
			console.error('인코딩 오류:', e);
		}
	}
	return domain || c.req.header('host');
}

app.use('*', async (c, next) => {
	if (c.req.path.startsWith('/api')) {
		if (typeof next === 'function') {
			return await next();
		}
		return;
	}

	const metaResponse = await handleMetaFile(c);

	if (metaResponse) {
		return metaResponse;
	}

	const domain = getDomain(c);
	const cf = c.req.raw.cf || {};
	c.set('data', {
		lang: getLanguage(cf),
		userLat: cf.latitude || 37.5665,
		userLng: cf.longitude || 126.9780,
		host: domain
	});

	if (typeof next === 'function') {
		await next();
	}

	
	const host = domain || c.req.header('host');
	if (host.startsWith('local.hh.pe.kr')) {
		const contentType = c.res.headers.get('Content-Type');
		if (contentType && contentType.includes('text/html')) {
			await prettyHtml(c);
		}
	}
});

import articleRoute from './routes/article-route.js'
import apiRoute from './routes/api-route.js'
import footerRoute from './routes/footer-route.js'

app.route('/api', apiRoute);
app.route('/article', articleRoute);
app.route('/footer', footerRoute);

import Domains from './functions/db/domains.js';
import Main from './pages/main.jsx';

app.get('/', async (c) => {
	const data = c.get('data');
	const host = data.host;
	const domains = new Domains(c.env.DB);
	const results = await domains.getList({ orders: { hit_count: 'desc' } });
	data.results = results;

	return c.html(
		<Layout title={host}>
			<Main data={data} />
		</Layout>
	);
});

app.notFound((c) => {
	return c.html(
		<Layout title="404">
			<div class="card not-found">Not Found Page</div>
		</Layout>, 404);
});

export default app;
/** @jsx jsx */
import { jsx } from 'hono/jsx'
import { Layout } from '../pages/layout/template.jsx';
import { Hono } from 'hono';

const footerRoute = new Hono();

footerRoute.get('/:page', async (c) => {
	const { page } = c.req.param();

	const host = c.req.header('host') || 'chktime.com';
	const data = c.get('data');

	let module = null;
	try {
		module = await import(`../pages/${page}.jsx`);
	} catch (error) {
		console.error(error);
		return c.notFound();
	}
	
	const Component = module.default;
	const title = `${page.charAt(0).toUpperCase() + page.slice(1)} | ${host}`;

    return c.html(
        <Layout title={title}>
            <Component data={data} />
        </Layout>
    );
});

export default footerRoute;


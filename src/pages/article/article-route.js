import { Hono } from 'hono';

const articleRoute = new Hono();

articleRoute.get('/:id', async (c) => {
  const { id } = c.req.param();
  return c.text(`Article ${id}`);
});

export default articleRoute;
import { Hono } from 'hono';

const articleRoute = new Hono();

articleRoute.get('/1', (c) => {
  return c.text('Article 1');
});

articleRoute.get('/2', (c) => {
  return c.text('Article 2');
});

articleRoute.get('/3', (c) => {
  return c.text('Article 3');
});

articleRoute.get('/4', (c) => {
  return c.text('Article 4');
});

articleRoute.get('/5', (c) => {
  return c.text('Article 5');
});

export default articleRoute;
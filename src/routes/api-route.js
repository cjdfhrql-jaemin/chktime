import { Hono } from 'hono';
import handleWebSocket from "../functions/api/ws";
import handleServerInfo from "../functions/api/server-info";

const apiRoute = new Hono();

apiRoute.post('/server-info', (c) => {
	return handleServerInfo(c) 
});
apiRoute.get('/ws', (c) => {
	return handleWebSocket(c)
});

export default apiRoute;
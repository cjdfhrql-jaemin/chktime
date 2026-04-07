import { Hono } from 'hono';
import handleWebSocket from "../functions/api/ws";
import handleServerInfo from "../functions/api/server-info";

const apiRoute = new Hono();

apiRoute.post('/server-info', handleServerInfo);
apiRoute.get('/ws', handleWebSocket);

export default apiRoute;
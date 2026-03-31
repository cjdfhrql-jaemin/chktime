import { Hono } from 'hono';
import { handleServerInfo } from "./server-info";
import { handleWebSocket } from "./ws";

const apiRoute = new Hono();

apiRoute.post('/server-info', handleServerInfo);
apiRoute.get('/ws', handleWebSocket);

export default apiRoute;
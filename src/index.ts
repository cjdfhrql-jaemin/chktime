import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'
import { upgradeWebSocket } from 'hono/cloudflare-workers'
import { getLanguage } from './functions/lang'
import { Pages } from './pages'
import { Layout} from './layout';

const app = new Hono<{ Variables: {data: any} }>();

app.use('*', async (c, next) => {
  const cf = (c.req.raw as any).cf || {};
  const lang = getLanguage(cf);
  const data = { lang, cf, userLat: cf.latitude || 37.5665, userLng: cf.longitude || 126.9780 };
  c.set('data', data);
  await next();
});

app.get('/assets/*', serveStatic({ root: './' } as any))
app.get('/', (c) => {
  const data = c.get('data');
  const host = c.req.header('host') || 'chktime.com';
  return c.html(Layout(host, Pages.main({ data })));
});

const activeTasks = new Map<string, number>();
app.post('/api/server-info', async (c) => {

  try {
    
    const body = await c.req.json();
    const inputUrl = body.url || "";
    
    // 도메인만 추출 (프로토콜 제거)
    let domain = inputUrl.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    if (!domain) {
      throw new Error("Invalid Domain");
    }

    activeTasks.set(domain, 0);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const t1 = Date.now();

    // 2. 병렬 호출 (속도 최적화)
    const [timeRes, geoRes] = await Promise.all([
      fetch("https://" + domain, {
        method: 'GET', 
        cache: 'no-store', 
        redirect: 'manual', 
        signal: controller.signal
      }),
      fetch(`http://ip-api.com/json/${domain}?fields=status,message,lat,lon,city,country,timezone`, {
        signal: controller.signal
      })
    ]);

    clearTimeout(timeoutId);
    const t2 = Date.now();
    const rtt = t2 - t1;

    const geoData: any = await geoRes.json();
    if (geoData.status === "fail") throw new Error("Geo Lookup Failed");

    // 3. 시간 계산 로직
    const dateHeader = timeRes.headers.get('date');
    const baseTime = dateHeader ? new Date(dateHeader).getTime() : Date.now();
    const adjustedTime = baseTime + (rtt / 2);

    // 4. Hono 스타일의 깔끔한 응답
    return c.json({
      serverTime: adjustedTime,
      rtt: rtt,
      lat: geoData.lat,
      lng: geoData.lon,
      city: geoData.city,
      country: geoData.country,
      dateHeader: dateHeader,
      timezone: geoData.timezone
    });

  } catch (e:any) {
    console.error("🚨 서버 에러 발생:", e.message); // 로그 확인용
    return c.json({ error: e.message }, 400);
  }
});

const taskCache = new Map<string, any>();

app.get('/ws', upgradeWebSocket((c) => {
  const url = new URL(c.req.url);
  const domain = url.searchParams.get('domain') || 'unknown';
  
  // 1. 타이머를 관리할 변수 (나중에 클린업용)
  let timer: any = null;

  return {
    onMessage(event, ws) {
      console.log(`[WS] Connected: ${domain}`);

      if (event.data === 'READY') {
        console.log(`[WS] ${domain} 스캔 시작 신호 수신!`);

        // 3. 여기서부터 ws 객체를 자유롭게 사용!
        setTimeout(() => {
          let progress = 0;

          const runScan = () => {
            progress += Math.floor(Math.random() * 2) + 1;  
            
            if (progress >= 100) {
              ws.send(JSON.stringify({ type: 'PROGRESS', value: 100, status: 'DONE' }));
              return;
            }

            // [핵심] 여기서 ws.send() 호출!
            ws.send(JSON.stringify({ type: 'PROGRESS', value: progress, status: 'SCANNING' }));

            const nextTick = Math.floor(Math.random() * 50) + 10;
            timer = setTimeout(runScan, nextTick);
          };

          runScan();
        }, 500);
      }
    },
    onClose: () => {
      if (timer) clearTimeout(timer);
      console.log(`[WS] ${domain} 연결 종료 및 타이머 정리`);
    }
  };
}));

app.get('/:page', (c) => {
  const page = c.req.param('page').toLowerCase();
  const data = c.get('data');
  const host = c.req.header('host') || 'chktime.com';

  const Component = Pages[page as keyof typeof Pages];

  if (!Component) {
    return c.notFound();
  }

  // Layout에 알맹이(Component)를 끼워 넣어서 반환
  return c.html(
    Layout(host, Component({ data }))
  );
});

export default app
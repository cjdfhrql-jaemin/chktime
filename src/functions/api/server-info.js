import Domains from "../db/domains";

// [메인 핸들러]
export const handleServerInfo = async (c) => {
    const controller = new AbortController();

    try {
        const body = await c.req.json().catch(() => ({}));
        let domain = body.url?.startsWith("http") ? new URL(body.url).hostname : body.url;
        if (!domain) {
            throw new Error("Invalid Domain");
        }

        // 1. 위치 정보는 백그라운드 병렬 시작
        const geoPromise = fetch(`http://ip-api.com/json/${domain}?fields=status,message,lat,lon,city,country,timezone`, {
            signal: controller.signal
        }).then(r => r.json());

        /**
         * 2. [핵심] 틱-체이싱(Tick-Chasing) 로직
         * 서버의 초(Second)가 바뀌는 찰나를 포착하여 000ms 지점을 찾아냄
         */
        const getHighPrecisionTime = async () => {
            let prevSec = null;
            let attempts = 0;
            const maxAttempts = 10;

            while (attempts < maxAttempts) {
                const t0 = Date.now();
                const res = await fetch(`https://sub.hh.pe.kr/api/date?domain=${domain}`, {
                    headers: { "Cache-Control": "no-cache", "User-Agent": "Mozilla/5.0 (chktime.com)" },
                    signal: controller.signal
                });
                const data = await res.json();
                const t1 = Date.now();

                const rtt = t1 - t0;
                const serverDate = new Date(data.result);
                const currentSec = serverDate.getSeconds();

                // 초(Second)가 방금 막 바뀌었다면? (예: 59초 -> 00초)
                if (prevSec !== null && currentSec !== prevSec) {
                    // 이 순간의 서버 시간은 정확히 [서버초]:000ms 라고 간주함
                    const exactServerMs = serverDate.getTime();

                    // 응답이 서버에서 출발한 시점(t1 - rtt/2)과 
                    // 서버의 000ms 지점 사이의 오차(Offset) 계산
                    const arrivalTimeAtLocal = t1 - (rtt / 2);
                    const offset = exactServerMs - arrivalTimeAtLocal;

                    return { exactServerMs, offset, rtt, status: 'synced' };
                }

                prevSec = currentSec;
                attempts++;
                // 다음 틱을 기다리기 위해 아주 짧게 대기 (50ms)
                await new Promise(r => setTimeout(r, 100));
            }

            return null; // 실패 시 폴백
        };

        const [geoData, syncData] = await Promise.all([
            geoPromise,
            getHighPrecisionTime()
        ]);

        // 최종 보정된 시간 생성
        // (로컬 시간 + 계산된 오차값)을 더하면 서버의 ms 단위 현재 시간과 일치함
        const now = Date.now();
        const calibratedTime = syncData ? new Date(now + syncData.offset) : new Date(); // 실패 시 로컬 시간

        // 3. DB 히트수 및 쿠키 (WaitUntil로 성능 확보)
        const encodedDomain = btoa(domain).replace(/=/g, "");
        const hitCookieName = `hit_${encodedDomain}`;
        const hasCookie = (c.req.header("cookie") || "").includes(hitCookieName);

        const domains = new Domains(c.env.DB);

        if (!hasCookie) {
            try {
                await domains.upsertHitCount(domain);

                // 3. 다시는 오늘 못 올리게 쿠키 발급 (24시간 유지)
                c.header("Set-Cookie", `${hitCookieName}=1; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax`);
            } catch (error) {
                console.error("조회수 업데이트 실패:", error);
            }
        }

        return c.json({
            // .SSS를 붙여서 밀리초까지 출력 (확인용)
            dateHeader: calibratedTime.toISOString(),
            milliseconds: calibratedTime.getMilliseconds(),
            latency: syncData ? syncData.rtt / 2 : 0,
            lat: geoData.lat,
            lng: geoData.lon,
            city: geoData.city,
            country: geoData.country,
            timezone: geoData.timezone,
            precision: syncData ? "ms_calibrated" : "low"
        });

    } catch (e) {
        return c.json({ error: e.message }, 400);
    } finally {
        controller.abort();
    }
};

export default handleServerInfo;

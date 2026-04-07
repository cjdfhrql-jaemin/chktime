const META_FILES = new Set([
    'ads.txt',
    'com.chrome.devtools.json',
    'humans.txt',
    'manifast.json',
    'opensearch.xml',
    'robots.txt',
    'security.txt',
    'sitemap.xml'
]);

// URL 전체를 키로 사용하는 정밀 캐시
const metaCache = new Map();

export async function handleMetaFile(c) {
    const url = new URL(c.req.url);
    const pathname = url.pathname;
    const fullUrl = url.href;

    // 1. 경로 분해 (공백 제거)
    const pathParts = pathname.split('/').filter((p) => {
        return p !== '';
    });

    if (pathParts.length === 0) {
        return null;
    }

    const filename = pathParts[pathParts.length - 1];

    // [검증 1] 파일명이 목록에 없으면 즉시 탈탈
    if (!filename || !META_FILES.has(filename)) {
        return null;
    }

    // [검증 2] 경로 깊이 및 폴더명 엄격 검사
    const depth = pathParts.length;

    if (depth === 1) {
        // 루트(/filename) OK
    } else if (depth === 2 && pathParts[0] === '.well-known') {
        // 정확히 /.well-known/filename 인 경우만 OK
        // 만약 사용자가 /well-known/ (점 없음)으로 들어오면 여기서 걸러짐
    } else {
        // 그 외 모든 변종 경로(well-known2, .well-known/sub/ 등) 차단
        return null;
    }

    // 2. 캐시 및 데이터 처리 로직 (이후 동일)
    let cachedData = metaCache.get(fullUrl);

    if (!cachedData) {
        try {
            const assetUrl = `https://public/metafiles/${filename}`;
            const response = await c.env.STATIC.fetch(assetUrl);

            if (!response.ok) {
                return null;
            }

            const rawContent = await response.text();

            const processedContent = rawContent
                .replace(/{{domain}}/g, url.host)
                .replace(/{{currentYear}}/g, new Date().getFullYear());

            const extension = filename.split('.').pop();
            const mimeTypes = {
                xml: 'application/xml',
                txt: 'text/plain',
                json: 'application/json'
            };

            cachedData = {
                content: processedContent,
                type: `${mimeTypes[extension] || 'text/plain'}; charset=utf-8`
            };

            metaCache.set(fullUrl, cachedData);
        } catch (e) {
            console.error(`❌ fetch 에러: ${filename}`, e.message);
            return null;
        }
    }

    return c.text(cachedData.content, 200, {
        'Content-Type': cachedData.type,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600'
    });
}
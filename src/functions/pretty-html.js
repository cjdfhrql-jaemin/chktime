export const prettyHtml = async (c) => {
    const html = await c.res.text();
    const tab = '  ';
    let indent = 0;
    let result = '';
    let isSkip = false; // 💡 스크립트나 스타일 태그 내부인지 확인하는 플래그

    const tagRegex = /(<[^>]+>)|([^<]+)/g;
    let match;

    while ((match = tagRegex.exec(html)) !== null) {
        const token = match[0].trim();
        if (!token) continue;

        // 1. 닫는 태그 체크
        if (token.startsWith('</')) {
            // 보호 구역 종료 체크
            if (token.match(/<\/(script|style|pre|textarea)/i)) isSkip = false;
            indent = Math.max(0, indent - 1);
        }

        // 2. 결과 조합 (보호 구역(isSkip)이면 줄바꿈/인덴트 없이 원본 그대로 추가)
        if (isSkip) {
            result += token;
        } else {
            result += (result ? '\n' : '') + tab.repeat(indent) + token;
        }

        // 3. 여는 태그 체크
        if (token.startsWith('<') && !token.startsWith('</') && !token.endsWith('/>')) {
            // 💡 보호해야 할 태그(script, style 등)를 만나면 플래그 ON
            if (token.match(/<(script|style|pre|textarea)/i)) isSkip = true;

            const isVoid = /<(meta|link|br|hr|img|input|area|base|col|embed|keygen|param|source|track|wbr)/i.test(token);
            if (!isVoid) {
                indent++;
            }
        }
    }

    c.res = new Response(result, {
        status: c.res.status,
        headers: c.res.headers
    });
};
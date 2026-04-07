export const prettyHtml = async (c) => {
    const html = await c.res.text();
    const tab = '  ';
    let indent = 0;
    let result = '';
    let isSkip = false;

    // 공백을 포함하여 태그와 텍스트를 분리하는 정규식
    const tagRegex = /(<[^>]+>)|([^<]+)/g;
    let match;

    while ((match = tagRegex.exec(html)) !== null) {
        const token = match[0]; // trim() 제거: 원본 텍스트 유지
        const isTag = token.startsWith('<');

        if (isTag) {
            const trimmedTag = token.trim();
            
            // 1. 닫는 태그 체크
            if (trimmedTag.startsWith('</')) {
                if (trimmedTag.match(/<\/(script|style|pre|textarea)/i)) isSkip = false;
                indent = Math.max(0, indent - 1);
            }

            // 2. 결과 조합 (태그는 줄바꿈과 인덴트 적용)
            if (isSkip) {
                result += token;
            } else {
                // 태그 앞에 줄바꿈과 인덴트 추가
                result += (result ? '\n' : '') + tab.repeat(indent) + trimmedTag;
            }

            // 3. 여는 태그 체크
            if (trimmedTag.startsWith('<') && !trimmedTag.startsWith('</') && !trimmedTag.endsWith('/>')) {
                if (trimmedTag.match(/<(script|style|pre|textarea)/i)) isSkip = true;

                const isVoid = /<(meta|link|br|hr|img|input|area|base|col|embed|keygen|param|source|track|wbr)/i.test(trimmedTag);
                if (!isVoid) {
                    indent++;
                }
            }
        } else {
            // 텍스트 노드인 경우
            if (isSkip) {
                result += token;
            } else {
                // 텍스트 내의 불필요한 연속 공백은 정리하되, 텍스트 자체는 유지
                const content = token.replace(/\s+/g, ' '); 
                if (content !== ' ') {
                    result += content;
                }
            }
        }
    }

    c.res = new Response(result, {
        status: c.res.status,
        headers: c.res.headers
    });
};
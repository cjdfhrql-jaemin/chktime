const currentYear = new Date().getFullYear();

function sitemap_xml(url) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url><loc>https://${url.host}/</loc><priority>1.0</priority></url>
    <url><loc>https://${url.host}/about</loc><priority>0.8</priority></url>
    <url><loc>https://${url.host}/terms</loc><priority>0.8</priority></url>
    <url><loc>https://${url.host}/policy</loc><priority>0.8</priority></url>
</urlset>`;
}

function robots_txt(url) {
    return `User-agent: *
Allow: /

nSitemap: https://${url.host}/sitemap.xml`;
}

function security_txt(url) {
    return `Contact: mailto:ljmsp83@naver.com
Policy: https://${url.host}/policy
Expires: ${currentYear}-12-31T23:59:59.000Z
Preferred-Languages: ko, en`;
}


function opensearch_xml(url) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/" xmlns:moz="http://www.mozilla.org/robotics/sidebars/mozsearch">
  <ShortName>${url.host.toUpperCase()}</ShortName>
  <Description>AI Dream Interpretation | DREAMTICS.NET</Description>
  <Url type="text/html" method="get" template="https://www.google.com/search?q=site:${url.host}+{searchTerms}"/>
  <InputEncoding>UTF-8</InputEncoding>
  <Image width="16" height="16" type="image/svg+xml">data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgcng9IjIwIiBmaWxsPSIjMDA3N2VlIi8+CiAgPHBhdGggZD0iTTUwIDIwIEMzNSAyMCAyNSAzMCAyNSA0NSBDMjUgNjUgNTAgODAgNTAgODAgQzUwIDgwIDc1IDY1IDc1IDQ1IEM3NSAzMCA2NSAyMCA1MCAyMFoiIGZpbGw9IndoaXRlIi8+CiAgPGNpcmNsZSBjeD0iNTAiIGN5PSI0NSIgcj0iMTAiIGZpbGw9IiMwMDc3ZWUiLz4KICA8Y2lyY2xlIGN4PSI3MCIgY3k9IjcwIiByPSIxNSIgZmlsbD0id2hpdGUiIHN0cm9rZT0iIzAwNzdlZSIgc3Ryb2tlLXdpZHRoPSIzIi8+CiAgPGxpbmUgeDE9Ijc4IiB5MT0iNzgiIHgyPSI5MCIgeTI9IjkwIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2hpdGg9IjgiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4=</Image>
</OpenSearchDescription>`;
}

const humans_txt = `/* TEAM */
Developer: Jaemin Lee
Contact: ljmsp83@naver.com
Location: Seoul, South Korea
Site: HH.PE.KR, CHKIP.ORG, CHKTIME.COM, DREAMTICS.NET

/* SITE */
Last update: ${currentYear}/01/01
Software: Cloudflare Workers, Gemini AI
Standards: HTML5, CSS3, RFC 9116
Standards: PHP, JSP, HTML5, CSS3, JAVASCRIPT, RFC 9116
`
const ads_txt = "google.com, pub-1216027646063680, DIRECT, f08c47fec0942fa0";
const gpc_json = `{
  "gpc": true,
  "last_update": "${currentYear}-01-01"
}`

const routes = (url) => {

    const map = {
        "/sitemap.xml": { body: sitemap_xml(url), type: "application/xml" },
        "/.well-known/sitemap.xml": { body: sitemap_xml(url), type: "application/xml" },
        "/robots.txt": { body: robots_txt(url), type: "text/plain" },
        "/.well-known/robots.txt": { body: robots_txt(url), type: "text/plain" },
        "/security.txt": { body: security_txt(url), type: "text/plain" },
        "/.well-known/security.txt": { body: security_txt(url), type: "text/plain" },
        "/opensearch.xml": { body: opensearch_xml(url), type: "application/xml" },
        "/.well-known/opensearch.xml": { body: opensearch_xml(url), type: "application/xml" },
        "/humans.txt": { body: humans_txt, type: "text/plain" },
        "/.well-known/humans.txt": { body: humans_txt, type: "text/plain" },
        "/ads.txt": { body: ads_txt, type: "text/plain" },
        "/.well-known/ads.txt": { body: ads_txt, type: "text/plain" },
        "/gpc.json": { body: gpc_json, type: "application/json" },
        "/.well-known/gpc.json": { body: gpc_json, type: "application/json" },
        "/.well-known/appspecific/com.chrome.devtools.json": { body: "{}", type: "application/json" }
    };

    return map[url.pathname] || null;
};

export function handleBase(url) {
    
    const match = routes(url);
    if (!match) {
        return null;
    }

    return new Response(match.body, {
        headers: {
            "Content-Type": `${match.type}; charset=utf-8`,
            "Access-Control-Allow-Origin": "*"
        }
    });
}
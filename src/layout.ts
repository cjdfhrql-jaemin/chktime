import { html } from 'hono/html'

// 공통 레이아웃 함수 (중복 코드 방지!)
export const Layout = (title: string, content: any) => html`
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="google-adsense-account" content="ca-pub-1216027646063680">

    <title>${title}</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/joungkyun/font-d2coding/d2coding.css" />

    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1216027646063680" crossorigin="anonymous"></script>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgcng9IjIyIiBmaWxsPSIjMDA3N2VlIi8+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMzIiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNyIvPjxwYXRoIGQ9Ik0zOCA1MiBMNDYgNjAgTDYyIDM4IiBmaWxsPSJub25lIiBzdHJva2U9IiNjYzU1MDAiIHN0cm9rZS13aWR0aD0iMTAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxsaW5lIHgxPSI1MCIgeTE9IjUwIiB4Mj0iNTAiIHkyPSIzMCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSI2IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4=">

    <link rel="stylesheet" href="/assets/style.css">
  </head>
  <body>
    <div class="brand" onclick="location.href='/'">CHKTIME<span>.COM</span></div>
  
    <div class="left-side side-ad"><ins class="adsbygoogle"style="display:block" data-ad-client="ca-pub-1216027646063680" data-ad-slot="5535756764" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script></div>
    <div class="right-side side-ad"><ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-1216027646063680" data-ad-slot="8572983644" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script></div>

    <main id="app" class="container">${content}</main>
    <footer class="footer" role="contentinfo">
      <div class="copy">© 2026 CHKTIME.COM  Built with <a href="https://cloudflare.com" target="_blank">cloudflare.com</a></div>
      <ul>
        <li><a href="/about" class="footer-link">About</a></li>
        <li><a href="/terms" class="footer-link">Terms of Service</a></li>
        <li><a href="/policy" class="footer-link">Privacy Policy</a></li>
      </ul>
    </footer>
  </body>
</html>
`;
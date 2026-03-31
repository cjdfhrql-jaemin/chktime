import { html } from 'hono/html'

// lang 데이터를 인자로 받아서 화면을 구성함
export default function About({ data }) {
    const lang = data.lang;
    return html`
<div id="policy-view" class="animate-fade">
    <div class="card policy-card">
        <h1>About</h1>
        <p>${lang.about1}</p>
        <p>${lang.about2}</p>
        <a href="/" class="back-link">← Back to Home</a>
    </div>
</div>
  `;
}
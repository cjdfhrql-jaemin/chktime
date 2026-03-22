import { html } from 'hono/html'

// lang 데이터를 인자로 받아서 화면을 구성함
export default function Terms({ data }: { data: any }) {
    const lang = data.lang;
    return html`
<div id="policy-view" class="animate-fade">
    <div class="card policy-card">
        <h1 class="policy-title">Terms of Service</h1>
        <div class="policy-content">
            <section class="policy-item"><strong>1. ${lang.terms1t}</strong><p>${lang.terms1c}</p></section>
            <section class="policy-item"><strong>2. ${lang.terms2t}</strong><p>${lang.terms2c}</p></section>
            <section class="policy-item">
              <strong>3. ${lang.terms3t}</strong><p>${lang.terms3c1}</p>
              <ul>
                <li>${lang.terms3c2}</li>
                <li>${lang.terms3c3}</li>
              </ul>
            </section>
            <section class="policy-item"><strong>4. ${lang.terms4t}</strong><p>${lang.terms4c}</p></section>
        </div>
        <a href="/" class="back-link">← Back to Home</a>
    </div>
</div>
  `;
}
import { html } from 'hono/html'

// lang 데이터를 인자로 받아서 화면을 구성함
export default function Policy({ data }: { data: any }) {
    const lang = data.lang;
    return html`
<div id="policy-view" class="animate-fade">
    <div class="card policy-card">
        <h1 class="policy-title">Privacy Policy</h1>
        <div class="policy-content">
            <section class="policy-item"><strong>1. ${lang.policy1t}</strong><p>${lang.policy1c}</p></section>
            <section class="policy-item"><strong>2. ${lang.policy2t}</strong><p>${lang.policy2c1}${lang.policy2c2}</p></section>
            <section class="policy-item"><strong>3. ${lang.policy3t}</strong><p>${lang.policy3c1}${lang.policy3c2}</p></section>
            <section class="policy-item"><strong>4. ${lang.policy4t}</strong>
              <p>${lang.policy4c1}</p>
              <p>${lang.policy4c2}</p>
              <p>${lang.policy4c3}</p>
              <p>${lang.policy4c4}</p>
              <p>${lang.policy4c5}</p>
              <p>${lang.policy4c6}</p>
            </section>
            <ul>
              <li><a href="https://policies.google.com/technologies/ads" target="_blank">Google’s Privacy & Terms</a></li>
              <li><a href="https://policies.google.com/technologies/partner-sites" target="_blank">How Google uses data (Partner Sites)</a></li>
              <li><a href="https://policies.google.com/technologies/cookies" target="_blank">Google's cookie usage policy</a></li>
              <li><a href="https://support.google.com/adspolicy/answer/7475709" target="_blank">Google Ads Customer Data Policy</a></li>
            </ul>
        </div>
        <a href="/" class="back-link">← Back to Home</a>
    </div>
</div>
  `;
}
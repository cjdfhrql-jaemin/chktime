import { html } from 'hono/html'

// lang 데이터를 인자로 받아서 화면을 구성함
export default function Main({ data }: { data: any }) {
  return html`
<div id="home-view" class="animate-fade">
  <div class="card status-card">
    <p id="targetName" class="label">READY TO TRACK</p>
    <progress id="syncProgress" value="0" max="100"></progress>
  </div>
  <div class="input-group">
    <input type="text" id="targetUrl" placeholder="Domain (ex: google.com)" class="input-field">
    <button onclick="syncAll()" class="btn-primary">TRACK</button>
  </div>
  
  <div class="map-section">
    <div class="map-header"><span>Server Node</span><span id="geoCoords">Global Edge</span></div>
    <div id="map"></div>
    <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-1216027646063680" data-ad-slot="1972183174" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
    <div id="serverDetail" class="detail-text">Ready to track...</div>
  </div>
</div>
<script>
const MAP_CONFIG = { zoomLevel: 14, flyDuration: 1.5, initialZoom: 3 };
let map, marker, clockInterval = null, offset = 0;
let currentTimeZone = "${data.cf?.timezone || 'Asia/Seoul'}";
let clientTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
let currentDomain = null;

let WS = {
  open : function() {

    if(this.initialized) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const pbar = document.getElementById('syncProgress');
    return new Promise((resolve, reject) => {
      const webSocket = new WebSocket(protocol+":"+window.location.host+"/ws");

      webSocket.onopen = () => resolve(webSocket);
      webSocket.onerror = (err) => reject(err);
      webSocket.onclose = () => {
        pbar.style.display = 'none';
      }

    });

    this.webSocket.onclose = function() {
      this.initialized = false;
      pbar.style.display = 'none';
    }
  }
};

window.onload = function() { 
  initHome();
  startClock();
};

function initHome() {
  const mapEl = document.getElementById('map');
  if (!mapEl) return;
  map = L.map('map', { zoomControl: false, attributionControl: false }).setView([${data.userLat}, ${data.userLng}], MAP_CONFIG.initialZoom);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  const pulseIcon = L.divIcon({ className: 'pulse-icon', iconSize: [12, 12], iconAnchor: [6, 6] });
  marker = L.marker([${data.userLat}, ${data.userLng}], { icon: pulseIcon }).addTo(map);
  document.getElementById('targetUrl')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') syncAll(); });
}

function updateClock() {
  const popupClock = document.querySelector('.leaflet-popup-content #popup-clock');
  if (!popupClock) {
    return; 
  }
  
  const now = new Date(Date.now() + offset);
  const timeStr = new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false, timeZone: currentTimeZone
  }).format(now);
  const ms = Math.floor(now.getMilliseconds() / 100);
  popupClock.innerText = timeStr + "." + ms;
}

async function syncAll() {
  const urlInput = document.getElementById('targetUrl');
  const target = urlInput ? urlInput.value.trim() : "";
  if (!target || target.length < 3) {
    return;
  }

  try {

    const pbar = document.getElementById('syncProgress');
    const webSocket = await WS.open();
    pbar.style.display = 'block';

    webSocket.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === 'PROGRESS') {
        pbar.value = msg.value;
      }

      if(msg.status === 'DONE') {
        const btn = document.querySelector('.btn-primary');
        btn.innerText = 'TRACK';
        btn.disabled = false;

        webSocket.close();
      }
    };

    webSocket.send('READY');

    const waitForProgress = new Promise((resolve,reject) => {
      webSocket.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.type === 'PROGRESS') {
          pbar.value = msg.value;

          if (msg.status === 'DONE' || msg.value >= 100) {
            resolve(true);
          }
        }
      };

      // [중요] 소켓이 중간에 끊기면 무한 대기하지 않도록 처리
      webSocket.onerror = (err) => reject("WebSocket Error");
      webSocket.onclose = () => reject("WebSocket Closed");
    });

    try {
        await fetch(\`https://\${target}\`, { method: 'HEAD', mode: 'no-cors', signal: AbortSignal.timeout(500) });
    } catch (e) {
        webSocket.close();
        throw new Error("접속 불가");
    }

    const res = await fetch('/api/server-info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: target })
    });

    if (!res.ok) {
        webSocket.close();
        throw new Error();
    }

    await waitForProgress;
    const data = await res.json();

    marker.closePopup();
    marker.unbindPopup();

    offset = data.serverTime - Date.now();
    currentTimeZone = data.timezone;

    const newPos = [data.lat, data.lng];
    map.flyTo(newPos, MAP_CONFIG.zoomLevel, { duration: MAP_CONFIG.flyDuration });
    marker.setLatLng(newPos);

    const popupContent = \`
      <div class="popup-title">⏱ \${target.toUpperCase()}</div>
      <div id="popup-clock" class="popup-clock">00:00:00.0</div>
      <div class="popup-info">
        <strong>Server Location:</strong> \${data.city}, \${data.country}<br>
        <strong>Network Latency:</strong> \${data.rtt}ms<br>
        <strong>Latitude :</strong> \${data.lat.toFixed(4)}<br>
        <strong>Longitude:</strong> \${data.lng.toFixed(4)}<br>
      </div>
    \`;

    marker.bindPopup(popupContent, {
      closeOnClick: false,
      autoClose: false,
      closeButton: false
    }).openPopup();

    document.getElementById('targetName').innerHTML = 'TRACKING: <a href="https://'+target.toUpperCase()+'" target="_blank">' + target.toUpperCase() + '</a>';
    document.getElementById('geoCoords').innerText = data.city + ", " + data.country;
    document.getElementById('serverDetail').innerText = "[TARGET] " + target + " | [LOC] " + data.city;

    updateClock();
    currentDomain = target;

  } catch (e) {
    alert('Failed to track domain.');
  } finally {
  }
}

function startClock() {
  if (clockInterval) clearInterval(clockInterval);
  clockInterval = setInterval(updateClock, 100);
}
</script>
  `;
}
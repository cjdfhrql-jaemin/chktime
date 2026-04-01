import { html } from 'hono/html'

/** @jsx jsx */
import { jsx } from 'hono/jsx'

// 1. TS 타입 주석 제거
export const Main = ({ data }) => {

	return (
		<div id="home-view" class="animate-fade">
			<div class="card status-card">
				<p id="targetName" class="label">READY TO TRACK</p>
				<progress id="syncProgress" value="0" max="100" style="display:none;"></progress>
			</div>
			<div class="input-group">
				<input type="text" id="targetUrl" placeholder={`${data.lang.input}`} class="input-field" />
				<button onclick="syncAll()" class="btn-primary">TRACK</button>
			</div>

			<div class="map-section">
				<div class="map-header"><span>Server Node</span><span id="geoCoords">Global Edge</span></div>
				<div id="map"></div>
				<div id="serverDetail" class="detail-text">Ready to track...</div>
			</div>

			<article class="recent-searches">
				<h1>Recent Searches</h1>
				<ul>
					{data.results.map((result) => (
						<li>
							<div class="item">
								<a href={`#`}>{result.domain}</a>
								<span class="hit-count">{result.total_hit}</span>
							</div>
						</li>
					))}
				</ul>
			</article>

			<article style="display:none;">
				<h2>Articles</h2>
				<ul>
					<li>
						<div class="article-item">
							<div class="image">
								<img src="/assets/images/article1.jpg" onerror="this.style.background='var(--bg)'" alt="Article 1" />
							</div>
							<div class="content">
								<h3>Article 1</h3>
								<p>Article 1 description</p>
							</div>
						</div>
					</li>
					<li>
						<div class="article-item">
							<div class="image">
								<img src="/assets/images/article2.jpg" alt="Article 2" />
							</div>
							<div class="content">
								<h3>Article 2</h3>
								<p>Article 2 description</p>
							</div>
						</div>
					</li>
					<li>
						<div class="article-item">
							<div class="image">
								<img src="/assets/images/article3.jpg" alt="Article 3" />
							</div>
							<div class="content">
								<h3>Article 3</h3>
								<p>Article 3 description</p>
							</div>
						</div>
					</li>
					<li>
						<div class="article-item">
							<div class="image">
								<img src="/assets/images/article4.jpg" alt="Article 4" />
							</div>
							<div class="content">
								<h3>Article 4</h3>
								<p>Article 4 description</p>
							</div>
						</div>
					</li>
					<li>
						<div class="article-item">
							<div class="image">
								<img src="/assets/images/article5.jpg" alt="Article 5" />
							</div>
							<div class="content">
								<h3>Article 5</h3>
								<p>Article 5 description</p>
							</div>
						</div>
					</li>
					<li>
						<div class="article-item">
							<div class="image">
								<img src="/assets/images/article6.jpg" alt="Article 6" />
							</div>
							<div class="content">
								<h3>Article 6</h3>
								<p>Article 6 description</p>
							</div>
						</div>
					</li>
				</ul>
			</article>
			<div class="content-ad">
				<ins class="adsbygoogle"
					style="display:block"
					data-ad-client="ca-pub-1216027646063680"
					data-ad-slot="6774926052"
					data-ad-format="auto"
					data-full-width-responsive="true"></ins>
				
					<script
						dangerouslySetInnerHTML={{
							__html: `(adsbygoogle = window.adsbygoogle || []).push({});`
						}}
					/>
			</div>
			<script dangerouslySetInnerHTML={{
				__html: `

const $ = (selector) => {
    const el = document.querySelectorAll(selector);
    return {
        click: (callback) => el.forEach(v => v.addEventListener('click', callback)),
        addClass: (className) => el.forEach(v => v.classList.add(className)),
    };
};

const MAP_CONFIG = {zoomLevel: 14, flyDuration: 1.5, initialZoom: 3};
let map, marker, clockInterval = null, offset = 0;
let currentTimeZone = "${data.cf?.timezone || 'Asia/Seoul'}";
let clientTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
let currentDomain = null;

let WS = {
	initialized: false,
	open: function() {
		const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
		const pbar = document.getElementById('syncProgress');
		
		return new Promise((resolve, reject) => {
			const webSocket = new WebSocket(protocol + ":" + window.location.host + "/api/ws");

			webSocket.onopen = () => {
				this.initialized = true;
				resolve(webSocket);
			};
			webSocket.onerror = (err) => reject(err);
			webSocket.onclose = () => {
				this.initialized = false;
				pbar.style.display = 'none';
			};
		});
	}
};

window.onload = function() {
	initHome();
	startClock();

	$('.item').click(function(e) {
		const href = this.querySelector('a').textContent;
		const _targetUrl = document.getElementById('targetUrl');
		if (_targetUrl && href) {
			_targetUrl.value = href;
		}
	
		syncAll(href);
		window.scrollTo(0,0);

		e.preventDefault();
		return false;
	});
};

function initHome() {
	const mapEl = document.getElementById('map');
	if (!mapEl) {
		return;
	}

	// 서버에서 넘겨받은 초기 좌표 설정
	map = L.map('map', {zoomControl: false, attributionControl: false, attributionControl: true })
	.setView([${data.userLat}, ${data.userLng}], MAP_CONFIG.initialZoom);

	L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

	map.attributionControl.setPrefix('Measured by <b>CHKTIME.COM</b> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> & <a href="https://carto.com/attributions">CARTO</a>');

	const pulseIcon = L.divIcon({className: 'pulse-icon', iconSize: [12, 12], iconAnchor: [6, 6] });
	marker = L.marker([${data.userLat}, ${data.userLng}], {icon: pulseIcon }).addTo(map);
	
	document.getElementById('targetUrl')?.addEventListener('keypress', (e) => { 
		if (e.key === 'Enter') {
			syncAll(); 
		}
	});
}

const timeFormatter = new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: false, 
    timeZone: 'Asia/Seoul'
});

function updateClock() {
	const popupClock = document.querySelector('.leaflet-popup-content #popup-clock');
	if (!popupClock) {
		return;
	}

	// 현재 보정된 서버 시간(ms) 계산
	const nowMs = Date.now() + offset;
	const now = new Date(nowMs);

	// 재사용 포맷터로 시간 문자열 생성
	const timeStr = timeFormatter.format(now);

    // 밀리초 한 자릿수 계산 (0~9)
    // 1000으로 나눈 나머지에서 첫 번째 자리만 추출
    const ms = Math.floor((nowMs % 1000) / 100);
    popupClock.innerText = \`\${timeStr}.\${ms}\`;
}

let syncInProgress = false;
async function syncAll(url) {
	if (syncInProgress) {
		alert('Sync in progress. Please wait.');
		return;
	}
	
	syncInProgress = true;
	
	const urlInput = document.getElementById('targetUrl');
	const target = url || (urlInput ? urlInput.value.trim() : "");
	if (!target || target.length < 3) {
		return;
	}

	const btn = document.querySelector('.btn-primary');
	const pbar = document.getElementById('syncProgress');

	try {
		pbar.style.display = 'block';
		pbar.value = 0;

		btn.disabled = true;
		btn.innerText = 'WAIT...';

		const webSocket = await WS.open();

		// 1. 프로그레스바 처리를 위한 Promise (DONE 신호 대기)
		const waitForProgress = new Promise((resolve, reject) => {
			webSocket.onmessage = (e) => {
				const msg = JSON.parse(e.data);
				if (msg.type === 'PROGRESS') {
					pbar.value = msg.value;
					if (msg.status === 'DONE' || msg.value >= 100) {
						resolve(true);
					}
				}
			};
			webSocket.onerror = () => reject("WebSocket Error");
			webSocket.onclose = () => reject("WebSocket Closed");
		});

		// 2. 서버 정보 패치 (지연 시간 측정 시작)
		webSocket.send('READY');

		const startTime = Date.now();
		const res = await fetch('/api/server-info', {
			method: 'POST',
			headers: {'Content-Type': 'application/json' },
			body: JSON.stringify({url: target })
		});

		const endTime = Date.now();
		const rtt = endTime - startTime;

		if (!res.ok) {
			throw new Error("Fetch Failed");
		}

		const data = await res.json();

		if (data.precision === "ms_calibrated") {
			const serverMs = new Date(data.dateHeader).getTime() + data.milliseconds;
			offset = serverMs - endTime;
		}

		// 애니메이션(프로그레스바) 완료될 때까지 대기
		await waitForProgress;
		webSocket.close();

		// 4. 지도 업데이트
		marker.closePopup();
		marker.unbindPopup();
		currentTimeZone = data.timezone;

		const newPos = [data.lat, data.lng];
		map.flyTo(newPos, MAP_CONFIG.zoomLevel, {duration: MAP_CONFIG.flyDuration });
		marker.setLatLng(newPos);

		const popupContent = \`
		<div class="popup-title">⏱ \${target.toUpperCase()}</div>
		<div id="popup-clock" class="popup-clock">00:00:00.0</div>
		<div class="popup-info">
			<strong>Location:</strong> \${data.city}, \${data.country}<br />
			<strong>RTT:</strong> \${rtt}ms<br />
			<strong>Coords:</strong> \${data.lat.toFixed(4)}, \${data.lng.toFixed(4)}
		</div>
		\`;

		marker.bindPopup(popupContent, {
			closeOnClick: false, autoClose: false, closeButton: false
		}).openPopup();

		document.getElementById('targetName').innerHTML = 'TRACKING: ' + target.toUpperCase();
		document.getElementById('geoCoords').innerText = data.city + ", " + data.country;

		updateClock();

		btn.innerText = 'TRACK';
		btn.disabled = false;
		syncInProgress = false;

	} catch (e) {
		alert('Failed to track domain.');
		btn.disabled = false;
		btn.innerText = 'TRACK';
		syncInProgress = false;
	}
}

function startClock() {
	if (clockInterval) {
		clearInterval(clockInterval);
	}
	
	clockInterval = setInterval(updateClock, 100);
}


`}} />
		</div >
	);
}
export default Main;
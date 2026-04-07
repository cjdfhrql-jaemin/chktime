/** @jsx jsx */
import { jsx } from 'hono/jsx'

import { Head } from './head.jsx'
import { Footer } from './footer.jsx'

// 2. 인자로 title과 children을 받아야 함
export const Layout = ({ title, children }) => {
	return (
		<html lang="ko">
			<Head title={title} />
			<body>
				<div class="brand" style={{ cursor: 'pointer' }} onclick="location.href='/'">
					CHKTIME<span>.COM</span>
				</div>

				<div class="left-side side-ad">
					<ins class="adsbygoogle"
						style="display:block"
						data-ad-client="ca-pub-1216027646063680"
						data-ad-slot="5535756764"
						data-ad-format="auto"
						data-full-width-responsive="true"></ins>
					<script
						dangerouslySetInnerHTML={{
							__html: `(adsbygoogle = window.adsbygoogle || []).push({});`
						}}
					/>
				</div>

				<div class="right-side side-ad">
					<ins class="adsbygoogle"
						style="display:block"
						data-ad-client="ca-pub-1216027646063680"
						data-ad-slot="8572983644"
						data-ad-format="auto"
						data-full-width-responsive="true"></ins>
					<script
						dangerouslySetInnerHTML={{
							__html: `(adsbygoogle = window.adsbygoogle || []).push({});`
						}}
					/>
				</div>

				<main id="app" class="container">
					{children} {/* props.children이 아니라 인자로 받은 children 사용 */}
				</main>
				
				<Footer />
			</body>
		</html>
	);
};
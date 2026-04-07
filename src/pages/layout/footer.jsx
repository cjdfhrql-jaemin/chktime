/** @jsx jsx */
import { jsx, Fragment } from 'hono/jsx'

export const Footer = () => (
	<footer class="footer" role="contentinfo">
		<div class="copy">© 2026 CHKTIME.COM Built with <a href="https://cloudflare.com" target="_blank">cloudflare.com</a></div>
		<ul>
			<li><a href="/footer/about" class="footer-link">About</a></li>
			<li><a href="/footer/terms" class="footer-link">Terms of Service</a></li>
			<li><a href="/footer/policy" class="footer-link">Privacy Policy</a></li>
		</ul>
	</footer>
);
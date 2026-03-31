import languages from './languages.json'

export function getLanguage(cf) {

	const originalTexts = {
		// About Section
		"about1": "We provide the most precise and fastest server time measurement service globally through the Cloudflare Edge Network. Experience accurate networking insights without a single millisecond of error.",
		"about2": "We do not store user access logs; our sole focus is on providing real-time time synchronization data. It is a transparent, privacy-first standard time tool for developers and power users.",

		// Terms of Service
		"terms1t": "Purpose",
		"terms1c": "These terms govern the use of the IP lookup and network information services provided by CHKTIME.COM (hereinafter 'the Service').",
		"terms2t": "Nature of Service & Disclaimer",
		"terms2c": "This service provides real-time public IP addresses and network data. While we strive for accuracy, this data is based on third-party databases and may not reflect 100% accuracy or actual physical locations. The Service is provided 'as is' without any warranties.",
		"terms3t": "Prohibited Use",
		"terms3c1": "Users agree not to engage in the following activities:",
		"terms3c2": "Performing excessive queries using automated scripts or bots that overload the infrastructure.",
		"terms3c3": "Using the Service for malicious activities, including unauthorized network scanning or cyberattacks.",
		"terms4t": "Data Privacy",
		"terms4c": "Temporary access logs, such as IP addresses, may be processed for security and service optimization. All data processing complies with our Privacy Policy and relevant data protection laws.",
		"terms5t": "Limitation of Liability",
		"terms5c": "CHKTIME.COM shall not be liable for any damages arising from the use or inability to use the Service, including inaccuracies in information or temporary service interruptions.",

		// Privacy Policy
		"policy1t": "Overview",
		"policy1c": "CHKTIME.COM (hereinafter \"the Company\") prioritizes your privacy. We do not collect, store, or share any personal information of our users.",
		"policy2t": "Data Collection and Use",
		"policy2c1": "We do not request or collect any personal information, such as name, email, or contact details, when you visit the website.",
		"policy2c2": "Your IP address is processed in real-time solely for server time synchronization and physical location verification, and is discarded immediately after use.",
		"policy3t": "Data Storage and Third-Party Provision",
		"policy3c1": "We do not store user activity logs or records. Since no data is collected, we do not sell or provide any information to third parties.",
		"policy3c2": "We utilize Cloudflare infrastructure solely for security and performance acceleration purposes.",
		"policy4t": "Cookies and Third-Party Advertising",
		"policy4c1": "To provide a better user experience and maintain the service, we use the following third-party services:",
		"policy4c2": "Google AdSense & Cookies: Third-party providers, including Google, use cookies to serve ads based on a user's prior visits.",
		"policy4c3": "Google's use of advertising cookies enables it and its partners to serve ads based on your visit to this site and/or other sites on the Internet. Users may opt-out of personalized advertising by visiting Ads Settings.",
		"policy4c4": "Google Analytics (GA4): We use cookies that analyze anonymous traffic data to improve the service. These cookies do not identify you personally.",
		"policy4c5": "Service Cookies: This service may use technical cookies (e.g., hit_) to prevent duplicate views and optimize server load. These do not contain personally identifiable information.",
		"policy4c6": "For more information on how Google uses data, please visit the Google Privacy & Terms site."
	};

	const countryMap = {
		'KR': 'korean',
		'JP': 'japanese',
		'CN': 'chinese',
		'TW': 'chinese',
		'FR': 'french',
		'DE': 'german',
		'ES': 'spanish',
		'MX': 'spanish',
		'IT': 'italian',
		'PT': 'portuguese',
		'BR': 'portuguese',
		'RU': 'russian',
		'VN': 'vietnamese',
		'TH': 'thai',
		'ID': 'indonesian',
		'TR': 'turkish',
		'SA': 'arabic',
		'AE': 'arabic'
	};

	const countryCode = typeof cf === 'string' ? cf : (cf?.country || 'US');
	const targetLangName = countryMap[countryCode] || "english";
	const lang = languages[targetLangName] || languages["english"];
	return lang;
}
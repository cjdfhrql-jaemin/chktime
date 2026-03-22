import languages from './languages.json'

export function getLanguage(cf:any) {
      
  const originalTexts = {
    desc1_1: "CHKIP.ORG is built on Cloudflare Workers edge computing technology, operating without traditional web servers or physical source files. ",
    desc1_2: "All requests are processed in real-time at over 300 global data centers closest to the user.",
    desc2_1: "As a V8-based serverless runtime, it executes JavaScript at the Edge before requests even reach the origin server.",
    desc2_2: "This architecture ensures near-zero latency and robust security simultaneously.",
    desc3_1: "The service operates with less than 1KB of runtime overhead by minimizing unnecessary resource loading. ",
    desc3_2: "Users can verify their IPv4/IPv6 status and geographic location through the most reliable network path.",
    about: "Built to deliver your network insights in the purest and fastest way possible. We leverage Cloudflare's edge network to ensure low-latency performance worldwide. We store no logs—focusing solely on providing you with real-time connectivity data. Our mission is to provide developers and power users with transparent, privacy-first networking tools they can trust.",
    terms1t: "Purpose",
    terms1c: "These Terms govern the use of the IP lookup and network information services provided by CHKIP.ORG (\"the Service\").",
    terms2t: "Service Nature & Disclaimer",
    terms2c: "The Service provides real-time public IP addresses and network data. While we strive for precision, this data is based on third-party databases and may not always reflect 100% accuracy or current physical locations. The Service is provided \"as-is\" without any warranties.",
    terms3t: "Prohibited Use",
    terms3c1: "Users agree not to:",
    terms3c2: "Use automated scripts or bots to perform excessive queries that strain our infrastructure.",
    terms3c3: "Use the Service for malicious activities, including unauthorized network scanning or cyberattacks.",
    terms4t: "Data Privacy",
    terms4c: "Temporary connection logs (such as IP addresses) may be processed for security and service optimization. All data handling complies with our Privacy Policy and relevant data protection laws.",
    terms5t: "Limitation of Liability",
    terms5c: "CHKIP.ORG shall not be liable for any damages arising from the use or inability to use the Service, including inaccuracies in the information provided or temporary service interruptions.",
    policy1t: "Commitment to Privacy",
    policy1c1: "chkip.org believes that checking an IP should not come at the cost of your privacy.",
    policy1c2: "Our core principle is simple: We show it, but we never keep it.",
    policy2t: "Data Processing & 'Zero-Log' Policy",
    policy2c1: "We minimize data processing to the absolute necessity required for our service to function:",
    policy2c2: "In-Memory Processing: Your IP address and location data are processed exclusively within volatile memory (RAM). This information is used solely to display real-time results and is purged immediately after the session.",
    policy2c3: "No Persistent Storage: We do not record, log, or store your IP address or any identifiable data on server hard drives or databases.",
    policy3t: "Cookies and Third-Party Advertising",
    policy3c1: "To provide a better user experience and sustain our service, we use the following third-party services:",
    policy3c2: "Google AdSense & Cookies: * Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to your website or other websites.",
    policy3c3: "Google's use of advertising cookies (such as the DoubleClick cookie) enables it and its partners to serve ads to your users based on their visit to your sites and/or other sites on the Internet.",
    policy3c4: "Users may opt-out of personalized advertising by visiting Ads Settings.",
    policy3c5: "Google Analytics (GA4): We use cookies to analyze anonymous traffic data to improve our service. These cookies do not identify you personally.",
    policy3c6: "For more information on how Google uses data, please visit",
    policy4t: "Contact Us",
    policy4c: "For any questions regarding this policy, please contact us at ljmsp83@naver.com."
  };

  const countryMap: Record<string, string> = {
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
    'IN': 'hindi',
    'VN': 'vietnamese',
    'TH': 'thai',
    'ID': 'indonesian',
    'TR': 'turkish',
    'PL': 'polish',
    'SA': 'arabic',
    'AE': 'arabic'
  };

  const countryCode = typeof cf === 'string' ? cf : (cf?.country || 'US');
  const targetLangName = countryMap[countryCode] || "english";
  const language = (languages as any);
  const lang = language[targetLangName] || language["english"];
  return lang;
}
export const prettyHtml = async (html) => {
	
	// HTML 응답이고 성공했을 때만 가공
	if (html) {
		// [정석적인 가공 로직]
		let indent = 0;
		const tab = '  ';
		const prettified = html
			.replace(/(>)(<)(\/*)/g, '$1\n$2$3')
			.split('\n')
			.map(line => {
				line = line.trim();
				if (!line) return null;
				if (line.match(/^<\//)) indent--;
				const padding = tab.repeat(Math.max(0, indent));
				if (line.match(/^<[^/!][^>]*[^/]>$/) && !line.match(/<\/.+>/)) indent++;
				return padding + line;
			})
			.filter(Boolean)
			.join('\n');

		// 새로운 응답 객체로 교체 (기존 헤더/상태코드 유지)
		return prettified;
	}
};
const fs = require('fs');
const freetype = require('@julusian/freetype2');

interface GrafikkFontFace {
	[key: string]: any
}

export default class GrafikkFont {

	private face: GrafikkFontFace = {
		size: 14
	}

	private memoryface: any

	constructor(fontPath: string, fontFaceOptions: GrafikkFontFace = {}) {
		this.face = {
			...this.face,
			...fontFaceOptions,
		}
		this.memoryface = freetype.NewMemoryFace(fs.readFileSync(fontPath));
		// Give it some size

	}

	renderString(text: string) {
		return this.charCodes(text).map(code => this.glyph(code))
	}

	size(pixelSize: number) {
		this.memoryface.setPixelSizes(0, this.face.size = pixelSize)
	}

	charCodes(textString: string) {
		return textString.split('').map(c => c.charCodeAt(0))
	}

	glyph(charCode: number) {
		const glyph = this.memoryface.loadChar(charCode, {
			render: true,
			loadTarget: freetype.RenderMode.MONO
		});
		return glyph
	}

}



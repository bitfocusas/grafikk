const fs = require("fs")
const freetype = require('@julusian/freetype2')

import Grafikk, { GrafikkColorRGB } from './Grafikk'

export interface GrafikkFontFace {
	[key: string]: any;
}

export interface GrafikkFontGlyph {
	[key: string]: any;
}

export interface GrafikkFontGlyph {
	bitmap: GrafikkFontGlyphBitmap;
}

export interface GrafikkFontGlyphBitmap {
	width: number;
	height: number;
	pitch: number;
	pixelMode: number;
	numGrays?: null;
	buffer: Buffer;
	bitmapLeft: number;
	bitmapTop: number;
	metrics: GrafikkFontGlyphMetrics;
	format: number;
	lsbDelta: number;
	rsbDelta: number;
}

export interface GrafikkFontGlyphMetrics {
	isFontUnits: boolean;
	width: number;
	height: number;
	horiBearingX: number;
	horiBearingY: number;
	horiAdvance: number;
	vertBearingX: number;
	vertBearingY: number;
	vertAdvance: number;
}




export default class GrafikkFont {

	private face: GrafikkFontFace = {
		size: 14
	}

	private memoryface: any
	private fontPath: string
	private grafikk: Grafikk

	constructor(grafikk: Grafikk, fontPath: string, fontFaceOptions: GrafikkFontFace = {}) {
		this.face = {
			...this.face,
			...fontFaceOptions,
		}
		this.grafikk = grafikk
		this.setFace(fontPath)

		this.setSize(this.face.size)

	}

	setFace(fontPath: string) {
		this.fontPath = fontPath
		this.memoryface = freetype.NewMemoryFace(fs.readFileSync(this.fontPath));
	}

	charCodes(textString: string) {
		return textString.split('').map(c => c.charCodeAt(0))
	}

	glyphsFromString(text: string) {
		return this.charCodes(text).map(code => this.glyph(code))
	}

	glyphsWidth(glyphs: Array<GrafikkFontGlyph>): number {
		let width = glyphs.reduce((val, obj) => val + obj.bitmap.width, 0)
		return <number>width
	}

	setSize(pixelSize: number) {
		this.face.size = pixelSize
		this.memoryface.setPixelSizes(0, pixelSize)
	}

	glyphDraw(glyph: any, _fromX: number, _fromY: number, color: GrafikkColorRGB) {
		let i = 0;
		for (let y = 0; y < glyph.bitmap.height; ++y) {
			for (let x = 0; x < glyph.bitmap.width; ++x) {
				let shouldDraw: boolean = (glyph.bitmap.buffer[i + Math.floor(x/8)] & (1 << (7-(x % 8)))) > 0

				if (shouldDraw) {
					this.grafikk.drawPixel(
						_fromX + x,
						_fromY + y,
						color
					)
				}
			}
			i += glyph.bitmap.pitch
		}
	}

	glyphDrawFromNormal(glyph: any, _fromX: number, _fromY: number, color: GrafikkColorRGB) {
		let i = 0;
		for (let y = 0; y < glyph.bitmap.height; ++y) {
			for (let x = 0; x < glyph.bitmap.width; ++x) {
				let shouldDraw: boolean = (glyph.bitmap.buffer[i++] > 127)

				if (shouldDraw) {
					this.grafikk.drawPixel(
						_fromX + x,
						_fromY + y,
						color
					)
				}
			}
		}
	}

	centerTextBox(
		fromXpercent: number,
		fromYpercent: number,
		_toXpercent: number,
		_toYpercent: number,
		size: number,
		text: string,
		color: GrafikkColorRGB,
	): void {

		const fromX = Math.floor(this.grafikk.outputSpecification.pixelsW / 100 * fromXpercent)
		const fromY = Math.floor(this.grafikk.outputSpecification.pixelsH / 100 * fromYpercent)
		//const toX = Math.floor(this.grafikk.outputSpecification.pixelsW / 100 * toXpercent)
		//const toY = Math.floor(this.grafikk.outputSpecification.pixelsH / 100 * toYpercent)

		this.setSize(size)

		const glyphs = this.glyphsFromString(text)

		let posX = fromX
		glyphs.forEach(glyph => {
			if (glyph.bitmap !== null) {
				this.glyphDraw(glyph, posX + glyph.bitmapLeft, fromY - glyph.bitmapTop, color)
				posX += glyph.bitmap.width + glyph.bitmapLeft
			}
		})

	}

	glyph(charCode: number): GrafikkFontGlyph {
		const glyph = this.memoryface.loadChar(charCode, {
			render: true,
			loadTarget: freetype.RenderMode.MONO
		});
		return glyph
	}

}



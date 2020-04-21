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

	glyphDraw(glyph: any, fromX: number, fromY: number, color: GrafikkColorRGB) {
		let i = 0;
		for (let y = 0; y < glyph.bitmap.height; ++y) {
			for (let x = 0; x < glyph.bitmap.width; ++x) {
				let shouldDraw: boolean = (glyph.bitmap.buffer[i + Math.floor(x/8)] & (1 << (7-(x % 8)))) > 0

				if (shouldDraw) {
					this.grafikk.drawPixel(
						fromX + x,
						fromY + y,
						color
					)
				}
			}
			i += glyph.bitmap.pitch
		}
	}

	glyphDrawFromNormal(glyph: any, fromX: number, fromY: number, color: GrafikkColorRGB) {
		let i = 0;
		for (let y = 0; y < glyph.bitmap.height; ++y) {
			for (let x = 0; x < glyph.bitmap.width; ++x) {
				let shouldDraw: boolean = (glyph.bitmap.buffer[i++] > 127)
				if (shouldDraw) {
					this.grafikk.drawPixel(
						fromX + x,
						fromY + y,
						color
					)
				}
			}
		}
	}

	centerTextBox(
		fromXpercent: number,
		fromYpercent: number,
		toXpercent: number,
		toYpercent: number,
		size: number,
		text: string,
		color: GrafikkColorRGB,
		background: GrafikkColorRGB,

		): void {

		const fromX = Math.round(this.grafikk.outputSpecification.pixelsW / 100 * fromXpercent)
		const fromY = Math.round(this.grafikk.outputSpecification.pixelsH / 100 * fromYpercent)
		const toX = Math.round(this.grafikk.outputSpecification.pixelsW / 100 * toXpercent)
		const toY = Math.round(this.grafikk.outputSpecification.pixelsH / 100 * toYpercent)

		if (!this.grafikk.outputSpecification.mono) {
			for (let y = fromY; y <= toY; y++) {
				for (let x = fromX; x <= toX; x++) {
					this.grafikk.drawPixel(x,y,background)
				}
			}
		}

		this.setSize(size)

		const glyphs = this.glyphsFromString(text)

		this.grafikk.drawHorizontalLine( fromX, { r: 255, g: 255, b: 255 })
		this.grafikk.drawHorizontalLine( toX, { r: 255, g: 255, b: 255 })
		this.grafikk.drawVerticalLine( fromY, { r: 255, g: 255, b: 255 })
		this.grafikk.drawVerticalLine( toY, { r: 255, g: 255, b: 255 })

		let posX = fromX

		glyphs.forEach(glyph => {
			if (glyph.bitmap !== null) {
				this.glyphDraw(glyph,
					posX + glyph.bitmapLeft + 1, 
					fromY - glyph.bitmapTop + (this.face.size/10*8) - 1, 
					color
				)
				posX += glyph.bitmap.width + glyph.bitmapLeft + Math.round(this.face.size / 20)
			} else {
				posX += Math.round(this.face.size / 4)
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



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

export const GrafikkFontAlign = {
	TOP_LEFT: 1,
	TOP_CENTER: 2,
	TOP_RIGHT: 3,
	MIDDLE_LEFT: 4,
	MIDDLE_CENTER: 5,
	MIDDLE_RIGHT: 6,
	BOTTOM_LEFT: 7,
	BOTTOM_CENTER: 8,
	BOTTOM_RIGHT: 9
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
	private fontPath: any
	private grafikk: Grafikk
	private spaceFontSizeDividedBy: number = 4

	constructor(
		grafikk: Grafikk, 
		fontPath: any, 
		fontFaceOptions: GrafikkFontFace = {}
	) {
		this.face = {
			...this.face,
			...fontFaceOptions,
		}
		this.grafikk = grafikk
		this.setFace(fontPath)

		this.setSize(this.face.size)

	}

	setFace(
		fontPath: string
	) {
		this.fontPath = fontPath
		this.memoryface = freetype.NewFace(this.fontPath)
	}

	charCodes(
		textString: string
	) {
		return textString.split('').map(c => c.charCodeAt(0))
	}

	glyphsFromString(
		text: string
	) {
		return this.charCodes(text).map(code => this.glyph(code))
	}

	glyphsWidth(
		glyphs: Array<GrafikkFontGlyph>
	): number {
		// simple way of calculating width, but this doesn't count spaces etc.
		//let width = glyphs.reduce((val, obj) => val + obj.bitmap.width, 0)	
		
		// let's do the same thing we do when we render text
		let posX = 0;
		glyphs.forEach(glyph => {
			if (glyph.bitmap !== null) {
				posX += glyph.bitmap.width + glyph.bitmapLeft + Math.round(this.face.size / 20)
			} else {
				posX += Math.round(this.face.size / this.spaceFontSizeDividedBy)
			}
		})

		return <number>posX
	}

	setSize(
		pixelSize: number
	) {
		this.face.size = pixelSize
		this.face.safety = this.face.size / 2.8
		this.memoryface.setPixelSizes(0, pixelSize)
	}

	glyphsDraw(
		glyphs: Array<GrafikkFontGlyph>, 
		fromX: number, 
		fromY: number, 
		toX: number, 
		toY: number, 
		color: GrafikkColorRGB,
		alignment: number,
	) {
		
		let glyphWidth = this.glyphsWidth(glyphs)

		// Vertical align

		// Top
		let posY = fromY + 1

		// Middle
		if (
			alignment === GrafikkFontAlign.MIDDLE_LEFT || 
			alignment === GrafikkFontAlign.MIDDLE_CENTER || 
			alignment === GrafikkFontAlign.MIDDLE_RIGHT
		) {
			posY = fromY + ((toY-fromY)/2) - (this.face.size / 2)
		}

		// Bottom
		else if (
			alignment === GrafikkFontAlign.BOTTOM_LEFT || 
			alignment === GrafikkFontAlign.BOTTOM_CENTER || 
			alignment === GrafikkFontAlign.BOTTOM_RIGHT
		) {
			posY = toY - this.face.size + (this.grafikk.outputSpecification.pixelsH > 32 ? 2 : 0)
		}
		
		// Horizontal align

		// Left
		let posX = fromX + (this.face.safety/2)

		// Center
		if (
			alignment === GrafikkFontAlign.BOTTOM_CENTER || 
			alignment === GrafikkFontAlign.MIDDLE_CENTER || 
			alignment === GrafikkFontAlign.TOP_CENTER
		) {
			posX = fromX + ((toX-fromX)/2) - (glyphWidth/2)
		}
	
		else if (
			alignment === GrafikkFontAlign.BOTTOM_RIGHT || 
			alignment === GrafikkFontAlign.MIDDLE_RIGHT || 
			alignment === GrafikkFontAlign.TOP_RIGHT
		) {
			posX = toX - glyphWidth - (this.face.safety/4)
		}

		glyphs.forEach(glyph => {
			if (glyph.bitmap !== null) {
				this.glyphDraw(glyph,
					posX + glyph.bitmapLeft + 1, 
					posY - glyph.bitmapTop + (this.face.size/10*8) - 1, 
					color
				)
				posX += glyph.bitmap.width + glyph.bitmapLeft + Math.round(this.face.size / 20)
			} else {
				posX += Math.round(this.face.size / this.spaceFontSizeDividedBy)
			}
		})
	}

	glyphDraw(
		glyph: any, 
		fromX: number, 
		fromY: number, 
		color: GrafikkColorRGB
	) {
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

	glyphDrawFromNormal(
		glyph: any, 
		fromX: number, 
		fromY: number, 
		color: GrafikkColorRGB
	) {
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
		alignment: number,
	): void {

		// Guide lines for debug
		const fromX = Math.round(this.grafikk.outputSpecification.pixelsW / 100 * fromXpercent)
		const fromY = Math.round(this.grafikk.outputSpecification.pixelsH / 100 * fromYpercent)
		const toX = Math.round(this.grafikk.outputSpecification.pixelsW / 100 * toXpercent)
		const toY = Math.round(this.grafikk.outputSpecification.pixelsH / 100 * toYpercent)

		// Find the box size in pixels
		const availableWidth = toX - fromX
		const availableHeight = toY - fromY

		// Background fill
		if (!this.grafikk.outputSpecification.mono) {
			for (let y = fromY; y <= toY; y++) {
				for (let x = fromX; x <= toX; x++) {
					this.grafikk.drawPixel(x, y, background)
				}
			}
		}
		else {
			for (let y = fromY; y < toY; y++) {
				for (let x = fromX; x < toX; x++) {
					this.grafikk.drawMonoPixel(x,y,!background)
				}
			}
		}
		this.setSize(size)

		let glyphs = this.glyphsFromString(text)
		const currentSize = this.face.size
		const currentWidth = this.glyphsWidth(glyphs)

		// If the text exceeds the box, scale the font size down!
		if (availableWidth < currentWidth || availableHeight < currentSize) {

			const calculatedScale = (availableWidth-this.face.safety) / currentWidth
			let calculatedFontSize = currentSize * calculatedScale

			if (calculatedFontSize > availableHeight) {
				calculatedFontSize = availableHeight
			}

			if (calculatedFontSize >= 11) { 
				this.setSize(calculatedFontSize) 
			}
			else {
				this.setSize(11)
				if (alignment === GrafikkFontAlign.BOTTOM_CENTER) alignment = GrafikkFontAlign.BOTTOM_LEFT
				else if (alignment === GrafikkFontAlign.MIDDLE_CENTER) alignment = GrafikkFontAlign.MIDDLE_LEFT
				else if (alignment === GrafikkFontAlign.TOP_CENTER) alignment = GrafikkFontAlign.TOP_LEFT				
			}
			glyphs = this.glyphsFromString(text)				
		}




		/*
		this.grafikk.drawHorizontalLinePercent( fromYpercent, { r: 255, g: 255, b: 255 })
		this.grafikk.drawHorizontalLinePercent( toYpercent, { r: 255, g: 255, b: 255 })
		this.grafikk.drawVerticalLinePercent( fromXpercent, { r: 255, g: 255, b: 255 })
		this.grafikk.drawVerticalLinePercent( toXpercent, { r: 255, g: 255, b: 255 })
		*/
		
		this.glyphsDraw(glyphs, fromX - 2, fromY, toX, toY, color, alignment)

	}

	glyph(
		charCode: number
	): GrafikkFontGlyph {
		const glyph = this.memoryface.loadChar(charCode, {
			render: true,
			loadTarget: freetype.RenderMode.MONO
		});
		return glyph
	}

}



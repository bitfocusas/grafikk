interface GrafikkInputSpecification {
	text: string | null,
}

interface GrafikkOutput {
	error: string | null,
	buffer: null | Buffer,
}

interface GrafikkColorRGB {
	r: number,
	g: number,
	b: number,
}

interface GrafikkOutputSpecification {
	id: string | undefined,
	physicalW: number,
	physicalH: number,
	pixelsW: number,
	pixelsH: number,
	mono: boolean | undefined,
}

import Debug from 'debug';

const debug = Debug('Grafikk:main');

debug("hehe");


export default class Grafikk {

	private inputSpecification: GrafikkInputSpecification = { text: null }
	private outputBuffer: Buffer
	private outputSpecification: GrafikkOutputSpecification = {
		id: undefined,
		physicalW: 64,
		physicalH: 64,
		pixelsW: 10,
		pixelsH: 10,
		mono: false,
	}

	private outputCallback: (outputResult: GrafikkOutput) => void

	constructor(outputSpecification: GrafikkOutputSpecification, outputCallback: (outputResult: GrafikkOutput) => void) {
		this.outputSpecification = {
			...this.outputSpecification,
			...outputSpecification
		}
		this.outputBufferAllocate()
		this.outputCallback = outputCallback
	}

	outputBufferAllocate() {
		if (this.outputSpecification.mono) {
			this.outputBuffer = Buffer.alloc((
				this.outputSpecification.pixelsW
				*
				this.outputSpecification.pixelsH
			) / 8
			)
		}
		else {
			this.outputBuffer = Buffer.alloc(
				(
					this.outputSpecification.pixelsW * 3
				) * (
					this.outputSpecification.pixelsH * 3
				)
			)
		}
	}

	// Clear the canvas
	outputBufferClear() {
		this.outputBuffer.fill(0)
	}

	drawMonoPixel(x: number, y: number, color: boolean) {
		let was = this.outputBuffer.readUInt8(Math.floor(x / 8) + (y * Math.floor(this.outputSpecification.pixelsW / 8)))
		let bit = 1 << (7 - (x % 8));
		if (color) {
			this.outputBuffer.writeUInt8(was | bit, Math.floor(x / 8) + (y * Math.floor(this.outputSpecification.pixelsW / 8)));
		} else {
			this.outputBuffer.writeUInt8(was & ~bit, Math.floor(x / 8) + (y * Math.floor(this.outputSpecification.pixelsW / 8)));
		}
	}

	drawRGBPixel(x: number, y: number, color: GrafikkColorRGB) {
		let pos = x * y * 3
		this.outputBuffer.writeUInt8(color.r, pos + 0)
		this.outputBuffer.writeUInt8(color.g, pos + 1)
		this.outputBuffer.writeUInt8(color.b, pos + 2)
	}

	drawPixel(x: number, y: number, color: boolean | GrafikkColorRGB) {
		if (typeof color !== 'boolean' && this.outputSpecification.mono) {
			this.drawMonoPixel(x, y, color.r * color.g * color.b > 0)
		}
		else if (this.outputSpecification.mono) {
			this.drawMonoPixel(x, y, !!color)
		}
		else if (typeof color === 'boolean') {
			this.drawRGBPixel(x, y, <GrafikkColorRGB>{
				r: color ? 255 : 0,
				g: color ? 255 : 0,
				b: color ? 255 : 0
			})
		}
		else {
			this.drawRGBPixel(x, y, <GrafikkColorRGB>color)
		}
	}

	drawVerticalLine(y: number, color: boolean | GrafikkColorRGB) {
		for (var x = 0; x < this.outputSpecification.pixelsW; x++) {
			this.drawPixel(x, y, color)
		}
	}

	drawHorizontalLine(x: number, color: boolean | GrafikkColorRGB) {
		for (var y = 0; y < this.outputSpecification.pixelsH; y++) {
			this.drawPixel(x, y, color)
		}
	}

	generate(inputSpecification: GrafikkInputSpecification) {

		this.outputBufferClear()

		this.inputSpecification = {
			...this.inputSpecification,
			...inputSpecification
		}

		const outputResult: GrafikkOutput = {
			error: null,
			buffer: this.outputBuffer
		}

		this.drawVerticalLine(30, true)

		if (this.outputSpecification.id === 'streamdeckNormal') {
			//console.log("x", outputResult)
		}
		this.outputCallback(outputResult)

	}


}

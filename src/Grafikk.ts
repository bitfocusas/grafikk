import GrafikkFont from './GrafikkFont'

export interface GrafikkInputSpecification {
	text: string;
}

export interface GrafikkOutput {
	error: string | null;
	buffer: null | Buffer;
}

export interface GrafikkColorRGB {
	r: number;
	g: number;
	b: number;
}

export interface GrafikkOutputSpecification {
	id: string | undefined;
	physicalW: number;
	physicalH: number;
	pixelsW: number;
	pixelsH: number;
	mono: boolean | undefined;
}

export default class Grafikk {

	public inputSpecification: GrafikkInputSpecification = {
		text: 'None'
	}

	public outputBuffer: Buffer

	public outputSpecification: GrafikkOutputSpecification = {
		id: undefined,
		physicalW: 64,
		physicalH: 64,
		pixelsW: 10,
		pixelsH: 10,
		mono: false
	}

	public outputCallback: (outputResult: GrafikkOutput) => void;

	constructor(
		outputSpecification: GrafikkOutputSpecification,
		outputCallback: (outputResult: GrafikkOutput) => void
	) {
		this.outputSpecification = {
			...this.outputSpecification,
			...outputSpecification
		};
		this.outputBufferAllocate();
		this.outputCallback = outputCallback;
	}

	outputBufferAllocate() {
		if (this.outputSpecification.mono) {
			this.outputBuffer = Buffer.alloc(
				(this.outputSpecification.pixelsW * this.outputSpecification.pixelsH) /
				8
			);
		} else {
			this.outputBuffer = Buffer.alloc(
				this.outputSpecification.pixelsW * this.outputSpecification.pixelsH * 3
			);
		}
	}

	// Clear the canvas
	outputBufferClear() {
		this.outputBuffer.fill(0);
	}

	drawMonoPixel(x: number, y: number, color: boolean) {
		let was = this.outputBuffer.readUInt8(
			Math.floor(x / 8) + y * Math.floor(this.outputSpecification.pixelsW / 8)
		);
		let bit = 1 << (7 - (x % 8));
		if (color) {
			this.outputBuffer.writeUInt8(
				was | bit,
				Math.floor(x / 8) + y * Math.floor(this.outputSpecification.pixelsW / 8)
			);
		} else {
			this.outputBuffer.writeUInt8(
				was & ~bit,
				Math.floor(x / 8) + y * Math.floor(this.outputSpecification.pixelsW / 8)
			);
		}
	}

	drawRGBPixel(x: number, y: number, color: GrafikkColorRGB) {
		let pos = (x + y * this.outputSpecification.pixelsW) * 3;
		this.outputBuffer.writeUInt8(color.r, pos + 0);
		this.outputBuffer.writeUInt8(color.g, pos + 1);
		this.outputBuffer.writeUInt8(color.b, pos + 2);
	}

	drawPixel(x: number, y: number, color: boolean | GrafikkColorRGB) {

		if (x < 0 || y < 0 || x >= this.outputSpecification.pixelsW || y >= this.outputSpecification.pixelsH) {
			return
		}

		if (typeof color !== 'boolean' && this.outputSpecification.mono) {
			this.drawMonoPixel(x, y, color.r || color.g || color.b > 0 ? true : false
			);
		} else if (this.outputSpecification.mono) {
			this.drawMonoPixel(x, y, !!color);
		} else if (typeof color === 'boolean') {
			this.drawRGBPixel(x, y, <GrafikkColorRGB>{
				r: color ? 255 : 0,
				g: color ? 255 : 0,
				b: color ? 255 : 0
			});
		} else {
			this.drawRGBPixel(x, y, <GrafikkColorRGB>color);
		}
	}

	drawHorizontalLine(y: number, color: boolean | GrafikkColorRGB) {
		for (var x = 0; x < this.outputSpecification.pixelsW; x++) {
			this.drawPixel(x, y, color);
		}
	}

	drawVerticalLine(x: number, color: boolean | GrafikkColorRGB) {
		for (var y = 0; y < this.outputSpecification.pixelsH; y++) {
			this.drawPixel(x, y, color);
		}
	}


	generate(inputSpecification: GrafikkInputSpecification) {
		this.outputBufferClear();

		this.inputSpecification = {
			...this.inputSpecification,
			...inputSpecification
		}

		this.drawHorizontalLine(Math.round(this.outputSpecification.pixelsH / 100 * 60), { r: 255, g: 255, b: 255 })

		let font = new GrafikkFont(this, __dirname + "/../Arial.ttf")
		font.centerTextBox(10, 60, 100, 100, this.outputSpecification.pixelsH / 2, this.inputSpecification.text, { r: 255, g: 255, b: 255 })

		let outputResult: GrafikkOutput = {
			error: null,
			buffer: this.outputBuffer
		}

		this.outputCallback(outputResult)
	}


}

import GrafikkFont, { GrafikkFontAlign } from './GrafikkFont'

export interface GrafikkInputSpecification {
	mainValue: string;
	contextValue: string;
	mainColorBackground: GrafikkColorRGB;
	mainColorText: GrafikkColorRGB;
	contextColorBackground: GrafikkColorRGB;
	contextColorText: GrafikkColorRGB;
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
		mainValue: 'No text',
		contextValue: 'No context',
		mainColorBackground: { r: 0, g: 0, b: 0},
		mainColorText: { r: 0, g: 0, b: 0},
		contextColorBackground: { r: 50, g: 0, b: 0},
		contextColorText: { r: 255, g: 190, b: 0},
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
		let bitPos = x + (y * this.outputSpecification.pixelsW)
		let index = Math.floor(bitPos / 8)
		let was = this.outputBuffer.readUInt8(index)

		let bit = 1 << (7-(bitPos % 8));
		if (color) {
			this.outputBuffer.writeUInt8(
				was | bit,
				index
			);
		} else {
			this.outputBuffer.writeUInt8(
				was & ~bit,
				index
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

		x = Math.round(x)
		y = Math.round(y)

		if (x < 0 || y < 0 || x >= this.outputSpecification.pixelsW || y >= this.outputSpecification.pixelsH) {
			return
		}

		if (typeof color !== 'boolean' && color !== undefined && this.outputSpecification.mono) {
			this.drawMonoPixel(
				x,
				y,
				color.r || color.g || color.b > 0 ? true : false
			);
		}

		else if (this.outputSpecification.mono) {
			this.drawMonoPixel(x, y, !!color);
		}

		else if (typeof color === 'boolean') {
			this.drawRGBPixel(x, y, <GrafikkColorRGB>{
				r: color ? 255 : 0,
				g: color ? 255 : 0,
				b: color ? 255 : 0
			});
		}

		else {
			this.drawRGBPixel(x, y, <GrafikkColorRGB>color);
		}
	}

	drawHorizontalDottedLine(y: number, pixeljump: number, color: boolean | GrafikkColorRGB) {
		for (var x = 0; x < this.outputSpecification.pixelsW; x += pixeljump) {
			this.drawPixel(x, y, color);
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

	drawHorizontalDottedLinePercent(yPercent: number, pixeljump: number, color: boolean | GrafikkColorRGB) {
		this.drawHorizontalDottedLine(Math.round(this.outputSpecification.pixelsH / 100 * yPercent), pixeljump, color)
	}

	drawHorizontalLinePercent(yPercent: number, color: boolean | GrafikkColorRGB) {
		this.drawHorizontalLine(Math.round(this.outputSpecification.pixelsH / 100 * yPercent), color)
	}

	drawVerticalLinePercent(xPercent: number, color: boolean | GrafikkColorRGB) {
		this.drawVerticalLine(Math.round(this.outputSpecification.pixelsW / 100 * xPercent), color)
	}

	generate(inputSpecification: GrafikkInputSpecification) {
		this.outputBufferClear();

		this.inputSpecification = {
			...this.inputSpecification,
			...inputSpecification
		}

		// Draw context section
		let fontContext = new GrafikkFont(this, __dirname + "/../TTNorms-Medium.otf")
		let topBarHeight = this.outputSpecification.pixelsH > 32 ? 15 : 12
		let topBarPercent = 100 / this.outputSpecification.pixelsH * topBarHeight
		let topBarPercentPlus = 100 / this.outputSpecification.pixelsH * (topBarHeight + 1)

		fontContext.centerTextBox(
			0, 0, 100, topBarPercent,
			this.outputSpecification.pixelsH/100*35,
			this.inputSpecification.contextValue || '',
			this.inputSpecification.contextColorText,
			this.inputSpecification.contextColorBackground,
			GrafikkFontAlign.BOTTOM_CENTER
		)



		// Draw main section
		let fontMain = new GrafikkFont(this, __dirname + "/../TTNorms-Medium.otf")

		fontMain.centerTextBox(
			0, topBarPercentPlus, 100, 100,
			this.outputSpecification.pixelsH/100*(100-35),
			this.inputSpecification.mainValue || '',
			this.inputSpecification.mainColorText,
			this.inputSpecification.mainColorBackground,
			GrafikkFontAlign.MIDDLE_CENTER
		)

		// Line between context and main section
		this.drawHorizontalDottedLinePercent(topBarPercent, 3, { r: 128, g: 128, b: 128 })


		let outputResult: GrafikkOutput = {
			error: null,
			buffer: this.outputBuffer
		}

		this.outputCallback(outputResult)
	}


}

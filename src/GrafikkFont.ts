const fs = require('fs');

interface Face {
	[key: string]: any
}

export default class GrafikkFont {

	private face: Face = {};
	private freetype: any;

	constructor() {
		console.log("meh");

		this.freetype = require('freetype2');
		console.log("this.freetype", this.freetype);

		let charSize = {
			charWidth: 0,
			charHeight: 15 * 64,
			horzResolution: 128,
			vertResolution: 128,
		};

		const pathFont: string = './Ubuntu-C.ttf';

		console.log("meh1");
		let file = fs.readFileSync(pathFont);
		console.log("file", file);

		this.freetype.New_Memory_Face(file, 0, this.face);
		console.log("meh2");

		this.freetype.Set_Pixel_Sizes(this.face, 1, 1);
		console.log("meh3");
		this.freetype.Set_Char_Size(this.face,
			charSize.charWidth,
			charSize.charHeight,
			charSize.horzResolution,
			charSize.vertResolution
		);

		this.freetype.Set_Transform(
			this.face, [0, 1 << 16, -1 << 16, 0], 0
		);

	}

	convertStringToCharsInt(input: string) {
		return input.split('').map(
			(c: string) => {
				return c.charCodeAt(0);
			}
		);
	}

	convertStringToPixelChars(input: any) {
		const charCodes = this.convertStringToCharsInt(input);
		const bitmaps = charCodes.map((ch: any) => {
			this.freetype.Load_Char(this.face, ch, this.freetype.LOAD_DEFAULT);
			this.freetype.Render_Glyph(this.face.glyph, this.freetype.RENDER_MODE_MONO);
			console.log("this.face.glyph", this.face.glyph);
			return this.face.glyph.bitmap;
		});

		const charBytes = bitmaps.map(this.renderBitmap);
		return charBytes;
	}

	renderBitmap(
		bitmap: {
			pitch: number;
			buffer: Buffer;
			width: number;
			rows: number;
		}
	) {

		const charBytes: any = [];

		for (var j = 0; j < bitmap.pitch; j++) {

			charBytes[j] = [];
			let i = j;
			let k = 0;

			while (i < bitmap.buffer.length) {
				charBytes[j][k] = bitmap.buffer.readUInt8(i);
				i = i + bitmap.pitch;
				k++;
			}

		}

		return {
			data: charBytes,
			height: bitmap.width,
			width: bitmap.rows,
		};

	}



}



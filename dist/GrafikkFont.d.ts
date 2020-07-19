/// <reference types="node" />
import Grafikk, { GrafikkColorRGB } from './Grafikk';
export interface GrafikkFontFace {
    [key: string]: any;
}
export interface GrafikkFontGlyph {
    [key: string]: any;
}
export interface GrafikkFontGlyph {
    bitmap: GrafikkFontGlyphBitmap;
}
export declare const GrafikkFontAlign: {
    TOP_LEFT: number;
    TOP_CENTER: number;
    TOP_RIGHT: number;
    MIDDLE_LEFT: number;
    MIDDLE_CENTER: number;
    MIDDLE_RIGHT: number;
    BOTTOM_LEFT: number;
    BOTTOM_CENTER: number;
    BOTTOM_RIGHT: number;
};
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
    private face;
    private memoryface;
    private fontPath;
    private grafikk;
    private spaceFontSizeDividedBy;
    constructor(grafikk: Grafikk, fontPath: string, fontFaceOptions?: GrafikkFontFace);
    setFace(fontPath: string): void;
    charCodes(textString: string): number[];
    glyphsFromString(text: string): GrafikkFontGlyph[];
    glyphsWidth(glyphs: Array<GrafikkFontGlyph>): number;
    setSize(pixelSize: number): void;
    glyphsDraw(glyphs: Array<GrafikkFontGlyph>, fromX: number, fromY: number, toX: number, toY: number, color: GrafikkColorRGB, alignment: number): void;
    glyphDraw(glyph: any, fromX: number, fromY: number, color: GrafikkColorRGB): void;
    glyphDrawFromNormal(glyph: any, fromX: number, fromY: number, color: GrafikkColorRGB): void;
    centerTextBox(fromXpercent: number, fromYpercent: number, toXpercent: number, toYpercent: number, size: number, text: string, color: GrafikkColorRGB, background: GrafikkColorRGB, alignment: number): void;
    glyph(charCode: number): GrafikkFontGlyph;
}

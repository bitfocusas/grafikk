/// <reference types="node" />
export interface GrafikkInputSpecification {
    mainValue: string;
    contextValue: string;
    mainColorBackground: GrafikkColorRGB;
    mainColorText: GrafikkColorRGB;
    contextColorBackground: GrafikkColorRGB;
    contextColorText: GrafikkColorRGB;
    fontPath: string;
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
    inputSpecification: GrafikkInputSpecification;
    outputBuffer: Buffer;
    outputSpecification: GrafikkOutputSpecification;
    outputCallback: (outputResult: GrafikkOutput) => void;
    constructor(outputSpecification: GrafikkOutputSpecification, outputCallback: (outputResult: GrafikkOutput) => void);
    outputBufferAllocate(): void;
    outputBufferClear(): void;
    drawMonoPixel(x: number, y: number, color: boolean): void;
    drawRGBPixel(x: number, y: number, color: GrafikkColorRGB): void;
    drawPixel(x: number, y: number, color: boolean | GrafikkColorRGB): void;
    drawHorizontalDottedLine(y: number, pixeljump: number, color: boolean | GrafikkColorRGB): void;
    drawHorizontalLine(y: number, color: boolean | GrafikkColorRGB): void;
    drawVerticalLine(x: number, color: boolean | GrafikkColorRGB): void;
    drawHorizontalDottedLinePercent(yPercent: number, pixeljump: number, color: boolean | GrafikkColorRGB): void;
    drawHorizontalLinePercent(yPercent: number, color: boolean | GrafikkColorRGB): void;
    drawVerticalLinePercent(xPercent: number, color: boolean | GrafikkColorRGB): void;
    generate(inputSpecification: GrafikkInputSpecification): void;
}

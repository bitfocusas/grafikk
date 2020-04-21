process.env.DEBUG_DEPTH = '10'
import Grafikk from './src/Grafikk' //'./dist/Grafikk';
import * as Debug from 'debug'
const debug = Debug('test')

/* socket.io world */
var http = require('http');
var express = require('express')
var app = express()
var options = {}
app.use(express.static('public'))
var serverPort = 3000;
var server = http.createServer(options, app)
var io = require('socket.io')(server)

let currentRenderContext = "AUX 1"
let currentRenderMain = "Input 2"

interface testInterface {
	id: string;
	physicalW: number;
	physicalH: number;
	pixelsW: number;
	pixelsH: number;
	mono: boolean;
	gfx?: Grafikk;
}

const tests: testInterface[] = [
	{ id: 'skaarhojSmall', physicalW: 13.4, physicalH: 7.6, pixelsW: 64, pixelsH: 32, mono: true },
	{ id: 'skaarhojWide', physicalW: 26.8, physicalH: 7.6, pixelsW: 128, pixelsH: 32, mono: true },
	{ id: 'streamdeckNormal', physicalW: 14, physicalH: 14, pixelsW: 72, pixelsH: 72, mono: false },
	{ id: 'streamdeckXL', physicalW: 14, physicalH: 14, pixelsW: 96, pixelsH: 96, mono: false },
	{ id: 'streamdeckMini', physicalW: 14, physicalH: 14, pixelsW: 80, pixelsH: 80, mono: false },
	{ id: 'skaarhojSmall1', physicalW: 13.4, physicalH: 7.6, pixelsW: 64, pixelsH: 32, mono: true },
	{ id: 'skaarhojWide1', physicalW: 26.8, physicalH: 7.6, pixelsW: 128, pixelsH: 32, mono: true },
	{ id: 'streamdeckNormal1', physicalW: 14, physicalH: 14, pixelsW: 72, pixelsH: 72, mono: false },
	{ id: 'streamdeckX1L', physicalW: 14, physicalH: 14, pixelsW: 96, pixelsH: 96, mono: false },
	{ id: 'streamdeckMini1', physicalW: 14, physicalH: 14, pixelsW: 80, pixelsH: 80, mono: false },
	{ id: 'skaarhojSmall2', physicalW: 13.4, physicalH: 7.6, pixelsW: 64, pixelsH: 32, mono: true },
	{ id: 'skaarhojWide2', physicalW: 26.8, physicalH: 7.6, pixelsW: 128, pixelsH: 32, mono: true },
	{ id: 'streamdeckNormal2', physicalW: 14, physicalH: 14, pixelsW: 72, pixelsH: 72, mono: false },
	{ id: 'streamdeckXL2', physicalW: 14, physicalH: 14, pixelsW: 96, pixelsH: 96, mono: false },
	{ id: 'streamdeckMini2', physicalW: 14, physicalH: 14, pixelsW: 80, pixelsH: 80, mono: false },

]

function randColor() {

	let meh = [
		{ r: 255, g: 0,    b: 0 },
		{ r: 0,   g: 255 , b: 0 },
		{ r: 255, g: 0,    b: 255 },
		{ r: 0,   g: 255,  b: 255 },
		{ r: 255, g: 128,  b: 0 },
		{ r: 0,   g: 128 , b: 255 },
	]

	return meh[Math.floor(Math.random() * meh.length)]
}

server.listen(serverPort, function () { console.log('server up and running at %s port', serverPort); });

tests.forEach(outputSpecification => {
	outputSpecification.gfx = new Grafikk(outputSpecification, (renderResult) => {
		io.emit('render', outputSpecification.id, outputSpecification, renderResult)
	})
})

function update() {
	tests.forEach(outputSpecification => {
		if (outputSpecification.gfx) {
			debug(`Going to generate ${outputSpecification.pixelsW}x${outputSpecification.pixelsH}`)
			outputSpecification.gfx.generate({
				mainValue: currentRenderMain,
				contextValue: currentRenderContext,
				mainColorBackground: { r: 0, g: 0,  b: 0 },
				mainColorText: randColor(),
				contextColorBackground: { r: 40,   g: 30,  b: 20 },
				contextColorText: { r: 255, g: 128,  b: 0 },
			})
		}
	})
}

io.on('connection', (socket: { on: (arg0: string, arg1: (text: any) => void) => void; }) => {
	update();

	socket.on('updateMain', (text: string) => {
		currentRenderMain = text
		update()
	})

	socket.on('updateContext', (text: string) => {
		currentRenderContext = text
		update()
	})

})

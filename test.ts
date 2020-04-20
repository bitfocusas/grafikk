process.env.DEBUG_DEPTH = '10';
import Grafikk from './dist/Grafikk';
import * as Debug from 'debug';
const debug = Debug('test');

/* socket.io world */
var http = require('http');
var express = require('express');
var app = express();
var options = {};
app.use(express.static('public'));
var serverPort = 3000;
var server = http.createServer(options, app);
var io = require('socket.io')(server);

let currentRenderText = "#X";

server.listen(serverPort, function () { console.log('server up and running at %s port', serverPort); });
/* end socket.io server */

io.on('connection', (socket: { on: (arg0: string, arg1: (text: any) => void) => void; }) => {
	socket.on('updateText', (text: string) => {
		currentRenderText = text
	})
});

const tests = [
	{ id: 'skaarhojSmall', physicalW: 13.4, physicalH: 7.6, pixelsW: 64, pixelsH: 32, mono: true },
	{ id: 'skaarhojWide', physicalW: 26.8, physicalH: 7.6, pixelsW: 128, pixelsH: 32, mono: true },
	{ id: 'streamdeckNormal', physicalW: 14, physicalH: 14, pixelsW: 72, pixelsH: 72, mono: false },
	{ id: 'streamdeckXL', physicalW: 14, physicalH: 14, pixelsW: 96, pixelsH: 96, mono: false },
	{ id: 'streamdeckMini', physicalW: 14, physicalH: 14, pixelsW: 80, pixelsH: 80, mono: false },
]

tests.map(outputSpecification => {

	const gfx = new Grafikk(outputSpecification, (renderResult) => {
		io.emit('render', outputSpecification.id, outputSpecification, renderResult);
	});

	setInterval(() => {
		gfx.generate({
			text: currentRenderText
		})
	}, 200)


})

debug("x")
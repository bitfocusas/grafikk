$(function() {
	console.log('connect');
	var socket = io();

	var $c = $('#container');

	$('#textMain').keyup(function() {
		socket.emit('updateMain', $(this).val());
	});
	$('#textContext').keyup(function() {
		socket.emit('updateContext', $(this).val());
	});

	socket.on('render', function(id, specification, render) {
		const inputbuffer = new Uint8Array(render.buffer);

		let $rw = $('#render_' + id);

		//console.log({ render });
		if (!$rw.length) {
			$rw = $('<div class="renderWindow" id="render_' + id + '"></div>');
			$rw.html('<h1>' + id + ' ('+specification.pixelsW+'x'+specification.pixelsH+')</h1>');
			$c.append($rw);

			let $canvas = $(
				'<canvas width="' +
					specification.pixelsW +
					'" height="' +
					specification.pixelsH +
					'">'
			)
				.css({
					backgroundColor: 'black'
				})
				.appendTo($rw);
		}

		let $canvas = $('#render_' + id + ' canvas');
		var ctx = $canvas[0].getContext('2d');

		let buffer = new Uint8ClampedArray(
			Math.floor(specification.pixelsW * specification.pixelsH * 4)
		);

		if (specification.mono) {
			for (
				var bit = 0;
				bit < specification.pixelsW * specification.pixelsH;
				bit++
			) {
				let byte = Math.floor(bit / 8);
				let n = 7 - (bit % 8);
				let val = (inputbuffer[byte] & (1 << n)) >> n;
				if (val) {
					buffer[bit * 4 + 0] = val ? 255 : 0;
					buffer[bit * 4 + 1] = val ? 255 : 0;
					buffer[bit * 4 + 2] = val ? 255 : 0;
					buffer[bit * 4 + 3] = 255;
				}
			}

			let image = new ImageData(
				buffer,
				specification.pixelsW,
				specification.pixelsH
			);

			ctx.putImageData(image, 0, 0);
		} else {
			let outbytes = 0;
			let inbytes = 0;

			while (inbytes < specification.pixelsW * specification.pixelsH * 3) {
				buffer[outbytes + 0] = inputbuffer[inbytes + 0];
				buffer[outbytes + 1] = inputbuffer[inbytes + 1];
				buffer[outbytes + 2] = inputbuffer[inbytes + 2];
				buffer[outbytes + 3] = 255;
				outbytes += 4;
				inbytes += 3;
			}

			let image = new ImageData(
				buffer,
				specification.pixelsW,
				specification.pixelsH
			);

			ctx.putImageData(image, 0, 0);
		}
	});
});

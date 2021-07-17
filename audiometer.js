"use strict";


function init() {
	let canvas = document.getElementById("volume_meter");
	let audio = new Audio();
	audio.startDraw(canvas);
	canvas.addEventListener("mousedown", () => {
		audio.drawMode += 1;
		if (audio.drawMode > 2) { audio.drawMode = 0; }
	});

}
window.addEventListener("DOMContentLoaded", () => {
	init();
});

class Audio {
	audioCtx; analyser;
	bufferLength;
	dataArray;
	audioSource;
	target;
	constructor() {
		// Audio Context
		this.audioCtx = new AudioContext();
		this.analyser = this.audioCtx.createAnalyser();
		this.analyser.fftSize = Math.pow(2, 10);
		this.analyser.minDecibels = -90;
		this.analyser.maxDecibels = -10;
		this.analyser.smoothingTimeConstant = 0.7;

		this.bufferLength = this.analyser.frequencyBinCount;
		this.dataArray = new Uint8Array(this.bufferLength);

		// Audio Source
		if (navigator.mediaDevices) {
			navigator.mediaDevices.getUserMedia({ audio: true, video: false })
				.then((stream) => {
					this.audioSource = this.audioCtx.createMediaStreamSource(stream);
					this.audioSource.connect(this.analyser);
				});
			//this.analyser.getByteTimeDomainData(this.dataArray);
		}

		this.drawMode = 1;
	}
	startDraw(target) {
		this.target = target;
		window.requestAnimationFrame(() => { this.draw() });
	}
	draw() {
		let canvasCtx = this.target.getContext('2d');
		let middleHeight = this.target.clientHeight / 2;
		canvasCtx.fillStyle = "rgb(0,0,0)";
		canvasCtx.fillRect(0, 0, this.target.clientWidth, this.target.clientHeight);

		//let alpha = 1.0;
		//let alpha = (Date.now()%2000<1000)? 1.0 : 0.7 ;
		let alpha = (Date.now() % 2000 < 1000) ? (Date.now() % 1000 / 1000.0) : 1.0 - (Date.now() % 1000 / 1000.0);
		alpha = (1.0 + alpha) / 2;


		if (this.drawMode === 1) {
			// sine wave
			this.analyser.getByteTimeDomainData(this.dataArray);

			for (let i = 0; i < 128; i++) {
				let x = (i * this.target.clientWidth / 128);
				let v = this.dataArray[Math.floor(i * this.dataArray.length / 128)];
				let vy = (v * (this.target.clientHeight) / 256);

				canvasCtx.fillStyle = `rgba(204,204,102,${alpha})`;
				canvasCtx.fillRect(x, this.target.clientHeight - vy, 3, 3);
				//canvasCtx.fillStyle = "rgba(153,255,153,0.5)";
				//canvasCtx.fillRect( x , middleHeight-vy , 2 , vy );

			}
		} else if (this.drawMode === 2) {
			// frequency bars
			/*
			this.analyser.fftSize = 256;
			let dataArrayAlt = new Uint8Array(bufferLengthAlt);
			*/
			this.analyser.getByteFrequencyData(this.dataArray);

			for (let i = 0; i < 128; i++) {
				let x = i * this.target.clientWidth / 128;
				let v = this.dataArray[Math.floor(i / 128 * this.dataArray.length)];

				canvasCtx.fillStyle = "rgba(102,204,204,0.5)";
				canvasCtx.fillRect(x, this.target.clientHeight - (v - 2), 5, v);

				canvasCtx.fillStyle = `rgba(102,204,204,${alpha})`;
				canvasCtx.fillRect(x, this.target.clientHeight - v - 3, 5, 5);
			}
		}

		window.requestAnimationFrame(() => { this.draw() });
	}
}

"use strict";

function ReversiRenderer(drawSettings, reversiBoard) {
	this.context = drawSettings.context;
	this.reversiBoard = reversiBoard;
	this.size = drawSettings.size;
	this.tileSize = this.size / 8;
	this.colorStyles = {
		bgColor: 'rgb(64,148,64)',
		placeableColor: 'rgba(255, 144, 144, 0.6)',
		flipColor: 'rgba(144, 144, 255, 0.7)'
	};
	this.colorStyles[Disk.BLACK] = 'rgb(0, 0, 0)';
	this.colorStyles[Disk.WHITE] = 'rgb(255, 255, 255)';
}

ReversiRenderer.prototype.draw = function(context) {
	var context = context || this.context;
	context.fillStyle = this.colorStyles.bgColor;
	context.fillRect(0, 0, this.size, this.size);
	this.drawGrid(context);
	this.reversiBoard.eachDisk(function (disk, square) {
		this.drawCircle(context, square, this.colorStyles[disk.getFaceUpColor()]);
	}, this);
}

ReversiRenderer.prototype.drawCircle = function(context, square, colorStyle) {
	var pos = this.squareToPixelPos(square);
	context.fillStyle = colorStyle;
	context.beginPath();
	context.arc(pos.x + this.tileSize / 2, pos.y + this.tileSize / 2, 
		this.tileSize / 2 - 6, 0, Math.PI * 2, true);
	context.closePath();
	context.fill();
}

ReversiRenderer.prototype.drawGrid = function(context) {
	var x = 0,
		y = 0;
	context.strokeStyle = 'black';
	context.lineWidth = 1;
	context.beginPath();
	for ( ; x < this.size; x+=this.tileSize, y+= this.tileSize) {
		context.moveTo(x, 0);
		context.lineTo(x, this.size);
		context.moveTo(0, y);
		context.lineTo(this.size, y);
	}
	context.stroke();
	context.closePath();
}

ReversiRenderer.prototype.drawPlaceable = function (faceUpColor) {
	var squares = this.reversiBoard.getPlaceableSquaresForColor(faceUpColor);
	squares.forEach(function (square) {
		this.drawCircle(this.context, square, this.colorStyles.placeableColor);
	}, this);
}

ReversiRenderer.prototype.drawFlippable = function (faceUpColor, square) {
	var squares = this.reversiBoard.getSquaresToFlipOnPlacing(faceUpColor, square);
	squares.forEach(function (square) {
		this.drawCircle(this.context, square, this.colorStyles.flipColor);
	}, this);
}

ReversiRenderer.prototype.squareToPixelPos = function (square) {
	var col = 'ABCDEFGH'.indexOf(square[0]),
		row = parseInt(square[1] - 1);
	return {
		x: col * this.tileSize,
		y: row * this.tileSize
	};
}
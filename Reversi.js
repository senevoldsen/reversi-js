"use strict";

/**
	Guess its really Othello
**/

function InvalidSquareError(square) {
	this.message = "Invalid square: " + square;
};

function ReversiBoard() {
	this.prepareBoard();
}

ReversiBoard.prototype.prepareBoard = function () {
	this._clear();
	this._placeStartDisks();
}

ReversiBoard.prototype.getDisk = function (square) {
	square = this._getSquare(square);
	if (this._tiles.hasOwnProperty(square)) {
		return this._tiles[square];
	}
	return null;
}

ReversiBoard.prototype.getPlaceableSquaresForColor = function (faceUpColor) {
	var squares = [];
	this.eachSquare(function (disk, square) {
		if (!disk && this.canPlaceDisk(faceUpColor, square)) {
			squares.push(square);
		}
	}, this);
	return squares;
}

ReversiBoard.prototype.getSquaresToFlipOnPlacing = function (faceUpColor, square) {
	var squares = [],
		deltaX, deltaY, moreSquares;
	if (this.getDisk(square) !== null) return squares;
	for (deltaX = -1; deltaX <= 1; deltaX++) {
		for (deltaY = -1; deltaY <= 1; deltaY++) {
			if (deltaX === 0 && deltaY === 0) continue;
			moreSquares = this._getFlippableSquaresInDir(faceUpColor, square, deltaX, deltaY);
			moreSquares.forEach(function (square) {
				squares.push(square);
			});
		}
	}
	return squares;
}

ReversiBoard.prototype.canPlaceDisk = function (faceUpColor, square) {
	return this.getSquaresToFlipOnPlacing(faceUpColor, square).length > 0;
}

ReversiBoard.prototype.placeDisk = function (disk, square) {
	var squaresToFlip = this.getSquaresToFlipOnPlacing(disk.getFaceUpColor(), square),
		flipDisk;
	squaresToFlip.forEach(function (square) {
		var flipDisk = this.getDisk(square);
		if (flipDisk) {
			flipDisk.flip();
		}
	}, this);
	this._putDisk(disk, square);
}

ReversiBoard.prototype.score = function (faceUpColor) {
	var score = 0;
	this.eachDisk(function (disk, unUsedSquare) {
		if (disk.getFaceUpColor() === faceUpColor) {
			score++;
		}
	}, this);
	return score;
}

ReversiBoard.prototype.eachSquare = function (f, thisObject) {
	var cols = 'ABCDEFGH',
		col, row, square, disk;
	for (row = 0; row < 8; row++) {
		for (col = 0; col < 8; col++) {
			square = cols[col] + (row + 1);
			disk = this.getDisk(square);
			f.call(thisObject, disk, square);
		}
	}
}

ReversiBoard.prototype.eachDisk = function (f, thisObject) {
	this.eachSquare(function (disk, square) {
		if (disk) {
			f.call(thisObject, disk, square);
		}
	}, this);
}

ReversiBoard.prototype._clear = function () {
	this._tiles = {};
}

ReversiBoard.prototype._placeStartDisks = function () {
	this._putDisk(new Disk(Disk.WHITE), 'D4');
	this._putDisk(new Disk(Disk.WHITE), 'E5');
	this._putDisk(new Disk(Disk.BLACK), 'E4');
	this._putDisk(new Disk(Disk.BLACK), 'D5');
}

ReversiBoard.prototype._getSquare = function (square) {
	if (/[a-hA-H][1-8]/.test(square)) {
		return square.toUpperCase();
	} else if (/[1-8][a-hA-H]/.test(square)) {
		return (square[1] + square[0]).toUpperCase();
	}
	throw new InvalidSquareError(square);
}

ReversiBoard.prototype._putDisk = function (disk, square) {
	this._tiles[this._getSquare(square)] = disk;
}

ReversiBoard.prototype._getFlippableSquaresInDir = function (faceUpColor, square, deltaX, deltaY) {
	var squares = [],
		cols = 'ABCDEFGH',
		col = cols.indexOf(square[0]),
		row = parseInt(square[1]) - 1,
		checkSquare, checkDisk;

	function moveInsideBoard() {
		row += deltaY;
		col += deltaX;
		return (row >= 0 && row < 8 && col >= 0 && col < 8);
	}

	while (moveInsideBoard()) {
		checkSquare = cols[col] + (row + 1);
		checkDisk = this.getDisk(checkSquare);
		if (checkDisk === null) return [];
		if (checkDisk.getFaceUpColor() === faceUpColor)
			return squares;
		squares.push(checkSquare);
	}
	//Moved off board without 'connecting' with a disk.
	return [];
}

function Disk(faceupColor) {
	this._faceupColor = faceupColor;
}

//Prefixed String reduces chance of collision when used as a key.
Disk.WHITE = 'Disk_White';
Disk.BLACK = 'Disk_Black';

Disk.prototype.flip = function () {
	this._faceupColor = this.getFaceUpColor() === Disk.WHITE ? Disk.BLACK : Disk.WHITE;
}

Disk.prototype.getFaceUpColor = function () {
	return this._faceupColor;
}

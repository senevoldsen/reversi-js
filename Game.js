//TODO: Announce player had no possible moves to the player does not play on the wrong turn (flash something?)

Game = (function() {

	function relativePosition(event) {
		var targetOffset = $(event.target).offset();		
		return {
			//Border hack
			x: Math.floor(event.pageX - (targetOffset.left + 6)),
			y: Math.floor(event.pageY - (targetOffset.top + 6))
		};
	}

	function posToSquare(pos) {
		var colIdx = Math.floor(pos.x / (600 / 8)),
			rowIdx = Math.floor(pos.y / (600 / 8));
		if (colIdx < 0 || rowIdx < 0 || colIdx >= 8 || rowIdx >= 8) {
			return null;
		}
		return 'ABCDEFGH'[colIdx] + (rowIdx + 1);
	}

	function playHotseatGame(settings) {
		var currentPlayerColor = Disk.BLACK,
			isGameOver = false,
			board, canvas, renderer, status, score, size, lastHoverSquare;
		board = new ReversiBoard();

		size = settings.canvas.size;
		canvas = document.getElementById(settings.canvas.id);
		$(canvas).attr('width', size).attr('height', size);

		status = document.getElementById(settings.status.playerId);
		score = document.getElementById(settings.status.scoreId);

		renderer = new ReversiRenderer({
			context: canvas.getContext('2d'),
			size: size
		}, board);
		renderer.draw();

		function showCurrentStatus() {
			var playerText;
			showScore();
			if (isGameOver) {
				showGameOver();
			} else {
				playerText = currentPlayerColor === Disk.WHITE ? 'White' : 'Black';
				$(status).text('Current player is ' + playerText);
			}
		}

		function showScore() {
			var whiteScore = board.score(Disk.WHITE),
				blackScore = board.score(Disk.BLACK);
			$(score).text('White ' + whiteScore + ' vs. ' + blackScore + ' Black');
		}

		function showGameOver() {
			var scoreWhite = board.score(Disk.WHITE),
				scoreBlack = board.score(Disk.BLACK),
				winner = 'tie',
				statusText = 'The game is a tie.';
			isGameOver = true;
			if (scoreWhite !== scoreBlack) {
				winner = scoreWhite > scoreBlack ? 'White' : 'Black';
				statusText = winner + ' won the game.'
			}
			$(status).text(statusText);		
		}

		function switchCurrentPlayer() {
			var oldPlayerColor = currentPlayerColor;
			currentPlayerColor = currentPlayerColor === Disk.WHITE ? Disk.BLACK : Disk.WHITE;
			if (board.getPlaceableSquaresForColor(currentPlayerColor).length === 0) {
				if (board.getPlaceableSquaresForColor(oldPlayerColor).length === 0) {
					showGameOver();
				} else {
					switchCurrentPlayer();
				}
				return;
			}
			redraw();
		}

		function redraw() {
			renderer.draw();
			renderer.drawPlaceable(currentPlayerColor);
			showCurrentStatus();
		}

		$(canvas).on('mousemove', (function () {
			return function (event) {
				var rel = relativePosition(event),
					nowSquare = posToSquare(rel);
				if (nowSquare && nowSquare !== lastHoverSquare) {
					lastHoverSquare = nowSquare;
					redraw();
					renderer.drawFlippable(currentPlayerColor, nowSquare);
				}
			};
		})());

		$(canvas).on('mouseleave', function (event) {
			lastHoverSquare = null;
			redraw();
		});

		$(canvas).on('click', function (event) {
			var relPos = relativePosition(event),
				square = posToSquare(relPos);
			if (board.canPlaceDisk(currentPlayerColor, square)) {
				board.placeDisk(new Disk(currentPlayerColor), square);
				switchCurrentPlayer();
				renderer.drawFlippable(currentPlayerColor, square);
			}
		});

		redraw();
	}

	return {
		playHotseatGame: playHotseatGame
	};
})();

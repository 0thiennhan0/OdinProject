let gameType = "tictactoe";

const GameBoard = ((gameType) => {
  let _board = gameType === "tictactoe" ? [...Array(9)] : [...Array(64)];
  const _boardContainer = document.querySelector(`#game-board`);

  const getBoard = () => _board;

  const getBoardIndex = (index) => _board[index];

  const setSignByIndex = (index, sign, box) => {
    if (_board[index] === undefined) {
      _board[index] = sign;
      const signContianer = document.createElement("p");
      signContianer.textContent = sign;
      signContianer.classList.add("sign-container");
      signContianer.style.fontSize = `${(box.offsetWidth * 3) / 5 / 16}rem`;
      box.appendChild(signContianer);
      return true;
    }
    return false;
  };

  const getPosibleMove = (board = _board) => {
    return board.reduce((arr, currentValue, currentIndex) => {
      if (!currentValue) {
        arr.push(currentIndex);
      }
      return arr;
    }, []);
  };

  const resetBoard = () => {
    _board = gameType === "tictactoe" ? [...Array(9)] : [...Array(64)];
    _board.innerHTML = "";
    _initBoard();
  };

  const _initBoard = (() => {
    for (let i = 0; i < _board.length; i++) {
      let box = document.createElement("div");
      box.classList.add("box");
      box.setAttribute("data-index", i);
      _boardContainer.appendChild(box);
    }
  })();

  return {
    getBoard,
    getBoardIndex,
    setSignByIndex,
    resetBoard,
    getPosibleMove,
  };
})(gameType);

const Player = (sign, name) => {
  const type = "humnan";
  return {
    sign,
    name,
    type,
  };
};

const AI = (sign) => {
  let name = "ai";
  const type = "computer";

  const nextMove = () => {
    let board = GameBoard.getBoard();
    while (true) {
      let rand = Math.floor(Math.random() * board.length);
      if (!board[rand]) return rand;
    }
  };

  const nextBestMove = () => {
    function minimax(board, posibleMove, depth = 0, maximizingPlayer = true) {
      if (gameController.checkGameOver(3, board)) {
        if (gameController.checkGameOver(3, board) === "Due") return 0;
        return !maximizingPlayer ? 100 - depth : -100 + depth;
      } else if (posibleMove.length === 0) {
        return 0;
      }

      if (maximizingPlayer) {
        let value = -100;
        let pos;

        posibleMove.reduce((arr, currentValue) => {
          tempBoard = [...board];
          tempBoard[currentValue] = sign;

          const tempValue = minimax(
            tempBoard,
            GameBoard.getPosibleMove(tempBoard),
            depth + 1,
            false,
          );
          if (tempValue > value) {
            value = tempValue;
            pos = currentValue;
          }
        }, []);

        if (depth === 0) {
          return { value, pos };
        }
        return value;
      } else {
        let value = 100;

        posibleMove.reduce((arr, currentValue) => {
          tempBoard = [...board];
          tempBoard[currentValue] = sign === "X" ? "O" : "X";

          const tempValue = minimax(
            tempBoard,
            GameBoard.getPosibleMove(tempBoard),
            depth + 1,
            true,
          );

          value = Math.min(value, tempValue);
        }, []);

        return value;
      }
    }

    return minimax(GameBoard.getBoard(), GameBoard.getPosibleMove());
  };

  return { sign, name, type, nextMove, nextBestMove };
};

const displayController = (() => {})();

const gameController = (() => {
  const _player1 = Player("X", "Player1");
  // const _player2 = Player("O", "Player2");
  const _player2 = AI("O");
  let turn = 0;

  let _boxes = document.querySelectorAll(".box");
  const addBoxEventListener = () => {
    for (let box of _boxes) {
      box.addEventListener("click", () => {
        const checkSetSign = GameBoard.setSignByIndex(
          box.getAttribute("data-index"),
          turn % 2 ? _player2.sign : _player1.sign,
          box,
        );
        if (checkSetSign) {
          turn++;
          if (checkGameOver()) {
            alert(checkGameOver().name);
            return;
          } else if (checkGameTie()) {
            alert("Tie");
            return;
          }
        }
        if (_player2.type === "computer" && turn % 2 === 1) {
          // let pos = _player2.nextMove();
          let pos = _player2.nextBestMove().pos;
          GameBoard.setSignByIndex(
            pos,
            _player2.sign,
            document.querySelector(`[data-index="${pos}"]`),
          );
          turn++;
          if (checkGameOver()) {
            alert(checkGameOver().name);
            return;
          } else if (checkGameTie()) {
            alert("Tie");
            return;
          }
        }
      });
    }
  };

  const checkGameTie = () => {
    if (!GameBoard.getPosibleMove().length) return true;
    return false;
  };

  const checkGameOver = (match = 3, board = GameBoard.getBoard()) => {
    const edge = board.length ** 0.5;

    //check match by row
    for (let i = 0; i < board.length; i += edge) {
      let count = 1;
      let sign;
      for (let j = i; j < i + edge; j++) {
        if (board[j] && board[j] === board[j + 1]) {
          if (++count === match) return _player1.sign === sign ? _player1 : _player2;
          sign = board[j];
        } else {
          count = 1;
          break;
        }
      }
    }

    // check match by column
    for (let i = 0; i < edge; i++) {
      let count = 1;
      let sign;
      for (let j = i; j < board.length; j += edge) {
        if (board[j] && board[j] === board[j + edge]) {
          if (++count === match) return _player1.sign === sign ? _player1 : _player2;
          sign = board[j];
        } else {
          count = 1;
        }
      }
    }

    // check match by diagonal
    for (let i = 0; i <= edge - match; i++) {
      for (let j = i; j <= (edge - match) * edge; j += edge) {
        let countL = 1;
        let signL;
        let countR = 1;
        let signR;
        for (let k = j; k < board.length; k += edge + 1) {
          if (board[k] && board[k] === board[k + edge + 1]) {
            if (++countL === match) return _player1.sign === signL ? _player1 : _player2;
            signL = board[k];
          } else {
            countL = 1;
          }
        }
        for (let k = j + edge - i * 2 - 1; k < board.length; k += edge - 1) {
          if (board[k] && board[k] === board[k + edge - 1]) {
            if (++countR === match) return _player1.sign === signR ? _player1 : _player2;
            signR = board[k];
          } else {
            countR = 1;
          }
        }
      }
    }

    return false;
  };

  return {
    addBoxEventListener,
    checkGameOver,
  };
})();

// Start Game
(() => {
  gameController.addBoxEventListener();
})();

import './App.css';
import React from 'react';
import { useState, useContext, useEffect, useRef } from 'react';

// Create a Context for the game state
const GameContext = React.createContext();

// Game Provider component to manage game state
const GameProvider = ({ children }) => {
  const [boardSize, setBoardSize] = useState(3); // Board size (3x3 by default)
  const [board, setBoard] = useState(Array(9).fill(null)); // Board state
  const [isXNext, setIsXNext] = useState(true); // Track whose turn it is
  const [winner, setWinner] = useState(null); // Winner state
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light'); // Theme state

  const movesRef = useRef(0); // Tracks the number of moves made so far

  // Effect to apply the theme to the document body
  useEffect(() => {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);

    // Persist theme in localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Calculate the winning combinations dynamically
  const calculateWinningCombinations = (size) => {
    const combinations = [];
    // Rows
    for (let i = 0; i < size; i++) {
      combinations.push(Array.from({ length: size }, (_, j) => i * size + j));
    }
    // Columns
    for (let i = 0; i < size; i++) {
      combinations.push(Array.from({ length: size }, (_, j) => i + j * size));
    }
    // Diagonal (Top-left to Bottom-right)
    combinations.push(Array.from({ length: size }, (_, i) => i * (size + 1)));
    // Diagonal (Top-right to Bottom-left)
    combinations.push(Array.from({ length: size }, (_, i) => (i + 1) * (size - 1)));

    return combinations;
  };

  // Check for a winner after every move
  useEffect(() => {
    const winningCombinations = calculateWinningCombinations(boardSize);

    for (let combination of winningCombinations) {
      const [first, ...rest] = combination;
      if (board[first] && rest.every((index) => board[index] === board[first])) {
        setWinner(board[first]);
        return;
      }
    }

    // Check for a tie if no winner
    if (!board.includes(null)) {
      setWinner('Tie');
    }
  }, [board, boardSize]);

  const handleClick = (index) => {
    if (board[index] || winner) return; // Do nothing if square is filled or game is over
    const newBoard = board.slice();
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const changeBoardSize = (size) => {
    setBoardSize(size);
    setBoard(Array(size * size).fill(null)); // Reset board for new size
    setWinner(null);
    setIsXNext(true);
  };

  return (
    <GameContext.Provider
      value={{
        board,
        boardSize,
        winner,
        isXNext,
        handleClick,
        setBoard,
        setWinner,
        setIsXNext,
        changeBoardSize,
      }}
    >
      {children}
      <button onClick={toggleTheme} className="theme-toggle-button">
        Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
      </button>
    </GameContext.Provider>
  );
};

// GameBoard component to render the Tic-Tac-Toe grid
const GameBoard = () => {
  const { board, boardSize, winner, handleClick } = useContext(GameContext);

  const statusMessage = winner
    ? winner === 'Tie'
      ? "It's a Tie!"
      : `${winner} Wins!`
    : `Next player: ${board.filter(Boolean).length % 2 === 0 ? 'X' : 'O'}`;

  return (
    <div>
      <h2>{statusMessage}</h2>
      <div
        className="board"
        style={{
          gridTemplateColumns: `repeat(${boardSize}, 100px)`,
          gridTemplateRows: `repeat(${boardSize}, 100px)`,
        }}
      >
        {board.map((value, index) => (
          <button key={index} onClick={() => handleClick(index)} className="square">
            {value}
          </button>
        ))}
      </div>
    </div>
  );
};

// ResetButton component to reset the game
const ResetButton = () => {
  const { setBoard, setWinner, setIsXNext, boardSize } = useContext(GameContext);

  const handleReset = () => {
    setBoard(Array(boardSize * boardSize).fill(null));
    setWinner(null);
    setIsXNext(true);
  };

  return <button onClick={handleReset} className="reset-button">Restart Game</button>;
};

// BoardSizeSelector component to select board size
const BoardSizeSelector = () => {
  const { changeBoardSize, boardSize } = useContext(GameContext);

  return (
    <div className="board-size-selector">
      <button
        onClick={() => changeBoardSize(3)}
        className={boardSize === 3 ? 'active' : ''}
      >
        3x3
      </button>
      <button
        onClick={() => changeBoardSize(4)}
        className={boardSize === 4 ? 'active' : ''}
      >
        4x4
      </button>
      <button
        onClick={() => changeBoardSize(5)}
        className={boardSize === 5 ? 'active' : ''}
      >
        5x5
      </button>
    </div>
  );
};

// Main App component
const App = () => {
  return (
    <GameProvider>
      <div className="game-container">
        <BoardSizeSelector />
        <GameBoard />
        <ResetButton />
      </div>
    </GameProvider>
  );
};

export default App;

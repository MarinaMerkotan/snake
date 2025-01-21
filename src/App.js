import { useEffect, useRef, useState } from 'react';
import './App.css';

const sizeCell = 24;
const baseSize = 628 - 2;
let ms = 150;

const initialState = {
  x: 5,
  y: 5,
  tails: [
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 3, y: 5 },
  ],
};
let snakeDirection = { dx: 0, dy: 0 };
let nextDirection = { dx: 0, dy: 0 };

const generateRandomCoordinates = (tails) => {
  const x = Math.floor(Math.random() * 25) + 1;
  const y = Math.floor(Math.random() * 25) + 1;
  const find = tails.find((item) => item.x === x && item.y === y);
  return find ? generateRandomCoordinates(tails) : { x, y };
};

function App() {
  const canvasRef = useRef(null);
  const [count, setCount] = useState(0);
  const [snake, setSnake] = useState(initialState);
  const [berry, setBerry] = useState(generateRandomCoordinates(snake.tails));

  const updateCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = baseSize;
    canvas.height = baseSize;

    context.clearRect(0, 0, canvas.width, canvas.height);

    drawBerry();
    drawSnake();
  };

  const drawBerry = () => {
    drawCustomSquare(berry.x, berry.y, '#E2060F');
  };

  const drawSnake = () => {
    let tails = [];
    snakeDirection = nextDirection;

    const { dx, dy } = snakeDirection;
    const { x, y } = snake;

    if (dx !== 0 || dy !== 0) {
      const newX = x > 25 ? 1 : x < 1 ? 25 : x + dx;
      const newY = y > 25 ? 1 : y < 1 ? 25 : y + dy;
      tails = [{ x: newX, y: newY }, ...snake.tails];

      if (newX === berry.x && newY === berry.y) {
        if (ms > 50 && (count + 1) % 20 === 0) {
          ms -= 10;
        }
        setCount((prev) => prev + 1);
        setBerry(generateRandomCoordinates(tails));
      } else {
        tails.pop();
      }

      const collision = tails.slice(1).some((segment) => segment.x === newX && segment.y === newY);
      if (collision) {
        refreshGame();
        return;
      }
      setSnake({ x: newX, y: newY, tails });
    } else {
      tails = snake.tails;
    }
    tails.forEach((segment, index) => {
      drawCustomSquare(segment.x, segment.y, index === 0 ? '#0b1215' : '#343233');
    });
  };

  const refreshGame = () => {
    alert(`Game over! Your score is ${count}.`);
    setSnake(initialState);
    setBerry(generateRandomCoordinates(initialState.tails));
    setCount(0);
    snakeDirection = { dx: 0, dy: 0 };
    nextDirection = { dx: 0, dy: 0 };
    ms = 150;
  };

  const drawCustomSquare = (x, y, color) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    context.fillStyle = color;
    context.fillRect((x - 1) * sizeCell + x, (y - 1) * sizeCell + y, sizeCell, sizeCell);

    context.clearRect((x - 1) * sizeCell + x + 1, (y - 1) * sizeCell + y + 1, sizeCell - 2, sizeCell - 2);

    context.fillStyle = color;
    context.fillRect((x - 1) * sizeCell + x + 3, (y - 1) * sizeCell + y + 3, sizeCell - 6, sizeCell - 6);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      updateCanvas();
    }, ms);

    return () => clearInterval(interval);
  }, [snake, berry]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      console.log('snakeDirection', snakeDirection);
      let dx = 0,
        dy = 0;
      if (event.code === 'ArrowUp' && snakeDirection.dy !== 1) {
        dy = -1;
      } else if (event.code === 'ArrowLeft' && snakeDirection.dx !== 1) {
        if (snakeDirection.dx === 0 && snakeDirection.dy === 0) return;
        dx = -1;
      } else if (event.code === 'ArrowDown' && snakeDirection.dy !== -1) {
        dy = 1;
      } else if (event.code === 'ArrowRight' && snakeDirection.dx !== -1) {
        dx = 1;
      }
      if (dx !== 0 || dy !== 0) {
        nextDirection = { dx, dy };
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className='container'>
      <div className='score-container'>
        <span className='score-count'>{String(count).padStart(3, '0')}</span>
      </div>
      <div className='canvas-container'>
        <canvas ref={canvasRef}></canvas>
      </div>
    </div>
  );
}

export default App;

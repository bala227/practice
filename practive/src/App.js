import React, { useState, useEffect } from 'react';
import GridCell from './GridCell';
import './App.css';

const GRID_SIZE = 3;
const TREASURE_POS = [2, 2];
const OBSTACLES = [[1, 0], [1, 2]];
const ACTIONS = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
const MAX_EPISODES = 100; // Limit number of iterations
const CONVERGENCE_THRESHOLD = 5; // Number of successful optimal paths to declare game over

const App = () => {
  const [agentPos, setAgentPos] = useState([0, 0]);
  const [qValues, setQValues] = useState(initializeQValues());
  const [totalReward, setTotalReward] = useState(0);
  const [path, setPath] = useState([]);
  const [iteration, setIteration] = useState(0);
  const [successfulRuns, setSuccessfulRuns] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [stepIndex, setStepIndex] = useState(0); // Index to track the current step in the path
  const [gameStarted, setGameStarted] = useState(false); // New state for game started

  const isObstacle = ([x, y]) => OBSTACLES.some(([ox, oy]) => ox === x && oy === y);

  const getReward = (pos) => {
    if (JSON.stringify(pos) === JSON.stringify(TREASURE_POS)) return 10;
    if (isObstacle(pos)) return -5;
    return -1;
  };

  function initializeQValues() {
    const q = {};
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        q[`${i},${j}`] = { UP: 0, DOWN: 0, LEFT: 0, RIGHT: 0 };
      }
    }
    return q;
  }

  const getRandomAction = () => ACTIONS[Math.floor(Math.random() * ACTIONS.length)];

  const getNextPosition = (pos, action) => {
    let [x, y] = pos;
    if (action === 'UP') x = Math.max(0, x - 1);
    if (action === 'DOWN') x = Math.min(GRID_SIZE - 1, x + 1);
    if (action === 'LEFT') y = Math.max(0, y - 1);
    if (action === 'RIGHT') y = Math.min(GRID_SIZE - 1, y + 1);
    return [x, y];
  };

  const selectAction = (state) => {
    const actions = qValues[state];
    const greedyAction = Object.keys(actions).reduce((a, b) =>
      actions[a] > actions[b] ? a : b
    );

    return Math.random() < 0.1 ? getRandomAction() : greedyAction;
  };

  const runEpisode = () => {
    let pos = [0, 0];
    let episodePath = [[...pos]];
    let rewardSum = 0;
    let steps = 0;

    while (JSON.stringify(pos) !== JSON.stringify(TREASURE_POS) && steps < 20) {
      const state = `${pos[0]},${pos[1]}`;
      const action = selectAction(state);
      const nextPos = getNextPosition(pos, action);

      const reward = getReward(nextPos);
      rewardSum += reward;
      episodePath.push(nextPos);

      const nextState = `${nextPos[0]},${nextPos[1]}`;
      const updatedQValue =
        qValues[state][action] + 0.1 * (reward + Math.max(...Object.values(qValues[nextState])) - qValues[state][action]);

      setQValues((prevQ) => ({
        ...prevQ,
        [state]: { ...prevQ[state], [action]: updatedQValue },
      }));

      pos = nextPos;
      steps++;
      if (isObstacle(pos)) break; // Stop on obstacle
    }

    setTotalReward(rewardSum);
    setPath(episodePath);
    setIteration((prev) => prev + 1);

    if (JSON.stringify(pos) === JSON.stringify(TREASURE_POS)) {
      setSuccessfulRuns((prev) => prev + 1);
    } else {
      setSuccessfulRuns(0); // Reset if not successful
    }

    if (successfulRuns + 1 >= CONVERGENCE_THRESHOLD) {
      setGameOver(true); // Game over on convergence
    }

    setStepIndex(0);
    setAgentPos([0, 0]); // Reset agent position for the next episode
  };

  useEffect(() => {
    if (gameStarted && !gameOver && iteration < MAX_EPISODES) {
      const interval = setInterval(runEpisode, 1000);
      return () => clearInterval(interval);
    }
  }, [qValues, iteration, gameOver, gameStarted]); // Added gameStarted to dependencies

  useEffect(() => {
    if (path.length > 0 && stepIndex < path.length) {
      const moveInterval = setInterval(() => {
        setAgentPos(path[stepIndex]); // Move agent to the next position in the path
        setStepIndex((prev) => prev + 1); // Increment step index
      }, 1000); // Move every second

      return () => clearInterval(moveInterval);
    } else if (stepIndex >= path.length) {
      setAgentPos([0, 0]); // Reset agent position for the next episode
    }
  }, [path, stepIndex]);

  const startGame = () => {
    setGameStarted(true); // Start the game
  };

  return (
    <div className="container">
      <h1>Monte Carlo Control: Treasure Hunt</h1>
      {!gameStarted ? ( // Check if game has started
        <div>
          <h2>Start Game</h2>
          <button onClick={startGame}>Start</button>
        </div>
      ) : (
        <>
          <p>Iteration: {iteration}</p>
          <p>Total Reward: {totalReward}</p>
          <p>Successful Runs: {successfulRuns}</p>
          {gameOver && <h2>🎉 Game Over! Converged to optimal path! 🎉</h2>}
          <div className="grid">
            {Array.from({ length: GRID_SIZE }).map((_, i) =>
              Array.from({ length: GRID_SIZE }).map((_, j) => (
                <GridCell
                  key={`${i}-${j}`}
                  type={
                    JSON.stringify([i, j]) === JSON.stringify(TREASURE_POS)
                      ? 'treasure'
                      : isObstacle([i, j])
                      ? 'obstacle'
                      : 'empty'
                  }
                  isAgent={agentPos[0] === i && agentPos[1] === j}
                />
              ))
            )}
          </div>
          <div className="history">
            <h3>Last Episode Path:</h3>
            <ul style={{ display: "flex", gap: 20 }}>
              {path.map((p, index) => (
                <li key={index}>{`[${p[0]}, ${p[1]}]`}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default App;

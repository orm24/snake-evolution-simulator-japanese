import { placeSnake, moveSnakes, drawSnakes, handleSnakeCollisions, checkSnakeDeath } from './snake.js';
import { placeFood, drawFood, handleFoodCollisions } from './food.js';
import { clearBoard } from './board.js';
import { snakes, setBoard, setContext, getStopSimulation, setStopSimulation, foods } from './global.js';

// Var to hold the interval ID for the game loop 
// ゲームループのinterval IDを持つための変数
let intervalId = null; 

// Runs when window is first loaded sets the parameters of the game and adds event listeners to buttons
// This function initializes the game settings and attaches event listeners to the control buttons
// ウィンドウが開かれた時ゲームのパラメータを設定、ボタンにイベントリスナーを追加、ゲームを初期化
window.onload = function () {
    const cellSize = 25; // Size of each cell in the game grid
    const total_col = 20; // Total number of columns in the game grid
    const total_row = 20;

    window.cellSize = cellSize;
    window.total_col = total_col;
    window.total_row = total_row;

    const boardElement = document.getElementById("gameCanvas");
    boardElement.width = cellSize * total_col;
    boardElement.height = cellSize * total_row;

    setBoard(boardElement);
    const ctx = boardElement.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    setContext(ctx);

    document.getElementById('startButton').addEventListener('click', startSimulation);
    document.getElementById('stopButton').addEventListener('click', stopSimulation);
    document.getElementById('addFoodButton').addEventListener('click', placeFood);
    document.getElementById('restartButton').addEventListener('click', restartSimulation);

    restartSimulation(); // initial setup without auto-start
};

// Start the interval
function startSimulation() {
    if (intervalId !== null) return; // already running
    setStopSimulation(false);

    intervalId = setInterval(update, 1000 / 10);
}

// Stop the interval
function stopSimulation() {
    setStopSimulation(true);

    if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

// Restart everything with new input values
function restartSimulation() {
    stopSimulation(); // halt current run
    snakes.length = 0;
    foods.length = 0;

    const panel = document.getElementById('statusPanel');
    if (panel) panel.innerHTML = '';

    clearBoard();

    const femaleInputs = {
        speedA: parseFloat(document.getElementById("femaleSpeedA").value),
        speedB: parseFloat(document.getElementById("femaleSpeedB").value),
        efficiencyA: parseFloat(document.getElementById("femaleEnergyEfficiencyA").value),
        efficiencyB: parseFloat(document.getElementById("femaleEnergyEfficiencyB").value),
        energyA: parseFloat(document.getElementById("femaleStartEnergyA").value),
        energyB: parseFloat(document.getElementById("femaleStartEnergyB").value),
    };
    
    const maleInputs = {
        speedA: parseFloat(document.getElementById("maleSpeedA").value),
        speedB: parseFloat(document.getElementById("maleSpeedB").value),
        efficiencyA: parseFloat(document.getElementById("maleEnergyEfficiencyA").value),
        efficiencyB: parseFloat(document.getElementById("maleEnergyEfficiencyB").value),
        energyA: parseFloat(document.getElementById("maleStartEnergyA").value),
        energyB: parseFloat(document.getElementById("maleStartEnergyB").value),
    };
    
    placeSnake(0, femaleInputs); // Female
    placeSnake(1, maleInputs);   // Male
    
    placeFood();

    startSimulation() 
    update(); // draw initial state (optional)
}

// updates game board
function update() {
    if (getStopSimulation()) return;

    if (snakes.length > 50) {
        alert("Too many snakes, program ended.");
        stopSimulation();
        return;
    }

    clearBoard();
    moveSnakes();
    handleFoodCollisions();
    handleSnakeCollisions();
    checkSnakeDeath();
    drawFood();
    drawSnakes();
    updateStatusPanel();
}

function updateStatusPanel() {
    const panel = document.getElementById('statusPanel');
    if (!panel) return;

    panel.innerHTML = ''; // clear before updating

    // --- Compute averages ---
    if (snakes.length > 0) {
        const total = snakes.reduce((acc, s) => {
            acc.speed += s.speed;
            acc.energy += s.startEnergy;
            acc.efficiency += s.energyEfficiency;
            return acc;
        }, { speed: 0, energy: 0, efficiency: 0 });

        const avgSpeed = (total.speed / snakes.length).toFixed(2);
        const avgEnergy = (total.energy / snakes.length).toFixed(2);
        const avgEfficiency = (total.efficiency / snakes.length).toFixed(2);

        const avgHTML = `
            <div style="margin-bottom: 20px;">
                <strong>Averages:</strong><br>
                Speed: ${avgSpeed}<br>
                Start Energy: ${avgEnergy}<br>
                Energy Efficiency: ${avgEfficiency}
            </div>
        `;

        panel.innerHTML += avgHTML;
    }

    // --- List each snake ---
    snakes.forEach((s, index) => {
        const snakeInfo = `
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <div style="width: 16px; height: 16px; background-color: ${s.color}; border: 1px solid #000; margin-right: 8px;"></div>
                <div>
                    <strong>Snake ${index + 1}</strong><br>
                    Sex: ${s.sex === 0 ? 'Female' : 'Male'}<br>
                    Energy: ${Math.round(s.startEnergy)}<br>
                    Energy Remaining: ${Math.round(s.energy)}<br>
                    Speed: ${s.speed}<br>
                    Efficiency: ${s.energyEfficiency.toFixed(2)}<br>
                    Length: ${s.length}<br>
                    Cooldown: ${s.collisionCooldown}
                </div>
            </div>
        `;
        panel.innerHTML += snakeInfo;
    });
}


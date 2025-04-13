import { placeSnake, moveSnakes, drawSnakes, handleSnakeCollisions, checkSnakeDeath } from './snake.js';
import { placeFood, drawFood, handleFoodCollisions } from './food.js';
import { clearBoard } from './board.js';
import { snakes, setBoard, setContext, getStopSimulation, setStopSimulation, foods } from './global.js';

// ゲームループのinterval IDを持つための変数
let intervalId = null; 

// ウィンドウが開かれた時ゲームのパラメータを設定、ボタンにイベントリスナーを追加、ゲームを初期化
window.onload = function () {
    const cellSize = 25; // ゲームグリッドにおけるセルのサイズ
    const total_col = 20; // ゲームグリッドにおける列の合計
    const total_row = 20;　// ゲームグリッドにおける行の合計

    // 各値をグローバル化
    window.cellSize = cellSize;　
    window.total_col = total_col;
    window.total_row = total_row;

    // ゲーム表示のためのcanvasを取得
    const boardElement = document.getElementById("gameCanvas");
    // canvasの幅を設定
    boardElement.width = cellSize * total_col;
    // canvasの高さを設定
    boardElement.height = cellSize * total_row;

    setBoard(boardElement); // ゲームボードを初期化
    const ctx = boardElement.getContext("2d");　//２Dレンダリングコンテクストを取得
    ctx.imageSmoothingEnabled = false;　//imageSmoothingを解除
    setContext(ctx);　//コンテクストをグローバル化
    
    //ボタンにイベントリスナーを追加
    document.getElementById('startButton').addEventListener('click', startSimulation);
    document.getElementById('stopButton').addEventListener('click', stopSimulation);
    document.getElementById('addFoodButton').addEventListener('click', placeFood);
    document.getElementById('restartButton').addEventListener('click', restartSimulation);

    //ゲームスタート
    restartSimulation(); 
};

// ゲームループのインターバルを開始
function startSimulation() {
    if (intervalId !== null) return; // ゲームがスタートしているなら退出
    setStopSimulation(false);　//シミュレーションをスタート
    //　ゲームループが１００msごとにアップデートするように設定
    intervalId = setInterval(update, 1000 / 10);
}

// ゲームループのインターバルを停止
function stopSimulation() {
    setStopSimulation(true);　//　シミュレーションを停止

    if (intervalId !== null) {
        clearInterval(intervalId);　//　インターバルをクリア
        intervalId = null;　//　intervalIdをリセット
    }
}

// インプット値に基づき全てをリセット
function restartSimulation() {
    stopSimulation(); // シミュレーション停止
    //配列を空ける
    snakes.length = 0;　
    foods.length = 0;

    //　ステータスパネルのエレメントを取得
    const panel = document.getElementById('statusPanel');
    if (panel) panel.innerHTML = '';　//　ステータスパネルをアップデート前に一度空ける

    clearBoard();　//　ボードを初期化

    //　メス蛇の値を取得
    const femaleInputs = {
        speedA: parseFloat(document.getElementById("femaleSpeedA").value),
        speedB: parseFloat(document.getElementById("femaleSpeedB").value),
        efficiencyA: parseFloat(document.getElementById("femaleEnergyEfficiencyA").value),
        efficiencyB: parseFloat(document.getElementById("femaleEnergyEfficiencyB").value),
        energyA: parseFloat(document.getElementById("femaleStartEnergyA").value),
        energyB: parseFloat(document.getElementById("femaleStartEnergyB").value),
    };

    //　オス蛇の値を取得
    const maleInputs = {
        speedA: parseFloat(document.getElementById("maleSpeedA").value),
        speedB: parseFloat(document.getElementById("maleSpeedB").value),
        efficiencyA: parseFloat(document.getElementById("maleEnergyEfficiencyA").value),
        efficiencyB: parseFloat(document.getElementById("maleEnergyEfficiencyB").value),
        energyA: parseFloat(document.getElementById("maleStartEnergyA").value),
        energyB: parseFloat(document.getElementById("maleStartEnergyB").value),
    };
    
    placeSnake(0, femaleInputs); // メス設置
    placeSnake(1, maleInputs);   // オス設置
    
    placeFood();　//食べ物設置

    startSimulation() //　シミュレーション開始
    update(); 
}

// ゲームボードをアップデート
function update() {
    if (getStopSimulation()) return;　//シミュレーションが停止した場合退出

    //　ヘビが増えすぎた場合ユーザーにメッセージを出し強制終了
    if (snakes.length > 50) {　
        alert("Too many snakes, program ended.");
        stopSimulation();
        return;
    }

    clearBoard();　//　次のフレームのためボードを元に戻す
    moveSnakes();　//　ヘビを動かす
    handleFoodCollisions();　//　ヘビと食べ物の衝突を確認
    handleSnakeCollisions();　//　ヘビとヘビの衝突を確認
    checkSnakeDeath();　//　ヘビの生存確認
    drawFood();　//　食べ物をボードに描く
    drawSnakes();　//　ヘビをボードに描く
    updateStatusPanel();　//　ステータスパネルをアップデート
}

//　ステータスパネルをアップデートする関数
function updateStatusPanel() {
    const panel = document.getElementById('statusPanel');　//ステータスパネルを取得
    if (!panel) return;　//　パネルが見つからない場合退出

    panel.innerHTML = ''; // アップデート前に元に戻す

    // 平均値を計算
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

        //　平均値表示のためのHTML
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

    // 各ヘビを表示
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


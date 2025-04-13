export const total_row = 25;　// ゲームボードの合計行数を設定
export const total_col = 25;　// ゲームボードの合計列数を設定
export const blockSize = 20;　// ゲームボードのブロックの大きさを設定
export const borderRadiusFood = 20;　// 食べ物のborderRadius設定
export const borderRadiusSnake = 5;　// ヘビのborderRadius設定　現在使われていない

export let board;　// ゲームボードを持つ変数を設定
export let context;　// レンダリングコンテクストを持つ変数を設定
export let foods = [];　// 食べ物を持つ配列を初期化
export let snakes = [];　// ヘビを持つ配列を初期化
export let stopSimulation = false;　// シミュレーションの開始停止をコントロール変数を停止で初期化

// ゲームボードを設定する関数
export function setBoard(b){
    board = b;
}

// レンダリング・コンテクストを設定する関数
export function setContext(c){
    context = c;
}

// 現在のシミュレーションの進行状態を確認する関数
export function getStopSimulation(){
    return stopSimulation;
}

// 現在のシミュレーションの進行状態を設定する関数
export function setStopSimulation(value){
    stopSimulation = value;
}

// 食べ物を設定する関数
export function setFood(newFood){
    food = newFood;
}

// 食べ物を追加する関数
export function addFood(newFood){
    foods.push(newFood);
}

// 食べ物配列を空にする関数
export function clearFoods() {
    foods = [];
}

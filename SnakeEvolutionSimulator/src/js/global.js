export const total_row = 25;
export const total_col = 25;
export const blockSize = 20;
export const borderRadiusFood = 20;
export const borderRadiusSnake = 5;

export let board;
export let context;
export let foods = [];
export let snakes = [];
export let stopSimulation = false;

export function setBoard(b){
    board = b;
}

export function setContext(c){
    context = c;
}

export function getStopSimulation(){
    return stopSimulation;
}

export function setStopSimulation(value){
    stopSimulation = value;
}

export function setFood(newFood){
    food = newFood;
}

export function addFood(newFood){
    foods.push(newFood);
}

export function clearFoods() {
    foods = [];
}
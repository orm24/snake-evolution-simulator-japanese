import { foods, snakes } from './global.js';

// checks if position is occupied
export function isOccupied(x, y) {
    // Check if any food is at this position
    for (let f of foods) {
        if (f.xPosition === x && f.yPosition === y) {
            return true;
        }
    }

    // Check all snakes
    for (let s of snakes) {
        if (s.xPosition === x && s.yPosition === y) {
            return true;
        }
    }

    return false;
}

export function pickRandom(a, b) {
    return Math.random() < 0.5 ? a : b;
}

export function getRandomNumber(min, max){
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min +1)) + min;
}


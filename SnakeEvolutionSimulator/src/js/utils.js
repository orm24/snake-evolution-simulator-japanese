import { foods, snakes } from './global.js';

// （x、y）の位置が占領されているか確かめる関数
export function isOccupied(x, y) {
    // 食べ物が占領しているか確かめる
    for (let f of foods) {
        if (f.xPosition === x && f.yPosition === y) {
            return true;
        }
    }

    // ヘビが占領しているか確かめる
    for (let s of snakes) {
        if (s.xPosition === x && s.yPosition === y) {
            return true;
        }
    }

    return false;　//占領されていない場合返り値false
}

//　a、bの選択肢のうちどちらかをランダムで選ぶ関数
export function pickRandom(a, b) {
    return Math.random() < 0.5 ? a : b;
}

//　提示された最低値と最大値の間でランダムな数字を返す関数
export function getRandomNumber(min, max){
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min +1)) + min;
}


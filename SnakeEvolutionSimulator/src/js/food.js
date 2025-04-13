import { isOccupied } from './utils.js';
import { growSnake } from './snake.js';
import { total_row, total_col, blockSize, borderRadiusFood, context, foods, snakes, setFood, addFood, clearFoods} from './global.js';

/**
 * Food class 食べ物を象徴する
 * @param xPosition　食べ物のx値
 * @param yPosition　食べ物のy値
 * @param foodType　食べ物の種類
 */
class Food{
    constructor(xPosition, yPosition, foodType){
        this.xPosition = xPosition;
        this.yPosition = yPosition;
        this.foodType = foodType;
        // タイプ別に食べ物に色を与える
        this.color = foodType === "small" ?"yellow":
                     foodType === "medium" ? "orange":
                     foodType === "large" ? "red" : "white";
    } 
}

// 食べ物をボードに乗せる関数
export function placeFood(){
    let x, y;　// x、y値を保存する関数
    // 占領されてない位置を見つけるまでランダムなx、y値を生産
    do {
        x = Math.floor(Math.random() * total_col);
        y = Math.floor(Math.random() * total_row);
    } while (isOccupied(x, y));

    // ランダムで食べ物タイプを設定し、
    const types = ["small", "medium", "large"];
    const randomType = types[Math.floor(Math.random() * types.length)]
    // 食べ物を追加
    addFood(new Food(x, y, randomType));
}

// ヘビと食べ物の衝突を手がける関数
export function handleFoodCollisions() {
    for (let s of snakes) {　// 各ヘビにおいて
        // 補間されたヘビの道筋を再現
        for (let i = 0; i <= s.speed; i++) {
            const stepX = s.xPosition - s.xSpeed * i;
            const stepY = s.yPosition - s.ySpeed * i;

            // 各食べ物に対し
            for (let j = foods.length - 1; j >= 0; j--) {
                const f = foods[j];
                // ヘビと食べ物が衝突したかを確認
                if (stepX === f.xPosition && stepY === f.yPosition) {
                    console.log("Snake ate food at:", f.xPosition, f.yPosition);

                    // 衝突した場合タイプ別にエネルギーを補完
                    if (f.foodType === "small") {
                        s.energy += (100 * s.energyEfficiency);
                    } else if (f.foodType === "medium") {
                        s.energy += (200 * s.energyEfficiency);
                    } else if (f.foodType === "large") {
                        s.energy += (300 * s.energyEfficiency);
                        // ヘビの動きを３０フレーム分停止させる
                        s.foodBreak = 30;
                    }

                    growSnake(s);　// ヘビを成長させる
                    foods.splice(j, 1); // 食べられた食べ物を欠除
                    placeFood();  // 新しい食べ物をおく
                    break; // 衝突が解決したためループを脱出
                }
            }
        }
    }
}


// 食べ物を描く関数
export function drawFood(){
    for (const f of foods){
        context.beginPath();
        context.roundRect(
            f.xPosition * blockSize,
            f.yPosition * blockSize,
            blockSize,
            blockSize,
            borderRadiusFood
        );
        context.fillStyle = f.color;
        context.fill();
        context.closePath();
    }
}

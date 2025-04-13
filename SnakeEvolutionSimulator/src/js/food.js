import { isOccupied } from './utils.js';
import { growSnake } from './snake.js';
import { total_row, total_col, blockSize, borderRadiusFood, context, foods, snakes, setFood, addFood, clearFoods} from './global.js';

/**
 * food class
 * @param xPosition
 * @param yPosition
 * @param foodType
 */
class Food{
    constructor(xPosition, yPosition, foodType){
        this.xPosition = xPosition;
        this.yPosition = yPosition;
        this.foodType = foodType;
        this.color = foodType === "small" ?"yellow":
                     foodType === "medium" ? "orange":
                     foodType === "large" ? "red" : "white";
    } 
}

export function placeFood(){
    let x, y;
    do {
        x = Math.floor(Math.random() * total_col);
        y = Math.floor(Math.random() * total_row);
    } while (isOccupied(x, y));
    
    const types = ["small", "medium", "large"];
    const randomType = types[Math.floor(Math.random() * types.length)]
    addFood(new Food(x, y, randomType));
}

export function handleFoodCollisions() {
    for (let s of snakes) {
        // Recreate the interpolated path the snake is taking this frame
        for (let i = 0; i <= s.speed; i++) {
            const stepX = s.xPosition - s.xSpeed * i;
            const stepY = s.yPosition - s.ySpeed * i;

            for (let j = foods.length - 1; j >= 0; j--) {
                const f = foods[j];

                if (stepX === f.xPosition && stepY === f.yPosition) {
                    console.log("Snake ate food at:", f.xPosition, f.yPosition);

                    if (f.foodType === "small") {
                        s.energy += (100 * s.energyEfficiency);
                    } else if (f.foodType === "medium") {
                        s.energy += (200 * s.energyEfficiency);
                    } else if (f.foodType === "large") {
                        s.energy += (300 * s.energyEfficiency);
                        s.foodBreak = 30;
                    }

                    growSnake(s);
                    foods.splice(j, 1); // remove the food that was eaten
                    placeFood();        // spawn a new one
                    break; // Exit loop since a collision was handled
                }
            }
        }
    }
}



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

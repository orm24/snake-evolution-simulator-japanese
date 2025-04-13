import { isOccupied, getRandomNumber, pickRandom } from './utils.js';
import { total_row, total_col, blockSize, borderRadiusSnake, context, snakes} from './global.js';

/**
 * snake class
 * @param xPosition
 * @param yPosition
 * @param speed
 * @param sex 0 female, 1 male
 * @param energyEfficiency
 * @param energy
 * @param startEnergy
 */
class Snake{
    constructor(xPosition, yPosition, sex, speedA, energyEfficiencyA, startEnergyA, speedB, energyEfficiencyB, startEnergyB){
        this.xPosition = xPosition;
        this.yPosition = yPosition;
        this.xSpeed = 1;
        this.ySpeed = 0;
        
        this.speedA = speedA;
        this.speedB = speedB;
        this.energyEfficiencyA = energyEfficiencyA;
        this.energyEfficiencyB = energyEfficiencyB;
        this.startEnergyA = startEnergyA;
        this.startEnergyB = startEnergyB;
        
        this.speed = (speedA + speedB) /2;
        this.startEnergy = (startEnergyA + startEnergyB) /2;
        this.energyEfficiency = (energyEfficiencyA + energyEfficiencyB)/2;

        this.energy = this.startEnergy;
        this.foodBreak = 0;
        this.length = 1;
        this.body = [{ x: xPosition, y: yPosition}];

        this.sex = sex;
        const red = Math.min(255, Math.floor((this.speed / 3) * 255));
        const green = Math.min(255, Math.floor((this.energyEfficiency / 3) * 255));
        const blue = Math.min(255, Math.floor((this.startEnergy / 1000) * 255));

        // boost one channel based on sex
        if (sex === 0) {
            // Female: more red
            this.color = `rgb(${Math.min(255, red + 50)},${green},${blue})`;
        } else {
            // Male: more blue
            this.color = `rgb(${red},${green},${Math.min(255, blue + 50)})`;
        }


        this.collisionCooldown = 0;
    }

    getHead(){
        return { x: this.xPosition, y: this.yPosition};
    }
}

export function placeSnake(sex, config = null){
    let x, y;
    do {
        x = Math.floor(Math.random() * total_col);
        y = Math.floor(Math.random() * total_row);
    } while (isOccupied(x, y));

    if (!config) {
        config = {
            speedA: Math.random() * 2 + 1,
            speedB: Math.random() * 2 + 1,
            efficiencyA: Math.random() * 2 + 1,
            efficiencyB: Math.random() * 2 + 1,
            energyA: getRandomNumber(500, 1000),
            energyB: getRandomNumber(500, 1000),
        };
    }

    const newSnake = new Snake(
        x, y, sex,
        config.speedA, config.efficiencyA, config.energyA,
        config.speedB, config.efficiencyB, config.energyB
    );

    snakes.push(newSnake);
}


export function growSnake(snake){
    snake.length += 1;
}

export function checkSnakeDeath(){
    snakes.splice(0, snakes.length, ...snakes.filter(s => s.energy > 0));
}



export function handleSnakeCollisions() {
    for (let i = 0; i < snakes.length; i++) {
        const s = snakes[i];

        for (let j = i + 1; j < snakes.length; j++) {
            const p = snakes[j];

            // Skip if either is on cooldown
            if (s.collisionCooldown > 0 || p.collisionCooldown > 0) continue;

            for (let a = 0; a <= s.speed; a++) {
                const stepSX = s.xPosition - s.xSpeed * a;
                const stepSY = s.yPosition - s.ySpeed * a;

                for (let b = 0; b <= p.speed; b++) {
                    const stepPX = p.xPosition - p.xSpeed * b;
                    const stepPY = p.yPosition - p.ySpeed * b;

                    if (stepSX === stepPX && stepSY === stepPY) {
                        // Only reproduce if opposite sex
                        if (s.sex !== p.sex) {
                            console.log(`Collision detected at (${stepSX}, ${stepSY}) between opposite sexes`);

                            // Reproduce
                            let x, y;
                            do {
                                x = Math.floor(Math.random() * total_col);
                                y = Math.floor(Math.random() * total_row);
                            } while (isOccupied(x, y));

                            const baby = new Snake(
                                x, y,
                                Math.floor(Math.random() * 2), // assign random sex: 0 or 1
                                pickRandom(s.speedA, s.speedB),
                                pickRandom(s.energyEfficiencyA, s.energyEfficiencyB),
                                pickRandom(s.startEnergyA, s.startEnergyB),
                                pickRandom(p.speedA, p.speedB),
                                pickRandom(p.energyEfficiencyA, p.energyEfficiencyB),
                                pickRandom(p.startEnergyA, p.startEnergyB)
                            );
                            
                            
                            // console.log(`Placed baby snake with speed: ${speed}, energy: ${startEnergy}`);
                            snakes.push(baby);

                            s.energy -= 50;
                            p.energy -= 50;
                            s.collisionCooldown = 20;
                            p.collisionCooldown = 20;

                            // Exit inner loops
                            a = s.speed + 1;
                            break;
                        }
                    }
                }
            }
        }
    }
}



// change Direction of movement
/**
 * 0 - up
 * 1 - right
 * 2 - down
 * 3 - left
 */
function changeDirection() {
    for (let s of snakes) {
        if (Math.random() < 0.1) {
            const directions = [
                { x: 0, y: 1 },   // down
                { x: 1, y: 0 },   // right
                { x: 0, y: -1 },  // up
                { x: -1, y: 0 }   // left
            ];

            const validDirections = directions.filter(d => {
                const newX = s.xPosition + d.x * s.speed;
                const newY = s.yPosition + d.y * s.speed;
                return newX >= 0 && newX < total_col && newY >= 0 && newY < total_row;
            });

            if (validDirections.length > 0) {
                const dir = validDirections[Math.floor(Math.random() * validDirections.length)];
                s.xSpeed = dir.x;
                s.ySpeed = dir.y;
            }
        }
    }
}

export function moveSnakes(){
    changeDirection();
    for (let s of snakes){
        if(s.collisionCooldown > 0) s.collisionCooldown -= 1;
       
        if(s.foodBreak <= 0){
            const prevX = s.xPosition;
            const prevY = s.yPosition;

            let nextX = s.xPosition + s.xSpeed * s.speed;
            let nextY = s.yPosition + s.ySpeed * s.speed;

            // reverse direction if needed
            if(nextX < 0 || nextX >= total_col){
                s.xSpeed *= -1;
                nextX = s.xPosition + s.xSpeed * s.speed;
            }
            if(nextY < 0 || nextY >= total_row){
                s.ySpeed *= -1;
                nextY = s.yPosition + s.ySpeed * s.speed;
            }

            // Move head
            s.xPosition = nextX;
            s.yPosition = nextY;


            // interpolate body
            for (let i = 1; i <= s.speed; i++) {
                const interpolatedX = prevX + (s.xSpeed * i);
                const interpolatedY = prevY + (s.ySpeed * i);

                // keep interpolation in bounds
                if (interpolatedX >= 0 && interpolatedX < total_col && interpolatedY >= 0 && interpolatedY < total_row){
                    s.body.unshift({ x: interpolatedX, y: interpolatedY});
                }
                
            }
            
            
            while(s.body.length > s.length){
                s.body.pop(); //remove tail
            }

            s.energy -= 2;
        } else {
            s.foodBreak -= 1;
            s.energy -= 1;
        }  
    }
}



export function drawSnakes(){
    for (let s of snakes){
        // console.log("Drawing snake at positions:", s.body);
        context.fillStyle = s.color;
        context.beginPath();
        if (s.body.length < 2) {
            const head = s.body[0];
            context.beginPath();
            context.arc(
                head.x * blockSize + blockSize / 2,
                head.y * blockSize + blockSize / 2,
                blockSize / 2,
                0, Math.PI * 2
            );
            context.fillStyle = s.color;
            context.fill();
            context.closePath();
            continue;
        }        
        for (let i = 0; i < s.body.length - 1; i++) {
            const a = s.body[i];
            const b = s.body[i + 1];
            context.moveTo(a.x * blockSize + blockSize / 2, a.y * blockSize + blockSize / 2);
            context.lineTo(b.x * blockSize + blockSize / 2, b.y * blockSize + blockSize / 2);
        }
        context.lineWidth = blockSize;
        context.strokeStyle = s.color;
        context.lineJoin = "round";
        context.lineCap = "round";
        context.stroke();
        context.closePath();
    }
}








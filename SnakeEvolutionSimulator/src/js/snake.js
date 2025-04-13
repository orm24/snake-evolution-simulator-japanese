import { isOccupied, getRandomNumber, pickRandom } from './utils.js';
import { total_row, total_col, blockSize, borderRadiusSnake, context, snakes} from './global.js';

/**
 * Snake class　ヘビを象徴する
 * 
 * @param xPosition - ヘビのx値
 * @param yPosition - ヘビのy値
 * @param sex - ヘビの性別　0 メス, 1 オス
 * @param speedA - ヘビのスピードA
 * @param speedB - ヘビのスピードB
 * @param energyEfficiencyA - ヘビのエネルギー変換効率A
 * @param energyEfficiencyB - ヘビのエネルギー変換効率B
 * @param startEnergyA - ヘビの初期エネルギーA
 * @param startEnergyB - ヘビの初期エネルギーB
 */
class Snake{
    constructor(xPosition, yPosition, sex, speedA, energyEfficiencyA, startEnergyA, speedB, energyEfficiencyB, startEnergyB){
        this.xPosition = xPosition;
        this.yPosition = yPosition;
        //　ヘビの向かう方向をコントロール
        this.xSpeed = 1;
        this.ySpeed = 0;
        
        this.speedA = speedA;
        this.speedB = speedB;
        this.energyEfficiencyA = energyEfficiencyA;
        this.energyEfficiencyB = energyEfficiencyB;
        this.startEnergyA = startEnergyA;
        this.startEnergyB = startEnergyB;

        //　各要素の平均値
        this.speed = (speedA + speedB) /2;
        this.startEnergy = (startEnergyA + startEnergyB) /2;
        this.energyEfficiency = (energyEfficiencyA + energyEfficiencyB)/2;

        
        this.energy = this.startEnergy;　//　ゲームにおけるヘビの残りエネルギー
        this.foodBreak = 0;　//　食事による停止フレーム
        this.length = 1;　//　ヘビの長さ
        this.body = [{ x: xPosition, y: yPosition}];　//　ヘビのからだ

        this.sex = sex;　//　ヘビの性別

        //　ヘビの性質に基づき色合いを変化
        const red = Math.min(255, Math.floor((this.speed / 3) * 255));
        const green = Math.min(255, Math.floor((this.energyEfficiency / 3) * 255));
        const blue = Math.min(255, Math.floor((this.startEnergy / 1000) * 255));

        // 性別により色に変化
        if (sex === 0) {
            // メスは赤を強調
            this.color = `rgb(${Math.min(255, red + 50)},${green},${blue})`;
        } else {
            // オスは青を強調
            this.color = `rgb(${red},${green},${Math.min(255, blue + 50)})`;
        }

        //　ヘビが生殖して次に生殖できるまでのカウント
        this.collisionCooldown = 0;
    }

    //　ヘビの頭の位置を返す関数
    getHead(){
        return { x: this.xPosition, y: this.yPosition};
    }
}

//　ヘビを設置する関数
export function placeSnake(sex, config = null){
    let x, y;　//　x、y値を初期化
    //　占領されていない位置を見つけるまでランダムな位置を選ぶ
    do {
        x = Math.floor(Math.random() * total_col);
        y = Math.floor(Math.random() * total_row);
    } while (isOccupied(x, y));

    //　ヘビのコンフィグがない場合ランダムでヘビのパラメータを選ぶ
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

    //　コンフィグに基づきヘビを生成
    const newSnake = new Snake(
        x, y, sex,
        config.speedA, config.efficiencyA, config.energyA,
        config.speedB, config.efficiencyB, config.energyB
    );

    //　ヘビを追加する
    snakes.push(newSnake);
}

//　ヘビを成長させる関数
export function growSnake(snake){
    snake.length += 1;
}

//　ヘビの残りエネルギーを確認し、それが０の場合ヘビを欠除する（死亡）
export function checkSnakeDeath(){
    snakes.splice(0, snakes.length, ...snakes.filter(s => s.energy > 0));
}


//　ヘビ同士が衝突した場合を手がける関数
export function handleSnakeCollisions() {
    for (let i = 0; i < snakes.length; i++) {
        const s = snakes[i]; //　今のヘビを取得

        for (let j = i + 1; j < snakes.length; j++) {
            const p = snakes[j];　//　他のヘビを取得

            // どちらかが生殖クールダウンに入っている場合スキップ
            if (s.collisionCooldown > 0 || p.collisionCooldown > 0) continue;

            for (let a = 0; a <= s.speed; a++) {
                //　ヘビがいるかもしれない場所を計算
                const stepSX = s.xPosition - s.xSpeed * a;　
                const stepSY = s.yPosition - s.ySpeed * a;

                for (let b = 0; b <= p.speed; b++) {
                    //　ヘビがいるかもしれない場所を計算
                    const stepPX = p.xPosition - p.xSpeed * b;
                    const stepPY = p.yPosition - p.ySpeed * b;

                    //　ヘビが同じ位置にいて、
                    if (stepSX === stepPX && stepSY === stepPY) {
                        // 同性でないのならば、
                        if (s.sex !== p.sex) {
                            console.log(`Collision detected at (${stepSX}, ${stepSY}) between opposite sexes`);

                            // 生殖
                            // 占領されてないスペースを見つけるまでランダムに位置を検索する
                            let x, y;
                            do {
                                x = Math.floor(Math.random() * total_col);
                                y = Math.floor(Math.random() * total_row);
                            } while (isOccupied(x, y));

                            //　親のランダムで選ばれたどちらかの遺伝子の基づいて子供を制作
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
                            
                            
                            // 子供ヘビを追加
                            snakes.push(baby);

                            //　生殖によって親のエネルギーが減る
                            s.energy -= 50;
                            p.energy -= 50;
                            //　親は生殖クールダウンに入る
                            s.collisionCooldown = 20;
                            p.collisionCooldown = 20;

                            // ループを退出
                            a = s.speed + 1;
                            break;
                        }
                    }
                }
            }
        }
    }
}



// ヘビの進む方向を変える関数
function changeDirection() {
    for (let s of snakes) {
        //　ランダムで方向を変えるか決める
        if (Math.random() < 0.1) {
            const directions = [
                { x: 0, y: 1 },   // 下
                { x: 1, y: 0 },   // 右
                { x: 0, y: -1 },  // 上
                { x: -1, y: 0 }   // 左
            ];

            //　行ける方向か確かめる
            const validDirections = directions.filter(d => {
                const newX = s.xPosition + d.x * s.speed;
                const newY = s.yPosition + d.y * s.speed;
                return newX >= 0 && newX < total_col && newY >= 0 && newY < total_row;
            });

            //　行ける方向があるならばそれにランダムに設定する
            if (validDirections.length > 0) {
                const dir = validDirections[Math.floor(Math.random() * validDirections.length)];
                s.xSpeed = dir.x;
                s.ySpeed = dir.y;
            }
        }
    }
}

//　ヘビを動かす関数
export function moveSnakes(){
    //　ヘビの方向を変える
    changeDirection();
    for (let s of snakes){
        if(s.collisionCooldown > 0) s.collisionCooldown -= 1;　//　生殖クールダウンがあればその値を１減らす

        //　食事による行動停止を受けていない場合、
        if(s.foodBreak <= 0){
            const prevX = s.xPosition;　//　前のx値を保存
            const prevY = s.yPosition;　//　前のy値を保存

            let nextX = s.xPosition + s.xSpeed * s.speed;　//次のx値を計算
            let nextY = s.yPosition + s.ySpeed * s.speed;　//次のy値を計算

            // 方向転換が必要ならばする
            if(nextX < 0 || nextX >= total_col){
                s.xSpeed *= -1;
                nextX = s.xPosition + s.xSpeed * s.speed;
            }
            if(nextY < 0 || nextY >= total_row){
                s.ySpeed *= -1;
                nextY = s.yPosition + s.ySpeed * s.speed;
            }

            // ヘビの頭を動かす
            s.xPosition = nextX;
            s.yPosition = nextY;


            // 体の位置を補間する
            for (let i = 1; i <= s.speed; i++) {
                const interpolatedX = prevX + (s.xSpeed * i);
                const interpolatedY = prevY + (s.ySpeed * i);

                // 体の補間がボード外に出ないように管理
                if (interpolatedX >= 0 && interpolatedX < total_col && interpolatedY >= 0 && interpolatedY < total_row){
                    s.body.unshift({ x: interpolatedX, y: interpolatedY});
                }
                
            }
            
            //　体の長さが長さより長い間
            while(s.body.length > s.length){
                s.body.pop(); //しっぽを欠除
            }

            s.energy -= 2;　//　行動によるエネルギー消費
        } else {
            s.foodBreak -= 1;　//　食事停止期間を減らす
            s.energy -= 1;　//　消化によるエネルギー消費
        }  
    }
}


//　ヘビを描く
export function drawSnakes(){
    for (let s of snakes){
        context.fillStyle = s.color;
        context.beginPath();
        //　頭だけの場合
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
        //　体を描く
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








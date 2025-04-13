import { board, context, total_col, total_row, blockSize} from './global.js';

// clears board and resets it
export function clearBoard(){
    context.fillStyle = "#476930";
    context.fillRect(0, 0, board.width, board.height);
}

export function drawGrid() {
    context.strokeStyle = "#a3b18a";
    context.lineWidth = 1; 


    for (let i = 0; i <= total_row; i++) {
        context.beginPath();
        context.moveTo(0, i * blockSize);
        context.lineTo(total_col * blockSize, i * blockSize);
        context.stroke();
    }

    for (let j = 0; j <= total_col; j++) {
        context.beginPath();
        context.moveTo(j * blockSize, 0);
        context.lineTo(j * blockSize, total_row * blockSize);
        context.stroke();
    }
}

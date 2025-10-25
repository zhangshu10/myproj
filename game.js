// 五子棋游戏类
class Gomoku {
    constructor() {
        this.canvas = document.getElementById('game-board');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 15; // 15x15棋盘
        this.cellSize = 50; // 每个格子的大小
        this.pieceRadius = 20; // 棋子半径
        this.board = []; // 棋盘数组
        this.currentPlayer = 'black'; // 当前玩家
        this.gameOver = false; // 游戏是否结束
        this.lastMove = null; // 最后一步
        this.gameMode = null; // 游戏模式: 'pvp' 或 'pvc'
        this.aiPlayer = 'white'; // AI玩家的颜色
        this.isAiThinking = false; // AI是否正在思考
        
        this.initModeSelection();
    }
    
    // 初始化模式选择
    initModeSelection() {
        document.getElementById('pvp-btn').addEventListener('click', () => {
            this.startGame('pvp');
        });
        
        document.getElementById('pvc-btn').addEventListener('click', () => {
            this.startGame('pvc');
        });
        
        document.getElementById('change-mode-btn').addEventListener('click', () => {
            this.backToModeSelection();
        });
    }
    
    // 开始游戏
    startGame(mode) {
        this.gameMode = mode;
        
        // 隐藏模式选择，显示游戏界面
        document.getElementById('mode-selection').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';
        
        // 更新模式显示
        const modeText = document.getElementById('mode-text');
        modeText.textContent = mode === 'pvp' ? '👥 双人对战' : '🤖 人机对战';
        
        this.init();
    }
    
    // 返回模式选择
    backToModeSelection() {
        document.getElementById('mode-selection').style.display = 'block';
        document.getElementById('game-container').style.display = 'none';
        this.gameMode = null;
    }
    
    // 初始化游戏
    init() {
        // 初始化棋盘数组
        for (let i = 0; i < this.gridSize; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.gridSize; j++) {
                this.board[i][j] = null;
            }
        }
        
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.lastMove = null;
        this.isAiThinking = false;
        
        // 绘制棋盘
        this.drawBoard();
        
        // 添加点击事件
        this.canvas.onclick = (e) => this.handleClick(e);
        
        // 添加鼠标移动事件（显示预览）
        this.canvas.onmousemove = (e) => this.handleMouseMove(e);
        this.canvas.onmouseleave = () => this.clearPreview();
        
        // 重新开始按钮
        document.getElementById('restart-btn').onclick = () => this.restart();
        document.getElementById('play-again-btn').onclick = () => this.restart();
        
        this.updatePlayerTurn();
    }
    
    // 绘制棋盘
    drawBoard() {
        const ctx = this.ctx;
        const size = this.cellSize;
        const gridSize = this.gridSize;
        
        // 清空画布
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制木纹背景
        ctx.fillStyle = '#dcb35c';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格线
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < gridSize; i++) {
            // 绘制横线
            ctx.beginPath();
            ctx.moveTo(size, size + i * size);
            ctx.lineTo(size + (gridSize - 1) * size, size + i * size);
            ctx.stroke();
            
            // 绘制竖线
            ctx.beginPath();
            ctx.moveTo(size + i * size, size);
            ctx.lineTo(size + i * size, size + (gridSize - 1) * size);
            ctx.stroke();
        }
        
        // 绘制天元和星位
        const stars = [
            [3, 3], [3, 11], [11, 3], [11, 11], [7, 7]
        ];
        
        ctx.fillStyle = '#000';
        stars.forEach(([x, y]) => {
            ctx.beginPath();
            ctx.arc(size + x * size, size + y * size, 4, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // 重新绘制所有棋子
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (this.board[i][j]) {
                    this.drawPiece(i, j, this.board[i][j]);
                }
            }
        }
        
        // 标记最后一步
        if (this.lastMove) {
            const [x, y] = this.lastMove;
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(size + x * size, size + y * size, this.pieceRadius - 5, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    // 绘制棋子
    drawPiece(x, y, color, alpha = 1) {
        const ctx = this.ctx;
        const centerX = this.cellSize + x * this.cellSize;
        const centerY = this.cellSize + y * this.cellSize;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        
        // 绘制棋子阴影
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        
        // 绘制棋子
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.pieceRadius, 0, Math.PI * 2);
        
        if (color === 'black') {
            const gradient = ctx.createRadialGradient(
                centerX - 5, centerY - 5, 2,
                centerX, centerY, this.pieceRadius
            );
            gradient.addColorStop(0, '#666');
            gradient.addColorStop(1, '#000');
            ctx.fillStyle = gradient;
        } else {
            const gradient = ctx.createRadialGradient(
                centerX - 5, centerY - 5, 2,
                centerX, centerY, this.pieceRadius
            );
            gradient.addColorStop(0, '#fff');
            gradient.addColorStop(1, '#ddd');
            ctx.fillStyle = gradient;
        }
        
        ctx.fill();
        
        // 添加边框
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = color === 'black' ? '#000' : '#999';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();
    }
    
    // 处理点击事件
    handleClick(e) {
        if (this.gameOver || this.isAiThinking) return;
        
        // 如果是人机模式且轮到AI，不处理点击
        if (this.gameMode === 'pvc' && this.currentPlayer === this.aiPlayer) {
            return;
        }
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 转换为网格坐标
        const gridX = Math.round((x - this.cellSize) / this.cellSize);
        const gridY = Math.round((y - this.cellSize) / this.cellSize);
        
        // 检查是否在有效范围内
        if (gridX < 0 || gridX >= this.gridSize || gridY < 0 || gridY >= this.gridSize) {
            return;
        }
        
        // 检查该位置是否已有棋子
        if (this.board[gridX][gridY]) {
            this.showMessage('该位置已有棋子！', 'error');
            return;
        }
        
        // 落子
        this.makeMove(gridX, gridY);
    }
    
    // 落子
    makeMove(x, y) {
        this.board[x][y] = this.currentPlayer;
        this.lastMove = [x, y];
        this.drawBoard();
        
        // 检查胜负
        if (this.checkWin(x, y)) {
            this.gameOver = true;
            this.showWinner(this.currentPlayer);
            return;
        }
        
        // 检查是否平局
        if (this.checkDraw()) {
            this.gameOver = true;
            this.showWinner('draw');
            return;
        }
        
        // 切换玩家
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
        this.updatePlayerTurn();
        
        // 如果是人机模式且轮到AI，让AI下棋
        if (this.gameMode === 'pvc' && this.currentPlayer === this.aiPlayer && !this.gameOver) {
            this.aiMove();
        }
    }
    
    // AI下棋
    aiMove() {
        this.isAiThinking = true;
        this.showMessage('🤖 AI思考中...', 'info');
        
        // 延迟一下，让用户看到AI在思考
        setTimeout(() => {
            const move = this.getBestMove();
            if (move) {
                this.makeMove(move.x, move.y);
            }
            this.isAiThinking = false;
        }, 500);
    }
    
    // 获取最佳落子位置
    getBestMove() {
        const emptyCells = [];
        
        // 如果是第一步，下在中心附近
        let hasPiece = false;
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.board[i][j]) {
                    hasPiece = true;
                    break;
                }
            }
            if (hasPiece) break;
        }
        
        if (!hasPiece) {
            // 第一步，在中心附近随机落子
            const center = Math.floor(this.gridSize / 2);
            const offset = [-1, 0, 1];
            const dx = offset[Math.floor(Math.random() * 3)];
            const dy = offset[Math.floor(Math.random() * 3)];
            return { x: center + dx, y: center + dy };
        }
        
        // 只评估有棋子附近的位置（优化性能）
        const consideredCells = new Set();
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.board[i][j]) {
                    // 在已有棋子周围2格内的空位置
                    for (let di = -2; di <= 2; di++) {
                        for (let dj = -2; dj <= 2; dj++) {
                            const ni = i + di;
                            const nj = j + dj;
                            if (ni >= 0 && ni < this.gridSize && 
                                nj >= 0 && nj < this.gridSize && 
                                !this.board[ni][nj]) {
                                consideredCells.add(`${ni},${nj}`);
                            }
                        }
                    }
                }
            }
        }
        
        // 转换为数组
        consideredCells.forEach(cell => {
            const [x, y] = cell.split(',').map(Number);
            emptyCells.push({ x, y });
        });
        
        if (emptyCells.length === 0) return null;
        
        // 评估每个位置的得分
        let bestScore = -Infinity;
        let bestMoves = [];
        
        for (let cell of emptyCells) {
            const score = this.evaluatePosition(cell.x, cell.y);
            
            if (score > bestScore) {
                bestScore = score;
                bestMoves = [cell];
            } else if (score === bestScore) {
                bestMoves.push(cell);
            }
        }
        
        // 从最佳位置中随机选择一个
        return bestMoves[Math.floor(Math.random() * bestMoves.length)];
    }
    
    // 评估位置得分
    evaluatePosition(x, y) {
        // 评估AI在该位置的得分（进攻）
        const aiScore = this.getScoreForPlayer(x, y, this.aiPlayer);
        
        // 评估对手在该位置的得分（防守）
        const opponentPlayer = this.aiPlayer === 'black' ? 'white' : 'black';
        const opponentScore = this.getScoreForPlayer(x, y, opponentPlayer);
        
        // 防守的权重稍微高一点
        return aiScore + opponentScore * 1.1;
    }
    
    // 获取某个玩家在某个位置的得分
    getScoreForPlayer(x, y, player) {
        let totalScore = 0;
        
        // 四个方向：横、竖、左斜、右斜
        const directions = [
            [1, 0],   // 横向
            [0, 1],   // 纵向
            [1, 1],   // 主对角线
            [1, -1]   // 副对角线
        ];
        
        for (let [dx, dy] of directions) {
            const line = this.getLine(x, y, dx, dy, player);
            const score = this.evaluateLine(line);
            totalScore += score;
        }
        
        return totalScore;
    }
    
    // 获取某个方向上的棋型
    getLine(x, y, dx, dy, player) {
        let line = [1]; // 中间是要下的位置，用1表示
        
        // 向一个方向扩展
        for (let i = 1; i <= 4; i++) {
            const nx = x + dx * i;
            const ny = y + dy * i;
            if (nx < 0 || nx >= this.gridSize || ny < 0 || ny >= this.gridSize) {
                line.push(-1); // 边界
                break;
            }
            if (this.board[nx][ny] === player) {
                line.push(1); // 己方棋子
            } else if (this.board[nx][ny] === null) {
                line.push(0); // 空位
            } else {
                line.push(-1); // 对方棋子
                break;
            }
        }
        
        // 向另一个方向扩展
        const reverseLine = [];
        for (let i = 1; i <= 4; i++) {
            const nx = x - dx * i;
            const ny = y - dy * i;
            if (nx < 0 || nx >= this.gridSize || ny < 0 || ny >= this.gridSize) {
                reverseLine.push(-1);
                break;
            }
            if (this.board[nx][ny] === player) {
                reverseLine.push(1);
            } else if (this.board[nx][ny] === null) {
                reverseLine.push(0);
            } else {
                reverseLine.push(-1);
                break;
            }
        }
        
        return [...reverseLine.reverse(), ...line];
    }
    
    // 评估棋型得分
    evaluateLine(line) {
        const str = line.join('');
        
        // 连五：必胜
        if (str.includes('11111')) return 100000;
        
        // 活四：下一步必胜
        if (str.includes('011110')) return 10000;
        
        // 冲四：可以形成五
        if (str.includes('11110') || str.includes('01111') ||
            str.includes('11011') || str.includes('10111') || str.includes('11101')) {
            return 5000;
        }
        
        // 活三：可以形成活四
        if (str.includes('01110') || str.includes('011010') || str.includes('010110')) {
            return 1000;
        }
        
        // 眠三：可以形成冲四
        if (str.includes('11100') || str.includes('00111') ||
            str.includes('11010') || str.includes('01011') ||
            str.includes('10110') || str.includes('01101')) {
            return 500;
        }
        
        // 活二
        if (str.includes('01100') || str.includes('00110') ||
            str.includes('01010') || str.includes('010010')) {
            return 100;
        }
        
        // 眠二
        if (str.includes('11000') || str.includes('00011') ||
            str.includes('10100') || str.includes('00101') ||
            str.includes('10010') || str.includes('01001')) {
            return 50;
        }
        
        // 活一
        if (str.includes('010') || str.includes('0100')) {
            return 10;
        }
        
        return 1;
    }
    
    // 处理鼠标移动（显示预览）
    handleMouseMove(e) {
        if (this.gameOver || this.isAiThinking) return;
        
        // 如果是人机模式且轮到AI，不显示预览
        if (this.gameMode === 'pvc' && this.currentPlayer === this.aiPlayer) {
            return;
        }
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const gridX = Math.round((x - this.cellSize) / this.cellSize);
        const gridY = Math.round((y - this.cellSize) / this.cellSize);
        
        if (gridX < 0 || gridX >= this.gridSize || gridY < 0 || gridY >= this.gridSize) {
            return;
        }
        
        if (!this.board[gridX][gridY]) {
            this.drawBoard();
            this.drawPiece(gridX, gridY, this.currentPlayer, 0.3);
        }
    }
    
    // 清除预览
    clearPreview() {
        if (!this.gameOver) {
            this.drawBoard();
        }
    }
    
    // 检查胜负
    checkWin(x, y) {
        const color = this.board[x][y];
        const directions = [
            [[0, 1], [0, -1]],   // 竖直方向
            [[1, 0], [-1, 0]],   // 水平方向
            [[1, 1], [-1, -1]],  // 主对角线
            [[1, -1], [-1, 1]]   // 副对角线
        ];
        
        for (let direction of directions) {
            let count = 1; // 包括当前棋子
            
            // 检查两个方向
            for (let [dx, dy] of direction) {
                let newX = x + dx;
                let newY = y + dy;
                
                while (
                    newX >= 0 && newX < this.gridSize &&
                    newY >= 0 && newY < this.gridSize &&
                    this.board[newX][newY] === color
                ) {
                    count++;
                    newX += dx;
                    newY += dy;
                }
            }
            
            if (count >= 5) {
                return true;
            }
        }
        
        return false;
    }
    
    // 检查平局
    checkDraw() {
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (!this.board[i][j]) {
                    return false;
                }
            }
        }
        return true;
    }
    
    // 显示获胜者
    showWinner(winner) {
        const modal = document.getElementById('winner-modal');
        const winnerText = document.getElementById('winner-text');
        
        if (winner === 'draw') {
            winnerText.textContent = '🤝 平局！';
        } else {
            const emoji = winner === 'black' ? '⚫' : '⚪';
            const text = winner === 'black' ? '黑棋' : '白棋';
            
            // 在人机模式下，特殊提示
            if (this.gameMode === 'pvc') {
                if (winner === this.aiPlayer) {
                    winnerText.textContent = `🤖 AI获胜！再接再厉！`;
                } else {
                    winnerText.textContent = `🎉 恭喜你战胜了AI！`;
                }
            } else {
                winnerText.textContent = `${emoji} ${text}获胜！🎉`;
            }
        }
        
        modal.classList.add('show');
    }
    
    // 显示消息
    showMessage(text, type = 'info') {
        const message = document.getElementById('message');
        message.textContent = text;
        message.classList.add('show');
        
        setTimeout(() => {
            message.classList.remove('show');
            message.textContent = '';
        }, 2000);
    }
    
    // 更新玩家回合显示
    updatePlayerTurn() {
        const playerTurn = document.getElementById('player-turn');
        
        if (this.currentPlayer === 'black') {
            playerTurn.textContent = '⚫ 黑棋';
            playerTurn.className = 'black-turn';
        } else {
            playerTurn.textContent = '⚪ 白棋';
            playerTurn.className = 'white-turn';
        }
        
        // 在人机模式下，显示是玩家还是AI
        if (this.gameMode === 'pvc') {
            if (this.currentPlayer === this.aiPlayer) {
                playerTurn.textContent += ' (AI)';
            } else {
                playerTurn.textContent += ' (你)';
            }
        }
    }
    
    // 重新开始游戏
    restart() {
        this.init();
        
        // 隐藏弹窗
        const modal = document.getElementById('winner-modal');
        modal.classList.remove('show');
        
        // 清空消息
        const message = document.getElementById('message');
        message.textContent = '';
        message.classList.remove('show');
    }
}

// 页面加载完成后初始化游戏
window.addEventListener('DOMContentLoaded', () => {
    new Gomoku();
});

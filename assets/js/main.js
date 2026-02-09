import Game from './game/Game.js';

window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    // Original game resolution (from analysis of Java code: 21 cols * ? + offsets)
    // GameView.java says WIDTH=735, HEIGHT=1000
    const GAME_WIDTH = 735;
    const GAME_HEIGHT = 1000;

    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;

    const game = new Game(canvas);

    function resize() {
        // Resize logic to keep aspect ratio and fit window
        const scale = Math.min(
            window.innerWidth / GAME_WIDTH,
            window.innerHeight / GAME_HEIGHT
        );

        canvas.style.width = `${GAME_WIDTH * scale}px`;
        canvas.style.height = `${GAME_HEIGHT * scale}px`;
    }

    window.addEventListener('resize', resize);
    resize();

    // Start button
    const startBtn = document.getElementById('start-btn');
    const startScreen = document.getElementById('start-screen');

    startBtn.addEventListener('click', startGame);

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && startScreen.style.display !== 'none') {
            startGame();
        }
    });

    function startGame() {
        startScreen.style.display = 'none';
        game.start();
    }
});

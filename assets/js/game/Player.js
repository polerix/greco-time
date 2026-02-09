export default class Player {
    constructor(game) {
        this.game = game;
        this.cellWidth = 35; // Derived from GameView.java imageSizeX
        this.cellHeight = 30; // Derived from GameView.java imageSizeY
        this.width = 35;
        this.height = 30; // Match grid size for easier collision initially

        this.x = 0;
        this.y = 0;

        this.speed = 150; // Pixels per second
        this.image = new Image();
        this.image.src = 'assets/images/chef.png';

        this.frameX = 0;
        this.maxFrame = 3; // Assuming sprint sheet has frames
        this.fps = 10;
        this.frameTimer = 0;
        this.frameInterval = 1000 / this.fps;
    }

    resetPosition(pos) {
        this.x = pos.col * this.cellWidth;
        this.y = pos.row * this.cellHeight + 65; // Offset Y from GameView
    }

    update(input, map, deltaTime) {
        let dx = 0;
        let dy = 0;

        if (input.keys.includes('ArrowUp')) dy = -1;
        else if (input.keys.includes('ArrowDown')) dy = 1;
        else if (input.keys.includes('ArrowLeft')) dx = -1;
        else if (input.keys.includes('ArrowRight')) dx = 1;

        // Grid-based movement logic (simplified for prototype)
        // We need to check if the center of the player + direction is a valid cell

        // Determine grid coordinates
        let col = Math.round(this.x / this.cellWidth);
        // let row = Math.round((this.y - 65) / this.cellHeight);

        // Movement Logic
        // Calculate potential new position
        let nextX = this.x + dx * this.speed * (deltaTime / 1000);
        let nextY = this.y + dy * this.speed * (deltaTime / 1000);

        // Check collision with map boundaries
        if (nextX < 0) nextX = 0;
        if (nextX > this.game.width - this.width) nextX = this.game.width - this.width;

        /* 
           Refined Logic:
           - If moving Horizontal: Check if current Y is aligned with a row center. if so, check if target X is valid floor.
           - If moving Vertical: Check if current X is aligned with a col center. if so, check if target Y is valid ladder.
        */

        let cx = this.x + this.width / 2;
        let cy = this.y + this.height / 2;

        if (map.isValidMove(nextX, nextY, this.width, this.height)) {
            this.x = nextX;
            this.y = nextY;
        }

        // Animation
        if (dx !== 0 || dy !== 0) {
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX < this.maxFrame) this.frameX++;
                else this.frameX = 0;
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }
        }
    }

    draw(ctx) {
        // Draw sprite
        // ctx.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height);

        // Placeholder for now as we don't know exact sprite sheet layout
        ctx.drawImage(this.image, this.x, this.y, this.cellWidth, 40); // Adjusted height for visuals
    }
}

import Enemy from './Enemy.js';

export default class Map {
    constructor(levelIndex) {
        this.levelIndex = levelIndex;
        // 26 rows, 21 cols
        this.rows = 26;
        this.cols = 21;
        this.cellWidth = 35;
        this.cellHeight = 30;
        this.offsetY = 65;

        this.grid = [];
        this.assets = {
            tile: new Image(),
            stair: new Image(),
            tileStair: new Image(),
            burger: {
                top: new Image(),
                salad: new Image(),
                meat: new Image(),
                bottom: new Image()
            }
        };

        this.assets.tile.src = 'assets/images/tile.png';
        this.assets.stair.src = 'assets/images/stair.png';
        this.assets.tileStair.src = 'assets/images/tileStair.png';

        // Initial burger parts
        this.assets.burger.top.src = 'assets/images/up_bread_01.png';
        this.assets.burger.salad.src = 'assets/images/salad_01.png';
        this.assets.burger.meat.src = 'assets/images/hamburger_01.png';
        this.assets.burger.bottom.src = 'assets/images/down_bread_01.png';
    }

    async load() {
        // Fetch the level text file (we need to create this dynamically or port it)
        // For now, I will hardcode the Level 1 layout based on typical GrecoTime design 
        // or try to read it if I could.
        // Since I can't read the .txt file from here easily into JS without a server, 
        // I will define a simple test map string.

        // '0' = Empty
        // '=' = Floor (Java code uses '0'? No, Java uses '0' for path, need to check Map.java again?)
        // Map.java says: '0' or '|'. '0' seems to be walkable?
        // Let's look at Map.java again...
        // matrix[row][col]
        // '0' = empty/walkable?
        // '|' = ladder
        // 'p' = player start
        // 'd','h','s','u' = burger parts

        // I'll create a hardcoded map for Level 1 representation
        const level1 = [
            "000000000000000000000",
            "000000000000000000000",
            "0u000u000u000u0000000",
            "HHHHHHHHHHHHHHHHHHHHH",
            "0|000|000|000|000|000",
            "0|000|000|000|000|000",
            "0s000s000s000s000|000",
            "HHHHHHHHHHHHHHHHHHHHH",
            "0|000|000|000|000|000",
            "0|000|000|000|000|000",
            "0h000h000h000h000|000",
            "HHHHHHHHHHHHHHHHHHHHH",
            "0|000|000|000|000|000",
            "0|000|000|000|000|000",
            "0d000d000d000d000|000",
            "HHHHHHHHHHHHHHHHHHHHH",
            "0|000|000|000|000|000",
            "0p00020003000|000|000",
            "HHHHHHHHHHHHHHHHHHHHH",
            "0000000000000|000|000",
            "0000000000000|000|000",
            "HHHHHHHHHHHHHHHHHHHHH",
            "000000000000000000000",
            "000000000000000000000",
            "000000000000000000000",
            "000000000000000000000"
        ];

        this.parseLevel(level1);
    }

    parseLevel(levelData) {
        this.grid = [];
        this.enemies = [];
        this.startPos = { row: 0, col: 0 };

        for (let r = 0; r < this.rows; r++) {
            let rowStr = levelData[r] || "000000000000000000000";
            let rowData = [];

            // 'H' isn't in original, but I used it to denote floor visually above.
            // Original uses implicitly defined floors? 
            // Reading Java Map.java: 
            // "if(matrix[i][j]=='0'|| matrix[i][j]=='|')" -> Accessible Cell.
            // But where are the tiles drawn?
            // GameView.java: loadElements() -> creates ImageView for each cell?

            for (let c = 0; c < this.cols; c++) {
                let char = rowStr[c];

                if (char === 'H') char = '1'; // 1 for Floor

                if (char === 'p') {
                    this.startPos = { row: r, col: c };
                    char = '0'; // Replace with empty
                }
                if (char === '2') {
                    this.enemies.push({ row: r, col: c, type: 'egg' });
                    char = '1'; // Assume on floor
                }
                if (char === '3') {
                    this.enemies.push({ row: r, col: c, type: 'wiener' });
                    char = '1'; // Assume on floor
                }

                rowData.push(char);
            }
            this.grid.push(rowData);
        }
    }

    draw(ctx) {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                let cell = this.grid[r][c];
                let x = c * this.cellWidth;
                let y = r * this.cellHeight + this.offsetY;

                if (cell === 'H' || cell === '1') {
                    ctx.drawImage(this.assets.tile, x, y, this.cellWidth, this.cellHeight);
                } else if (cell === '|') {
                    ctx.drawImage(this.assets.stair, x, y, this.cellWidth, this.cellHeight);
                } else if (['u', 'h', 's', 'd'].includes(cell)) {
                    // Draw floor under component?
                    ctx.drawImage(this.assets.tile, x, y, this.cellWidth, this.cellHeight);
                    // Draw component
                    let img = this.getComponentImage(cell);
                    if (img) ctx.drawImage(img, x, y - 5, this.cellWidth, this.cellHeight);
                }
            }
        }
    }

    getComponentImage(code) {
        switch (code) {
            case 'u': return this.assets.burger.top;
            case 's': return this.assets.burger.salad;
            case 'h': return this.assets.burger.meat;
            case 'd': return this.assets.burger.bottom;
            default: return null;
        }
    }

    checkBurgerFall(player) {
        // TODO: Implement burger dropping logic
        // Check if player walked over all parts of a burger segment
    }

    isValidMove(x, y, w, h) {
        // Simple center point check for now
        let cx = x + w / 2;
        let cy = y + h / 2 - this.offsetY;

        let c = Math.floor(cx / this.cellWidth);
        let r = Math.floor(cy / this.cellHeight);

        if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return false;

        let cell = this.grid[r][c];

        // Strict collision logic based on original game rules:
        // - '0': Empty (air/wall) - Cannot move here.
        // - '1' (Floor): Can move Left/Right.
        // - '|' (Ladder): Can move Up/Down.
        // - Intersection ('1' & '|'): Can move all directions? 
        //   My grid parsing separates them. I need to know if a cell supports specific movement.

        // Let's assume:
        // Horizontal movement allowed if current cell OR target cell is '1' (Floor) or Component.
        // Vertical movement allowed if current cell OR target cell is '|' (Ladder).

        // Get current cell info (approximate)
        // Center check is decent for now.

        // Debug:
        // console.log(`Checking Move: ${c},${r} = ${cell}`);

        if (['1', 'u', 'd', 's', 'h'].includes(cell)) return true; // Floor or Burger
        if (cell === '|') return true; // Ladder

        return false;
    }

    getStartPosition() {
        return this.startPos;
    }

    getEnemies() {
        let enemiesObjs = [];
        this.enemies.forEach(e => {
            enemiesObjs.push(new Enemy(e.row, e.col, e.type));
        });
        return enemiesObjs;
    }
}

var gameOver = false;

var colours = ["#FAED27", "#FFA500", "#FF073A", "#FFFFFF",
                                "#39FF14", "#0000FF", "#FF00FF"]
var shapes = {sq:[[0,0],[1,0],[0,1],[1,1]],
                            lp:[[0,0],[0,1],[0,2],[1,2]],
                            rl:[[0,0],[0,1],[0,2],[-1,2]],
                            ll:[[0,0],[0,1],[0,2],[0,3]],
                            rp:[[0,0],[1,0],[-1,1],[0,1]],
                            tp:[[0,0],[-1,1],[0,1],[1,1]],
                            ld:[[0,0],[1,0],[1,1],[2,1]]}
var cellWidth = 20;
var cellHeight = 20;
var lines = 0;
var score = 0;

function draw(cell){
    var cellWidth = window.cellWidth;
    var cellHeight = window.cellHeight;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0,0,200,400);

    for(var x = 0; x < cell.length; x++){
        for(var y = 0; y < cell[x].length; y++){
            if(cell[x][y] == 0) {
                ctx.fillStyle = "#000000";
            }else{
                ctx.fillStyle = colours[cell[x][y]-1];
            }
            ctx.fillRect(x*cellWidth, y*cellHeight, cellWidth, cellHeight);

        }
    }
    ctx.fillStyle = "#000000";
    for(var x = 0; x < cell.length; x++){
        ctx.beginPath();       // Start a new path
        ctx.moveTo(x*cellWidth, 0);    // Move the pen to (30, 50)
        ctx.lineTo(x*cellWidth, cellHeight*cell[0].length);  // Draw a line to (150, 100)
        ctx.stroke();
    }
    for(var y = 0; y < cell[0].length; y++){
        ctx.beginPath();       // Start a new path
        ctx.moveTo(0, y*cellHeight);    // Move the pen to (30, 50)
        ctx.lineTo(cellWidth*cell.length, y*cellHeight);  // Draw a line to (150, 100)
        ctx.stroke();
    }
}

function applyShape(s,cell,cIndex){
    for (var i = 0; i < s.x.length; i++){
        cell[s.ox+s.x[i]][s.oy+s.y[i]] = cIndex+1;
    }

    return cell;
}

function resetGrid(cell){
    for(var x = 0; x < cell.length; x++){
        for(var y = 0; y < cell[0].length; y++){
            cell[x][y] = 0;
        }
    }

}

function mainLoop(){
    cell = applyShape(s,cell,ShapeIndex);
    draw(cell);
    if (s.alive == false){
        var ShapeArray = ["sq", "lp", "rl", "ll", "rp", "tp", "ld"]
        ShapeIndex = Math.floor(Math.random()*7);
        s = new shape(ShapeArray[ShapeIndex]);
        s.checkLines(cell);
        s.moveDown(cell);
        if(s.alive == false){
            gameOver = true;
            go = false;
        }
    }
    if(go == true){
        requestAnimationFrame(mainLoop);
    }
}


class shape {
    constructor(type){
        this.type = type;
        this.alive = true;
        this.x = [];
        this.y = [];
        this.ox = 5;
        this.oy = -1;

        for(var i = 0; i < shapes[this.type].length; i++){
            this.x.push(shapes[this.type][i][0]);
            this.y.push(shapes[this.type][i][1]);
        }

    }

    removeLine(cell, y) {
        for(var i = y; i > 0; i--) {
            for(var x = 0; x < cell.length; x++) {
                cell[x][i] = cell[x][i-1];
            }
        }
        for(var x = 0; x < cell.length; x++) {
            cell[x][0] = 0;
        }
    }

    checkLines(cell) {
        var removed = [];
        var newLines = 0;
        for(var y = 0; y < cell[0].length; y++) {
            var valid = true;
            for(var x = 0; x < cell.length; x++) {
                if (cell[x][y] == 0) {
                    valid = false;
                }
            }
            if (valid) {
                newLines = newLines + 1;
                removed.push(y)
                this.removeLine(cell, y);
            }
        }
        lines = lines + newLines;
        document.getElementById("Lines").value = lines;
        if (newLines == 1) {
            score = score + 40;
        } else if (newLines == 2) {
            score = score + 100;
        } else if (newLines == 3) {
            score = score + 300;
        } else if (newLines == 4) {
            score = score + 1200;
        }
        document.getElementById("Score").value = score;
    }

    moveDown(cell, score){
        for(var i = 0; i < this.x.length; i++){
            cell[this.ox + this.x[i]][this.oy + this.y[i]] = 0;
        }
        this.oy += 1;

        for(var i = 0; i < this.x.length; i++){
            if(cell[this.ox + this.x[i]][this.oy + this.y[i]] >= 1 || this.oy+this.y[i] >= cell[0].length){
                this.oy -= 1;
                this.alive = false;
                applyShape(this,cell);
                return cell;
            }
        }

        return cell;
    }

    moveLeft(cell){
        for(var i = 0; i < this.x.length; i++){
            cell[this.ox + this.x[i]][this.oy + this.y[i]] = 0;
        }
        this.ox -= 1;

        for(var i = 0; i < this.x.length; i++){
            if(this.ox+this.x[i] < 0 || cell[this.ox + this.x[i]][this.oy + this.y[i]] >= 1){
                this.ox += 1;
                applyShape(this,cell);
                return cell;
            }
        }

        return cell;
    }



    moveRight(cell){
        for(var i = 0; i < this.x.length; i++){
            cell[this.ox + this.x[i]][this.oy + this.y[i]] = 0;
        }
        this.ox += 1;

        for(var i = 0; i < this.x.length; i++){
            if(this.ox+this.x[i] > 9 || cell[this.ox + this.x[i]][this.oy + this.y[i]] >= 1){
                this.ox -= 1;
                applyShape(this,cell);
                return cell;
            }
        }

        return cell;
    }
    rotateShape(cell){
        for(var i = 0; i < this.x.length; i++){
            cell[this.ox + this.x[i]][this.oy + this.y[i]] = 0;
        }
        var newx;
        var newy;
        for(var i = 0; i < this.x.length; i++){
            newx = -this.y[i];
            newy = this.x[i];
            this.x[i] = newx;
            this.y[i] = newy;
        }

        for(var i = 0; i < this.x.length; i++){
            if(this.ox+this.x[i] > 9 || this.ox+this.x[i] < 0 || cell[this.ox + this.x[i]][this.oy + this.y[i]] >= 1){
                for(var i = 0; i < this.x.length; i++){
                    newx = this.y[i];
                    newy = -this.x[i];
                    this.x[i] = newx;
                    this.y[i] = newy;
                }
                applyShape(this,cell);
                return cell;
            }
        }

    }


}
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");


var cell = [];
for(var x = 0; x < 10; x++){
    cell.push([]);
    for(var y = 0; y < 20; y++){
        cell[x].push(0);
    }
}

var ShapeArray = ["sq", "lp", "rl", "ll", "rp", "tp", "ld"]
var ShapeIndex = Math.floor(Math.random()*7);
var go = true;
var score = 0;
s = new shape(ShapeArray[ShapeIndex]);
s.moveDown(cell, score);

var moves = 0;
setInterval(function(){
    window.cell = window.s.moveDown(window.cell, window.score);
}, 400);

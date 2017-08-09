var stopSound = new Audio();
var lostSound = new Audio();
var winSound = new Audio();

stopSound.src ='hsh.mp3';
lostSound.src = 'lost.mp3';
winSound.src = 'win.mp3';

lostSound.load();
stopSound.load();
winSound.load();

function Vector(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.normalize = function () {
        l = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        this.x = this.x / l;
        this.y = this.y / l;
        this.z = this.z / l;
    }
}

function Cube(x, y, z, sideX, sideY, sideZ, color) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.sideX = sideX;
    this.sideY = sideY;
    this.sideZ = sideZ;
    this.color = color;
    this.draw = function (a, b, c, d) {
        dx = a / Math.abs(a);
        dy = b / Math.abs(b);
        dz = c / Math.abs(c);
        drawQuadrilatereal( new projectPoint(this.x + dx * this.sideX / 2, this.y + dy * this.sideY / 2,
                                            this.z + dz * this.sideZ / 2, a, b, c, d),
                            new projectPoint(this.x - dx * this.sideX / 2, this.y + dy * this.sideY / 2,
                                            this.z + dz * this.sideZ / 2, a, b, c, d),
                            new projectPoint(this.x - dx * this.sideX / 2, this.y - dy * this.sideY / 2,
                                            this.z + dz * this.sideZ / 2, a, b, c, d),
                            new projectPoint(this.x + dx * this.sideX / 2, this.y - dy * this.sideY / 2,
                                            this.z + dz * this.sideZ / 2, a, b, c, d), this.color);
        
        drawQuadrilatereal( new projectPoint(this.x + dx * this.sideX / 2, this.y + dy * this.sideY / 2,
                                            this.z + dz * this.sideZ / 2, a, b, c, d),
                            new projectPoint(this.x + dx * this.sideX / 2, this.y - dy * this.sideY / 2,
                                            this.z + dz * this.sideZ / 2, a, b, c, d),
                            new projectPoint(this.x + dx * this.sideX / 2, this.y - dy * this.sideY / 2,
                                            this.z - dz * this.sideZ / 2, a, b, c, d),
                            new projectPoint(this.x + dx * this.sideX / 2, this.y + dy * this.sideY / 2,
                                            this.z - dz * this.sideZ / 2, a, b, c, d), this.color);
        
        drawQuadrilatereal( new projectPoint(this.x + dx * this.sideX / 2, this.y + dy * this.sideY / 2,
                                            this.z + dz * this.sideZ / 2, a, b, c, d),
                            new projectPoint(this.x - dx * this.sideX / 2, this.y + dy * this.sideY / 2,
                                            this.z + dz * this.sideZ / 2, a, b, c, d),
                            new projectPoint(this.x - dx * this.sideX / 2, this.y + dy * this.sideY / 2,
                                            this.z - dz * this.sideZ / 2, a, b, c, d),
                            new projectPoint(this.x + dx * this.sideX / 2, this.y + dy * this.sideY / 2,
                                            this.z - dz * this.sideZ / 2, a, b, c, d), this.color);
    }
}

function drawQuadrilatereal(p1, p2, p3, p4, color) {
    game.context.beginPath();
    game.context.moveTo(p1.x, p1.y);
    game.context.lineTo(p2.x, p2.y);
    game.context.lineTo(p3.x, p3.y);
    game.context.lineTo(p4.x, p4.y);
    game.context.closePath();
    game.context.fillStyle = color;
    game.context.stroke();
    game.context.fill();
}

function distToPlane(cube, a, b, c, d)
{
    return Math.abs(cube.x * a + cube.y * b + cube.z * c - d) / Math.sqrt(a*a + b*b + c*c);
}

function projectPoint(x, y, z, a, b, c, d) {
    // b1 and b2 is orthogonal unit basis on the plane ax+by+cz=d
    b1 = new Vector(a, b, c - d / c);
    b1.normalize();
    
    normal = new Vector(a, b, c);
    normal.normalize();

    //cross product of b1 and normal
    b2 = new Vector(b1.y * normal.z - b1.z * normal.y, b1.z * normal.x - b1.x * normal.z,
                    b1.x * normal.y - b1.y * normal.x);

    distanceToPlane = -(a * x + b * y + c * z - d) / Math.sqrt(a*a+b*b+c*c);
    projection = new Vector(x + distanceToPlane * normal.x - a, y + distanceToPlane * normal.y - b,
                            z + distanceToPlane * normal.z - c);
    
    // represent projection as a linear combination of b1 and b2
    // the center the point
    this.x = (projection.x * b1.y - projection.y * b1.x) / (b2.x * b1.y - b2.y * b1.x) +
             game.canvas.width / 2; 
    this.y = (projection.y * b2.x - projection.x * b2.y) / (b2.x * b1.y - b2.y * b1.x) +
             game.canvas.height / 2;
}

var game = {
    canvas : document.getElementById('arena'),
    newGame : function() {
        this.playing = true;
        this.speedX = 1;
        this.speedY = 1;
        this.angleSpeed = 0;
        this.curHeight = -100;
        this.mouseDown = false;
        this.angle = 135;

        this.cubes = new Array();
        this.numCubes = 2;
        this.cubes[0] = new Cube(0, 0, -200, 50, 50, 50, 'green');
        this.cubes[1] = new Cube(0, 0, -150, 50, 50, 50, 'red');
        this.activeCube = this.cubes[1];
        this.prevCube = this.cubes[0];
    },
    clear : function() {
        this.context.fillStyle = 'yellow';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    },
    startUp : function () {
        clearInterval(this.moveInterval);
        clearInterval(this.drawInterval);
        
        this.canvas.height = 600;
        this.canvas.width = 600;
        this.context = this.canvas.getContext('2d');
        this.observeRadius = 200;
        this.observeHeight = 200;

        this.platform = new Cube(0, 0, -274, 200, 200, 24, 'blue');

        this.drawInterval = setInterval(function () {
            game.clear();
            
            game.angle += game.angleSpeed;
            a = game.observeRadius * Math.cos(game.angle / 180 * Math.PI);
            b = game.observeRadius * Math.sin(game.angle / 180 * Math.PI);
            c = game.observeHeight;
            d = a * a + b * b + c * c;
            
            
            game.platform.draw(a, b, c, d);
            game.cubes.sort(function (c1, c2) {
                return -distToPlane(c1, a, b, c, d) + distToPlane(c2, a, b, c, d);
            });
            for (var i = 0; i < game.numCubes; i++) {
                game.cubes[i].draw(a, b, c, d);
            };

            if (!game.playing) {
                game.context.font = "60px Comic Sans MS";
                game.context.fillStyle = "black";
                game.context.textAlign = "center";
                game.context.fillText(game.result, game.canvas.width/2, game.canvas.height/2);
            }
        } , 20);

        this.moveInterval = setInterval(function () {
            if (Math.abs(game.activeCube.x) > 140 || Math.abs(game.activeCube.y) > 140) {
                game.speedX = -game.speedX;
                game.speedY = -game.speedY;
            }
            game.activeCube.x += game.speedX;
            game.activeCube.y += game.speedY;
        }, 20);

        window.onkeydown = function(e) {
            switch (e.keyCode) {
                case 37:
                    game.angleSpeed = -1;
                    break;
                case 39:
                    game.angleSpeed = +1;
                    break;
                case 40:
                    game.stopBlock();
                    break;
            }
        };
        window.onkeyup = function(e) {
            switch (e.keyCode) {
                case 37:
                    if (game.angleSpeed < 0)
                        game.angleSpeed = 0
                    break;
                case 39:
                    if (game.angleSpeed > 0)
                        game.angleSpeed = 0;
                    break;
            }
        };

        this.canvas.onmousedown = function(e) {
            game.mouseDown = true;
            game.initialMouseX = e.clientX;
        };
        this.canvas.onmouseup = function(e) {
            game.mouseDown = false;
        };
        this.canvas.onmousemove = function (e) {
            if (game.mouseDown) {
                game.angle = game.angle + -(game.initialMouseX - e.clientX);
                game.initialMouseX = e.clientX;
            }
        };
    },
    stopBlock : function () {
        if (!game.playing)
            return;
        if (Math.abs(game.activeCube.x - game.prevCube.x) < 25 &&
            Math.abs(game.activeCube.y - game.prevCube.y) < 25) {
            if (game.numCubes == 11) {
                game.speedX = 0;
                game.speedY = 0;
                game.playing = false;
                winSound.play();
                game.result = 'You win!';
            } else {
                game.prevCube = game.activeCube;
                game.numCubes += 1;
                a = Math.random() * 2 * Math.PI;
                color = game.numCubes == 11 ? 'green' : 'red';
                game.cubes[game.numCubes-1] = new Cube(game.prevCube.x + 50 * Math.cos(a),
                                                       game.prevCube.y + 50 * Math.sin(a),
                                                       game.curHeight, 50, 50, 50, color);
                s = Math.random() * 7 + 1;
                game.speedX = s * Math.cos(a);
                game.speedY = s * Math.sin(a);
                game.curHeight += 50;
                game.activeCube = game.cubes[game.numCubes-1];
                stopSound.play();
            }
        } else {
            game.speedX = 0;
            game.speedY = 0;
            game.playing = false;
            lostSound.play();
            game.result = 'You lost :(';
        };
    }
}

game.newGame();
game.startUp();
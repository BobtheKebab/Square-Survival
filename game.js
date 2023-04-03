// Square Survival
// Ahbab Ashraf

var gameWidth = 1000;
var gameHeight = 600;
var playerMoveSpeed = 2;
var bulletSpeed = 10;
var gamePiece;
var score = 0;
var obstacles = [];
var bullets = [];
var enemyDimensions = 30;
var resourceMax = 100;
var resource = 0;
var resourceRegen = 0.005; // percent regen per tick
var resourceDeplete = 0.05; // percent depletion per tick
var playerColor = "orchid"

var myGameArea = {

	canvas: document.createElement("canvas"),

	// On game start
	start: function () {
		// Canvas
		this.canvas.width = gameWidth;
		this.canvas.height = gameHeight;
		this.context = this.canvas.getContext("2d");
		// Insert canvas into html body
		document.body.insertBefore(this.canvas, document.getElementById("resource"));//document.body.childNodes[0]);

		this.frameNo = 0;
		this.interval = setInterval(updateGameArea, 20);

		// Handle key presses
		// Key down
		window.addEventListener('keydown', function (e) {
			stopMove();
			myGameArea.keys = (myGameArea.keys || []);
			myGameArea.keys[e.keyCode] = true;

			// if (e.code == "ArrowUp") {
			// 	console.log(`Key "${e.key}" pressed [event: keydown]`)
			// 	gamePiece.speedY = playerMoveSpeed * -1
			// };
		})
		// Key up
		window.addEventListener('keyup', function (e) {
			stopMove();
			myGameArea.keys[e.keyCode] = false;
			if (e.code == 'Space') {
				gamePiece.speedX = playerMoveSpeed;
				gamePiece.speedY = playerMoveSpeed;
			}
		})
	},

	// Clear elements before redraw
	clear: function () {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},

	// Clear interval to stop game
	stop: function () {
		clearInterval(this.interval);
	},

	// Listen for keys pressed
	keyListener: function () {
		stopMove();
		if (myGameArea.keys) {
			if (myGameArea.keys[38] || myGameArea.keys[87]) { move("up"); console.log("up"); } // up arrow and w
			if (myGameArea.keys[40] || myGameArea.keys[83]) { move("down") } // down arrow and s
			if (myGameArea.keys[37] || myGameArea.keys[65]) { move("left") } // left arrow and a
			if (myGameArea.keys[39] || myGameArea.keys[68]) { move("right") } // right arrow and d
			if (myGameArea.keys[32]) { move("shoot") } // spacebar
		}
	}
}

// Make pieces and start game
function startGame() {

	// Player
	gamePiece = new component(30, 30, playerColor, gameWidth / 2, gameHeight / 2, "player", 0, 0);

	// Start
	myGameArea.start();
}

// Moving components of the game
function component(width, height, color, x, y, label, speedX, speedY) {
	this.width = width;
	this.height = height;
	this.x = x;
	this.y = y;
	this.speedX = speedX;
	this.speedY = speedY;
	this.text = "";
	this.facing = "right";
	this.color = color;

	// Drawing components on every update
	this.update = function () {
		ctx = myGameArea.context;
		ctx.fillStyle = this.color;
		switch (label) {
			case "player":
			//ctx.beginPath();
			//ctx.arc(this.x, this.y, this.width/2, 0, 2*Math.PI);
			//ctx.fill();
				ctx.fillRect(this.x, this.y, width, height);
				break;
			case "obstacle":
			case "bullet":
				ctx.fillRect(this.x, this.y, this.width, this.height);
				break;
			case "score":
				ctx.font = this.width + " " + this.height;
				ctx.fillText(this.text, this.x, this.y);
		}
	}

	// Update position
	this.newPos = function () {
		this.x += this.speedX;
		this.y += this.speedY;
		// Collide with border if player
		// Undo change in position
		if (label == "player") {
			// Left and right borders
			if ((this.x < 0) || (this.x > gameWidth - this.width)) {
				this.x -= this.speedX;
			};
			// Top and bottom borders
			if ((this.y < 0) || (this.y > gameHeight - this.height)) {
				this.y -= this.speedY;
			};
		}
	}

	// Return true if component collides with other component
	this.checkCollision = function (other) {
		var myLeft = this.x;
		var myRight = this.x + this.width;
		var myTop = this.y;
		var myBot = this.y + this.height;
		var otherLeft = other.x;
		var otherRight = other.x + other.width;
		var otherTop = other.y;
		var otherBot = other.y + other.height;
		var collided = true;
		if ((myLeft > otherRight) ||
			(myRight < otherLeft) ||
			(myTop > otherBot) ||
			(myBot < otherTop)) { collided = false };
		return collided;
	}

	// Shoot a bullet
	this.shoot = function() {
		bullSpdX = 0;
		bullSpdY = 0;
		switch (this.facing) {
			case "up":
				bullSpdY = -bulletSpeed;
				break;
			case "down":
				bullSpdY = bulletSpeed;
				break;
			case "left":
				bullSpdX = -bulletSpeed;
				break;
			case "right":
				bullSpdX = bulletSpeed;
				break;
		}
		bullets.push(new component(30, 30, "green", this.x, this.y, "bullet", bullSpdX, bullSpdY));
	}
}

// Update game on every interval
function updateGameArea() {

	// Update frame number
	myGameArea.frameNo += 1;

	// Clear elements
	myGameArea.clear();

	// Update each obstacle
	for (element of obstacles) {
		
		// Check collision with bullets
		for (bullet of bullets) {
			if (bullet.checkCollision(element)) {
				var index = obstacles.indexOf(element);
				obstacles.splice(index, 1);
				score += 200;
			}
		}
		// Bounce obstacle if reaching border
		// Left and right
		if ((element.x < 0) || (element.x > gameWidth - element.width)) {
			element.speedX = -element.speedX;
		// Top and bottom
		} else if ((element.y < 0) || (element.y > gameHeight - element.height)) {
			element.speedY = -element.speedY;
		};
		// Redraw each obstacle
		element.newPos();
		element.update();

		// Check collision with game piece
		if (gamePiece.checkCollision(element)) { myGameArea.stop() };

	}

	// Update each bullet
	for (element of bullets) {
		element.newPos();
		element.update();
	}

	// Change resource as needed
	if (resource < 0) {
		resource = 0; // Don't let resource be 0
	} else if (resource > resourceMax) {
		resource = resourceMax;	// Don't let resource regen above max
	} else if (resource < resourceMax) {
		resource += resourceMax * resourceRegen;
	}

	// Update resource bar
	let resourceBar = document.getElementById("resource");
	resourceBar.style.width = (resource * 10).toString() + "px";
	

	// Do something every 100 frames
	if (myGameArea.frameNo % 100 == 0) {
		// ******** TODO Make obstacles appear randomly ********
		randX = getRandInt(0, 1) ? gameWidth - enemyDimensions : enemyDimensions;
		randY = getRandInt(enemyDimensions + 1, gameHeight - enemyDimensions);
		randColor = randHexCode();
		randSpdX = getRandInt(0, 1) ? 3 : -3;
		randSpdY = getRandInt(0, 1) ? 3 : -3;
		obstacles.push(new component(enemyDimensions, enemyDimensions, randColor, randX, randY, "obstacle", randSpdX, randSpdY));
	}

	// Draw score
	score++;
	drawScore();

	// Draw player
	myGameArea.keyListener();
	gamePiece.newPos();
	gamePiece.update();
}

// Draw score
function drawScore() {
	myGameArea.context.fillStyle = "black";
	myGameArea.context.font = "15px Consolas, sans-serif";
	myGameArea.context.fillText("SCORE: " + score, gameWidth - 110, 20);
}

// Change acceleration of player on key press
function move(direction) {
	switch (direction) {
		case "up":
			gamePiece.speedY = playerMoveSpeed * -1;
			gamePiece.facing = direction;
			break;
		case "down":
			gamePiece.speedY = playerMoveSpeed;
			gamePiece.facing = direction;
			break;
		case "left":
			gamePiece.speedX = playerMoveSpeed * -1;
			gamePiece.facing = direction;
			break;
		case "right":
			gamePiece.speedX = playerMoveSpeed;
			gamePiece.facing = direction;
			break;
		case "shoot":
			gamePiece.speedX *= 3;
			gamePiece.speedY *= 3;
			resource -= resourceMax * resourceDeplete;
	}
}

// Stop acceleration of player
function stopMove() {
	gamePiece.speedX = 0;
	gamePiece.speedY = 0;
}

// Random number between min and max, inclusive
function getRandInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1) ) + min;
}

// Random color
const randHexCode = () => {
	let n = (Math.random() * 0xfffff * 1000000).toString(16);
	return '#' + n.slice(0, 6);
};
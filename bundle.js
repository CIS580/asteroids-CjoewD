(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict;"

const MS_PER_FRAME = 1000;

/* Classes */
const Game = require('./game.js');
const Player = require('./player.js');
const Asteroid = require('./asteroid.js');

/* Global variables */
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);
var player = new Player({x: canvas.width/2, y: canvas.height/2}, canvas);
var asteroid = [];
var level = 1;
var lives = 3;
var score = 0;
var state = 'start';
var timer = 0;
var explosion = new Audio();
explosion.src = 'assets/explosion.wav';
var bumpInt = 0;
var bump = [new Audio(), new Audio(), new Audio(), new Audio(), new Audio()];
bump[0].src = 'assets/bump.wav';
bump[1].src = 'assets/bump.wav';
bump[2].src = 'assets/bump.wav';
bump[3].src = 'assets/bump.wav';
bump[4].src = 'assets/bump.wav';
var destoryInt = 0;
var destory = [new Audio(), new Audio(), new Audio()];
destory[0].src = 'assets/destory.wav';
destory[1].src = 'assets/destory.wav';
destory[2].src = 'assets/destory.wav';


/**
 * @function masterLoop
 * Advances the game in sync with the refresh rate of the screen
 * @param {DOMHighResTimeStamp} timestamp the current time
 */
var masterLoop = function(timestamp) {
  game.loop(timestamp);
  window.requestAnimationFrame(masterLoop);
}
masterLoop(performance.now());



/**
 * @function update
 * Updates the game state, moving
 * game objects and handling interactions
 * between them.
 * @param {DOMHighResTimeStamp} elapsedTime indicates
 * the number of milliseconds passed since the last frame.
 */
function update(elapsedTime) {  
  // TODO: Update the game objects
  switch(state){
	  case 'start':
		createAstroids(elapsedTime);
		state = 'idle';
		break;
	  case 'idle':
		if(player.hasStarted(elapsedTime)) state = 'running';
		break;
	  case 'running':
	    //update player movement/ bullets
		player.update(elapsedTime, asteroid, canvas);
	    //update astroids
	    for (i = asteroid.length; i > 0; i--) {
			var temp = asteroid.shift();
			temp.update(elapsedTime);
			if(temp.getStatus(elapsedTime) == false) asteroid.push(temp);
   	    }
	    //check bullet-astroid collision
		var bullets = player.getBullets(elapsedTime);
		for(var i in bullets){
			var currentBullet = bullets[i].getLocation(elapsedTime);
			for(var j in asteroid){
				var currentAsteroid = asteroid[j].getLocation();
				//(x2-x1)^2 + (y1-y2)^2 <= (r1+r2)^2 is the formula used to check for collisions
				if(Math.pow(currentAsteroid.x - currentBullet.x, 2) + Math.pow(currentBullet.y - currentAsteroid.y, 2) <= Math.pow(currentBullet.radius + currentAsteroid.radius, 2) && !bullets[i].getDestory(elapsedTime)){
					var size = asteroid[j].getVelocity();
					if(size.mass > 30) splitAsteroid(elapsedTime, asteroid[j]);
					asteroid[j].destory(elapsedTime);
					destory[destoryInt].play();
					destoryInt++;
					if(destoryInt>2) destoryInt = 0;
					bullets[i].destory(elapsedTime);
					score += Math.ceil(size.mass);
				}
			}
		}
		//check asteroid-asteroid collision
		for(var i = 0; i< asteroid.length;i++){
			var currentAsteroidOne = asteroid[i].getLocation(elapsedTime);
			for(var j = i; j<asteroid.length;j++){
				var currentAsteroidTwo = asteroid[j].getLocation();
				//(x2-x1)^2 + (y1-y2)^2 <= (r1+r2)^2 is the formula used to check for collisions
				if(i != j && Math.pow(currentAsteroidTwo.x - currentAsteroidOne.x, 2) + Math.pow(currentAsteroidOne.y - currentAsteroidTwo.y, 2) <= Math.pow(currentAsteroidOne.radius + currentAsteroidTwo.radius, 2)){
					if(currentAsteroidOne.x < currentAsteroidTwo.x){
						if(currentAsteroidOne.y > currentAsteroidTwo.y) astroidCollisions(asteroid[i], asteroid[j], 1);
						else astroidCollisions(asteroid[i], asteroid[j],-1);
					}
					else{
						if(currentAsteroidOne.y > currentAsteroidTwo.y) astroidCollisions(asteroid[i], asteroid[j], -1);
						else astroidCollisions(asteroid[i], asteroid[j], 1);
					}
					bump[bumpInt].play();
					bumpInt++;
					if(bumpInt>4) bumpInt = 0;
				}
			}
		}
		//check for win
		if(asteroid.length == 0) state = 'win';
		//check player-asteroid collision
		var playerLoc = player.getLocation();
		for(var i = 0; i< asteroid.length;i++){
			var currentAsteroidOne = asteroid[i].getLocation(elapsedTime);
			//(x2-x1)^2 + (y1-y2)^2 <= (r1+r2)^2 is the formula used to check for collisions
			if(Math.pow(playerLoc.x - currentAsteroidOne.x, 2) + Math.pow(currentAsteroidOne.y - playerLoc.y, 2) <= Math.pow(currentAsteroidOne.radius + 10, 2)){
				state = 'phase';
				player.resetLocation(canvas);
				lives--;
				explosion.play();
				player = new Player({x: canvas.width/2, y: canvas.height/2}, canvas);
				if(lives <= 0){
					console.log('test');
					game = new Game(canvas, update, render);
					asteroid = [];
					level = 1;
					lives = 3;
					score = 0;
					state = 'start';
				}
			}
		}
		break;
	  case 'phase':
	    timer += elapsedTime;
		if (timer > MS_PER_FRAME * 4) {
			timer = 0;
			state = 'running';
		}
	    //update player movement/ bullets
		player.update(elapsedTime, asteroid, canvas);
	    //update astroids
	    for (i = asteroid.length; i > 0; i--) {
			var temp = asteroid.shift();
			temp.update(elapsedTime);
			if(temp.getStatus(elapsedTime) == false) asteroid.push(temp);
   	    }
	    //check bullet-astroid collision
		var bullets = player.getBullets(elapsedTime);
		for(var i in bullets){
			var currentBullet = bullets[i].getLocation(elapsedTime);
			for(var j in asteroid){
				var currentAsteroid = asteroid[j].getLocation();
				//(x2-x1)^2 + (y1-y2)^2 <= (r1+r2)^2 is the formula used to check for collisions
				if(Math.pow(currentAsteroid.x - currentBullet.x, 2) + Math.pow(currentBullet.y - currentAsteroid.y, 2) <= Math.pow(currentBullet.radius + currentAsteroid.radius, 2) && !bullets[i].getDestory(elapsedTime)){
					var size = asteroid[j].getVelocity();
					if(size.mass > 30) splitAsteroid(elapsedTime, asteroid[j]);
					asteroid[j].destory(elapsedTime);
					destory[destoryInt].play();
					destoryInt++;
					if(destoryInt>2) destoryInt = 0;
					bullets[i].destory(elapsedTime);
					score += Math.ceil(size.mass);
				}
			}
		}
		//check asteroid-asteroid collision
		for(var i = 0; i< asteroid.length;i++){
			var currentAsteroidOne = asteroid[i].getLocation(elapsedTime);
			for(var j = i; j<asteroid.length;j++){
				var currentAsteroidTwo = asteroid[j].getLocation();
				//(x2-x1)^2 + (y1-y2)^2 <= (r1+r2)^2 is the formula used to check for collisions
				if(i != j && Math.pow(currentAsteroidTwo.x - currentAsteroidOne.x, 2) + Math.pow(currentAsteroidOne.y - currentAsteroidTwo.y, 2) <= Math.pow(currentAsteroidOne.radius + currentAsteroidTwo.radius, 2)){
					if(currentAsteroidOne.x < currentAsteroidTwo.x){
						if(currentAsteroidOne.y > currentAsteroidTwo.y) astroidCollisions(asteroid[i], asteroid[j], 1);
						else astroidCollisions(asteroid[i], asteroid[j],-1);
					}
					else{
						if(currentAsteroidOne.y > currentAsteroidTwo.y) astroidCollisions(asteroid[i], asteroid[j], -1);
						else astroidCollisions(asteroid[i], asteroid[j], 1);
					}
					bump[bumpInt].play();
					bumpInt++;
					if(bumpInt>4) bumpInt = 0;
				}
			}
		}
		//check for win
		if(asteroid.length == 0) state = 'win';
		break;
	  case 'win':
		player = new Player({x: canvas.width/2, y: canvas.height/2}, canvas);
		level++;
		score += 100*level*lives;
		state = 'start';
		break;
	  case 'lose':
		player = new Player({x: canvas.width/2, y: canvas.height/2}, canvas);
		lives--;
		if(lives <= 0){
			level = 1;
			asteroid = [];
			lives = 3;
			score = 0;
		}
		state = 'start';
		break;
  }//end switch
}

/**
  * @function render
  * Renders the current game state into a back buffer.
  * @param {DOMHighResTimeStamp} elapsedTime indicates
  * the number of milliseconds passed since the last frame.
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function render(elapsedTime, ctx) {
  //draws background
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  //draws players and his bullets
  player.render(elapsedTime, ctx);
  //draws asteroids
  for (i = 0; i < asteroid.length; i++) {
	asteroid[i].render(elapsedTime, ctx);
  }
  //draw ui text
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Level: " + level, 665, 475);
  ctx.fillText("Score: " + score, 330, 475)
  ctx.fillText("Lives: ", 15, 475);
  //draw lives
  ctx.strokeStyle = 'white';
  for(var i = 0; i< lives;i++){
	  ctx.beginPath();
	  ctx.moveTo(85+(i*25), 455);
	  ctx.lineTo(75+(i*25), 475);
	  ctx.lineTo(85+(i*25), 465);
	  ctx.lineTo(95+(i*25), 475);
	  ctx.closePath();
	  ctx.stroke();
  }  
  //draws state specific ui
  switch(state){
	  case 'idle':
		if(level == 1){
			ctx.fillStyle = "white";
			ctx.font = "bold 100px Arial";
			ctx.fillText("ASTEROIDS", 90, 200);
		}
		else{
			if(level>9){
				ctx.fillStyle = "white";
				ctx.font = "bold 100px Arial";
				ctx.fillText("LEVEL " + (level), 170, 200);
			}
			else{
				ctx.fillStyle = "white";
				ctx.font = "bold 100px Arial";
				ctx.fillText("LEVEL " + level, 190, 200);
			}
		}
		ctx.fillStyle = "white";
		ctx.font = "30px Arial";
		ctx.fillText("Press any key to start!", 240, 400);
		break;
  }//end switch
}

function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

function createAstroids(elapsedTime){
	for(i = 0; i < level+9; i++){
		var count = 0; //used to stop infinite loop if there are no spots for asteroids to fit
		do{
			var cont = false;
			var x;
			var y;
			do{
				x = getRandomNumber(0, canvas.width);
				y = getRandomNumber(0, canvas.height);
			}while(x > canvas.width/2 - 130 && x < canvas.width/2 + 130 && y > canvas.height/2 - 130 && y < canvas.height/2 + 130);
			var temp = new Asteroid({x: x, y: y}, {x: getRandomNumber(-2, 2), y: getRandomNumber(-2, 2)}, getRandomNumber(25, 40), canvas);
			var tempLoc = temp.getLocation(elapsedTime);
			for(var j in asteroid){
				var currentAsteroid = asteroid[j].getLocation(elapsedTime);
				if(Math.pow(currentAsteroid.x - tempLoc.x, 2) + Math.pow(tempLoc.y - currentAsteroid.y, 2) <= Math.pow(tempLoc.radius + currentAsteroid.radius, 2)) cont = true;
			}
			count++;
		}while(cont && count<50); //stops asteroids from spawing on top of each other
		asteroid.push(temp);
	}
}

function splitAsteroid(elapsedTime, aster){
	var loc = aster.getLocation();
	var vel = aster.getVelocity();
	var massOne = getRandomNumber(15, vel.mass-15);
	var velOneX = massOne/vel.mass * vel.x - getRandomNumber(-2,0);
	var velOneY = massOne/vel.mass * vel.y + getRandomNumber(0,2);
	asteroid.push(new Asteroid({x: loc.x-1, y: loc.y}, {x: velOneX, y: velOneY}, massOne, canvas));
	asteroid.push(new Asteroid({x: loc.x, y: loc.y-1}, {x: vel.x - velOneX, y: vel.y - velOneY}, vel.mass - massOne, canvas));
}

function astroidCollisions(asteroidOne, asteroidTwo, direction){
	//gets locations of asteroids and finds roation angle ****
	var oneLoc = asteroidOne.getLocation();
	var twoLoc = asteroidTwo.getLocation();
	var angle = direction * Math.atan(Math.abs(oneLoc.y - twoLoc.y)/Math.abs(oneLoc.x - twoLoc.x));
	//finds velocities of astroids ****
	var oneVel = asteroidOne.getVelocity();
	var twoVel = asteroidTwo.getVelocity();
	//rotates those velocities ***
	var oneNewX = oneVel.x*Math.cos(angle) - oneVel.y*Math.sin(angle);
	var oneNewY = oneVel.x*Math.sin(angle) + oneVel.y*Math.cos(angle);
	var twoNewX = twoVel.x*Math.cos(angle) - twoVel.y*Math.sin(angle);
	var twoNewY = twoVel.x*Math.sin(angle) + twoVel.y*Math.cos(angle);
	//uses rotated velocities to compute new velocities *****
	var newOneVel = oneNewX*((oneVel.mass - twoVel.mass)/(oneVel.mass + twoVel.mass)) + twoNewX*((2*twoVel.mass)/(oneVel.mass + twoVel.mass));
	var newTwoVel = twoNewX*((twoVel.mass - oneVel.mass)/(twoVel.mass + oneVel.mass)) + oneNewX*((2*oneVel.mass)/(twoVel.mass + oneVel.mass));
	//Rotate back and create new astroid with correct velocities rotated ****
	oneVel.x = newOneVel*Math.cos(-angle) - oneNewY*Math.sin(-angle);
	oneVel.y = newOneVel*Math.sin(-angle) + oneNewY*Math.cos(-angle);
	asteroidOne.setVelocity({x: oneVel.x, y: oneVel.y});
	twoVel.x = newTwoVel*Math.cos(-angle) - twoNewY*Math.sin(-angle);
	twoVel.y = newTwoVel*Math.sin(-angle) + twoNewY*Math.cos(-angle);
	asteroidTwo.setVelocity({x: twoVel.x, y: twoVel.y});
	//roates the positions
	var oneNewXloc = oneLoc.x*Math.cos(angle) - oneLoc.y*Math.sin(angle);
	var oneNewYloc = oneLoc.x*Math.sin(angle) + oneLoc.y*Math.cos(angle);
	var twoNewXloc = twoLoc.x*Math.cos(angle) - twoLoc.y*Math.sin(angle);
	var twoNewYloc = twoLoc.x*Math.sin(angle) + twoLoc.y*Math.cos(angle);
	//uses rotates positions to change x positions
	var overlap = Math.ceil(((oneLoc.radius + twoLoc.radius) - Math.abs(oneLoc.x - twoLoc.x))/8);
	if(overlap > 0){
		if(oneLoc.x > twoLoc.x){
			oneNewXloc += overlap;
			twoNewXloc -= overlap;
		}
		else{
			oneNewXloc -= overlap;
			twoNewXloc += overlap;
		}
	}
	//roates the positions back and sets values in asteroid
	oneLoc.x = oneNewXloc*Math.cos(-angle) - oneNewYloc*Math.sin(-angle);
	oneLoc.y = oneNewXloc*Math.sin(-angle) + oneNewYloc*Math.cos(-angle);
	twoLoc.x = twoNewXloc*Math.cos(-angle) - twoNewYloc*Math.sin(-angle);
	twoLoc.y = twoNewXloc*Math.sin(-angle) + twoNewYloc*Math.cos(-angle);
	asteroidOne.setPosition({x: oneLoc.x, y: oneLoc.y});
	asteroidTwo.setPosition({x: twoLoc.x, y: twoLoc.y});
	
}
},{"./asteroid.js":2,"./game.js":4,"./player.js":5}],2:[function(require,module,exports){
"use strict";

const MS_PER_FRAME = 1000/8;

/**
 * @module exports the Asteroid class
 */
module.exports = exports = Asteroid;

/**
 * @constructor Asteroid
 * Creates a new Asteroid object
 * @param {Postition} position object specifying an x and y
 */
function Asteroid(position, velocity, size, canvas) {
  this.worldWidth = canvas.width;
  this.worldHeight = canvas.height;
  this.size = size;
  this.gone = false;
  this.position = {
    x: position.x,
    y: position.y
  };
  this.velocity = {
    x: velocity.x,
    y: velocity.y
  }
}



/**
 * @function updates the Asteroid object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Asteroid.prototype.update = function(time) {
  // Apply velocity
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;
  // Wrap around the screen
  if(this.position.x < 0) this.position.x += this.worldWidth;
  if(this.position.x > this.worldWidth) this.position.x -= this.worldWidth;
  if(this.position.y < 0) this.position.y += this.worldHeight;
  if(this.position.y > this.worldHeight) this.position.y -= this.worldHeight;
}

/**
 * @function renders the Asteroid into the provided context
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Asteroid.prototype.render = function(time, ctx) {
  // Draw Asteriod
  ctx.save();
  if(this.size < 30) ctx.strokeStyle = 'red';
  else ctx.strokeStyle = 'orange';
  ctx.beginPath();
  ctx.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI, false); //(x,y,radius, for circle = 0, for circle = 2* MAth.PI)
  ctx.stroke();
  ctx.restore();
}

Asteroid.prototype.getStatus = function(time) {
  return this.gone;
}

Asteroid.prototype.getLocation = function(){
	return {x: this.position.x, y:this.position.y, radius: this.size};
}

Asteroid.prototype.destory = function(time){
	this.gone = true;
}

Asteroid.prototype.getVelocity = function(){
	return {x: this.velocity.x, y:this.velocity.y, mass: this.size};
}

Asteroid.prototype.setVelocity = function(velocity){
	this.velocity.x = velocity.x;
	this.velocity.y = velocity.y;
}

Asteroid.prototype.setPosition = function(position){
	this.position.x = position.x;
	this.position.y = position.y;
}
},{}],3:[function(require,module,exports){
"use strict";

const MS_PER_FRAME = 1000/8;

/**
 * @module exports the Bullet class
 */
module.exports = exports = Bullet;

/**
 * @constructor Bullet
 * Creates a new Bullet object
 * @param {Postition} position object specifying an x and y
 */
function Bullet(position, angle, canvas) {
  this.worldWidth = canvas.width;
  this.worldHeight = canvas.height;
  this.size = 3;
  this.spd = 10;
  this.offScreen = false;
  this.position = {
    x: position.x,
    y: position.y
  };
  this.velocity = {
    x: -this.spd * Math.sin(angle),
    y: -this.spd * Math.cos(angle)
  }
}
//var radians = dir*Math.PI/180.0;


/**
 * @function updates the Bullet object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Bullet.prototype.update = function(time) {
  // Apply velocity
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;
  if(this.position.x < 0 - this.size || this.position.x > this.worldWidth + this.size || this.position.y < 0 - this.size || this.position.y > this.worldHeight + this.size) this.offScreen = true;
}

/**
 * @function renders the Bullet into the provided context
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Bullet.prototype.render = function(time, ctx) {
  // Draw bullet
  ctx.save();
  ctx.strokeStyle = 'cyan';
  ctx.beginPath();
  ctx.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI, false); //(x,y,radius, for circle = 0, for circle = 2* MAth.PI)
  ctx.stroke();
  ctx.restore();
}

Bullet.prototype.getStatus = function(time) {
  return this.offScreen;
}

Bullet.prototype.getLocation = function(time){
	return {x: this.position.x, y:this.position.y, radius: this.size}
}

Bullet.prototype.destory = function(time){
	this.offScreen = true;
}

Bullet.prototype.getDestory = function(){
	return this.offScreen;
}
},{}],4:[function(require,module,exports){
"use strict";

/**
 * @module exports the Game class
 */
module.exports = exports = Game;

/**
 * @constructor Game
 * Creates a new game object
 * @param {canvasDOMElement} screen canvas object to draw into
 * @param {function} updateFunction function to update the game
 * @param {function} renderFunction function to render the game
 */
function Game(screen, updateFunction, renderFunction) {
  this.update = updateFunction;
  this.render = renderFunction;

  // Set up buffers
  this.frontBuffer = screen;
  this.frontCtx = screen.getContext('2d');
  this.backBuffer = document.createElement('canvas');
  this.backBuffer.width = screen.width;
  this.backBuffer.height = screen.height;
  this.backCtx = this.backBuffer.getContext('2d');

  // Start the game loop
  this.oldTime = performance.now();
  this.paused = false;
}

/**
 * @function pause
 * Pause or unpause the game
 * @param {bool} pause true to pause, false to start
 */
Game.prototype.pause = function(flag) {
  this.paused = (flag == true);
}

/**
 * @function loop
 * The main game loop.
 * @param{time} the current time as a DOMHighResTimeStamp
 */
Game.prototype.loop = function(newTime) {
  var game = this;
  var elapsedTime = newTime - this.oldTime;
  this.oldTime = newTime;

  if(!this.paused) this.update(elapsedTime);
  this.render(elapsedTime, this.frontCtx);

  // Flip the back buffer
  this.frontCtx.drawImage(this.backBuffer, 0, 0);
}

},{}],5:[function(require,module,exports){
"use strict";

const MS_PER_FRAME = 1000/8;
const Bullet = require('./bullet.js');

/**
 * @module exports the Player class
 */
module.exports = exports = Player;

/**
 * @constructor Player
 * Creates a new player object
 * @param {Postition} position object specifying an x and y
 */
function Player(position, canvas) {
  this.worldWidth = canvas.width;
  this.worldHeight = canvas.height;
  this.bullets = [];
  this.start = false;
  this.state = 'idle';
  this.position = {
    x: position.x,
    y: position.y
  };
  this.velocity = {
    x: 0,
    y: 0
  }
  this.angle = 0;
  this.radius  = 64;
  this.thrusting = false;
  this.steerLeft = false;
  this.steerRight = false;
  this.bulletShoot = true;
  this.warpNow = true;
  this.soundSlot = 0;
  this.laser = [new Audio(), new Audio(), new Audio(), new Audio(), new Audio(), new Audio(), new Audio(), new Audio(), new Audio(), new Audio()];
  this.laser[0].src = 'assets/laser.wav';
  this.laser[1].src = 'assets/laser.wav';
  this.laser[2].src = 'assets/laser.wav';
  this.laser[3].src = 'assets/laser.wav';
  this.laser[4].src = 'assets/laser.wav';
  this.laser[5].src = 'assets/laser.wav';
  this.laser[6].src = 'assets/laser.wav';
  this.laser[7].src = 'assets/laser.wav';
  this.laser[8].src = 'assets/laser.wav';
  this.laser[9].src = 'assets/laser.wav';

  var self = this;
  window.onkeydown = function(event) {
	event.preventDefault();
    switch(event.key) {
      case 'ArrowUp': // up
      case 'w':
        self.thrusting = true;
        break;
      case 'ArrowLeft': // left
      case 'a':
        self.steerLeft = true;
        break;
      case 'ArrowRight': // right
      case 'd':
        self.steerRight = true;
        break;
	  case 'v':
		if(self.bulletShoot){
			var temp = new Bullet({x: self.position.x, y: self.position.y}, self.angle, canvas);
			self.laser[self.soundSlot].play();
			self.soundSlot++;
			if(self.soundSlot>9) self.soundSlot = 0;
			self.bullets.push(temp);
			self.bulletShoot = false;
		}
		break;
	  case 'b':
		if(self.warpNow){
			self.state = 'warp';
			self.warpNow = false;
		}
		break;
    }
	self.start = true;
  }

  window.onkeyup = function(event) {
    switch(event.key) {
      case 'ArrowUp': // up
      case 'w':
        self.thrusting = false;
        break;
      case 'ArrowLeft': // left
      case 'a':
        self.steerLeft = false;
        break;
      case 'ArrowRight': // right
      case 'd':
        self.steerRight = false;
        break;
	  case 'v':
        self.bulletShoot = true;
        break;
	  case 'b':
        self.warpNow = true;
        break;
    }
  }
}



/**
 * @function updates the player object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Player.prototype.update = function(time, asteroid, canvas) {
  if(this.state == 'warp'){
	  this.state = 'running';
	  var position = {x: 0, y: 0};
		do{
			var cont = false;
			position.x = getRandomNumber(0, canvas.width);
			position.y = getRandomNumber(0, canvas.height);
			for(var j in asteroid){
				var currentAsteroid = asteroid[j].getLocation(0);
				if(Math.pow(currentAsteroid.x - position.x, 2) + Math.pow(position.y - currentAsteroid.y, 2) <= Math.pow(25 + currentAsteroid.radius, 2)) cont = true;
			}
		}while(cont); //stops asteroids from spawing on top of each other
		this.position.x = position.x;
		this.position.y = position.y;
  }
  
  // Apply angular velocity
  if(this.steerLeft) {
    this.angle += time * 0.005;
  }
  if(this.steerRight) {
    this.angle -= 0.1;
  }
  // Apply acceleration
  if(this.thrusting) {
    var acceleration = {
      x: Math.sin(this.angle),
      y: Math.cos(this.angle)
    }
    this.velocity.x -= acceleration.x;
    this.velocity.y -= acceleration.y;
  }
  // Apply velocity
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;
  // Wrap around the screen
  if(this.position.x < 0) this.position.x += this.worldWidth;
  if(this.position.x > this.worldWidth) this.position.x -= this.worldWidth;
  if(this.position.y < 0) this.position.y += this.worldHeight;
  if(this.position.y > this.worldHeight) this.position.y -= this.worldHeight;
  
  //update bullets
  for (var i = this.bullets.length; i >0; i--) {
	var temp = this.bullets.shift();
	temp.update(time);
	if(temp.getStatus(time) == false) this.bullets.push(temp);
  }
}

/**
 * @function renders the player into the provided context
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Player.prototype.render = function(time, ctx) {
  ctx.save();

  //draw bullets
  for (var i = 0; i < this.bullets.length; i++) {
	this.bullets[i].render(time, ctx);
  }
  
  // Draw player's ship
  ctx.translate(this.position.x, this.position.y);
  ctx.rotate(-this.angle);
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(-10, 10);
  ctx.lineTo(0, 0);
  ctx.lineTo(10, 10);
  ctx.closePath();
  ctx.strokeStyle = 'white';
  ctx.stroke();

  // Draw engine thrust
  if(this.thrusting) {
    ctx.beginPath();
    ctx.moveTo(0, 20);
    ctx.lineTo(5, 10);
    ctx.arc(0, 10, 5, 0, Math.PI, true);
    ctx.closePath();
    ctx.strokeStyle = 'orange';
    ctx.stroke();
  }
  ctx.restore();
}

Player.prototype.getBullets = function(time){
	return this.bullets;
}

Player.prototype.hasStarted = function(time){
	return this.start;
}

Player.prototype.getLocation = function(){
	return {x: this.position.x, y:this.position.y, angle: this.angle};
}

Player.prototype.resetLocation = function(canvas){
	this.x =canvas.width/2;
	this.y = canvas.height/2;
	this.angle = 0;
}

function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}
},{"./bullet.js":3}]},{},[1]);

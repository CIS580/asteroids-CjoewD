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
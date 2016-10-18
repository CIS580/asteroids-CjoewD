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
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
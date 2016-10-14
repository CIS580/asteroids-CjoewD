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
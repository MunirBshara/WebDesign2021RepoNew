//sources
// https://eloquentjavascript.net/code/chapter/17_canvas.js
// https://developer.mozilla.org/en-US/docs/Web/API/Element/mousemove_event
// Mr. Cozort's given code

//##################### ALL GLOBALS AND UTILITY FUNCTIONS ###################

//initializing GLOBAL variables to create a canvas
let canvasDiv;
let canvas;
let ctx;
let WIDTH = 768;
let HEIGHT = 768;
let POINTS = 0;
let paused = false;
let powername= "dfsfds";

//walls
let walls = [];

//array for mobs/enemies
let mobs1 = [];
// lets us know if game is initialized
let initialized = false;
// lets us know if a game is deleted
let deleted = false;

//spawner for the two lanes of "mobs"
function spawnMob(x) {
  for (i = 0; i < 20; i++) {
    if (i < 10) {
      mobs1.push(new Mob(30, 10, 200 + i * 35, 200, 'red', 0, 0));
    } else if (i < 20) {
      mobs1.push(new Mob(30, 10, 200 + (i - 10) * 35, 185, 'yellow', 0, 0));
    }
  }
}

// draws text on canvas
function drawText(color, font, align, base, text, x, y) {
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = base;
  ctx.fillText(text, x, y);
}

//########################### Initialize game function #######################

function init() {
  // create a new div element
  canvasDiv = document.createElement("div");
  canvasDiv.id = "chuck";
  // and give it some content
  canvas = document.createElement('canvas');
  // add the text node to the newly created div
  canvasDiv.appendChild(canvas);
  // add the newly created element and its content into the DOM
  const currentDiv = document.getElementById("div1");
  document.body.insertBefore(canvasDiv, currentDiv);
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  document.getElementById("chuck").style.width = canvas.width + 'px';
  document.getElementById("chuck").style.height = canvas.height + 'px';
  canvas.style = "position: absolute; top: 50px; left: 100PX; border:2px solid blue"
  ctx = canvas.getContext('2d');
}


//############################ ALL GAME CLASSES #########################
class Sprite {
  constructor(w, h, x, y, c) {
    this.w = w;
    this.h = h;
    this.x = x;
    this.y = y;
    this.color = c;
    this.spliced = false;
  }
  //checking for inbounds
  inbounds() {
    if (this.x + this.w < WIDTH &&
      this.x > 0 &&
      this.y > 0 &&
      this.y + this.h < HEIGHT) {
      return true;
    } else {
      return false;
    }
  }
  //checking for object collisions
  collide(obj) {
    if (this.x <= obj.x + obj.w &&
      obj.x <= this.x + this.w &&
      this.y <= obj.y + obj.h &&
      obj.y <= this.y + this.h
    ) {
      return true;
    }
  }
}

//Player class
class Player extends Sprite {
  constructor(w, h, x, y, c, vx, vy) {
    super(w, h, x, y, c);
    this.vx = vx;
    this.vy = vy;
    this.speed = 3;
    this.canjump = true;
  }
  moveinput() {
    if ('a' in keysDown || 'A' in keysDown) { // Player control
      this.vy = 0;
      this.vx = -this.speed;

    } else if ('d' in keysDown || 'D' in keysDown) { // Player control
      this.vy = 0;
      this.vx = this.speed;
    } else {
      this.vx = 0;
      this.vy = 0;
    }
  }
  update() {
    this.moveinput();
    if (!this.inbounds()) {
      if (this.x <= 0) {
        this.x = 0;
      }
      if (this.x + this.w >= WIDTH) {
        this.x = WIDTH - this.w;
      }
      if (this.y + this.h >= HEIGHT) {
        this.y = HEIGHT - this.h;
        this.canjump = true;
      }
      // alert('out of bounds');
      // console.log('out of bounds');
    }

    this.x += this.vx;
    this.y += this.vy;
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.strokeRect(this.x, this.y, this.w, this.h);
  }
}

//mob class for the palettes needing to be destroyed
class Mob extends Sprite {
  constructor(w, h, x, y, c, vx, vy) {
    super(w, h, x, y, c);
    this.vx = vx;
    this.vy = vy;
    this.type = "normal";
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (!this.inbounds()) {
      if (this.x < 0 || this.x > WIDTH) {
        this.vx *= -1;
      }
      if (this.y < 0 || this.y > HEIGHT) {
        this.vy *= -1;
      }
      // alert('out of bounds');
      // console.log('out of bounds');
    }
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.strokeRect(this.x, this.y, this.w, this.h);
  }
}

//ball class for all balls in the game
class Ball extends Sprite {
  constructor(w, h, x, y, c, vx, vy, lastmovementx, lastmovementy) {
    super(w, h, x, y, c);
    this.vx = vx;
    this.vy = vy;
    this.lastmovementx = lastmovementx;
    this.lastmovementy = lastmovementy;
    this.type = "normal";
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (!this.inbounds()) {
      if (this.x < 0 || this.x > WIDTH) {
        this.lastmovementx = true;
        this.lastmovementy = false;
        this.vx *= -1.05;
      }
      if (this.y < 0) {
        if (this.lastmovementx != null) {
          this.lastmovementx = false;
        }
        this.lastmovementy = true;
        this.vy *= -1.05;
      }
      if (this.y > HEIGHT) {
        return true;
      }
      // alert('out of bounds');
      // console.log('out of bounds');
    }
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.strokeRect(this.x, this.y, this.w, this.h);
  }
}

class Powerup extends Sprite {
  constructor(w, h, x, y, c, vy, types) {
    super(w, h, x, y, c);
    this.vy = vy;
    this.types = types;
    this.type = "normal";
  }
  update() {
    this.y += this.vy;
    this.types = this.types;
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.strokeRect(this.x, this.y, this.w, this.h);
  }
}

class Wall extends Sprite {
  constructor(w, h, x, y, c) {
    super(w, h, x, y, c);
    this.type = "normal";
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.strokeRect(this.x, this.y, this.w, this.h);
  }
}

//variables for game instatiation
let player = new Player(70, 10, WIDTH / 2 - 35, HEIGHT - 100, 'red', 0, 0);
let ball = new Ball(5, 5, WIDTH / 2 - 2.5, HEIGHT - 120, 'green', 
  (Math.random() - .5) * 3, -Math.random() * 2, null, true);
let ball2 = new Ball(5, 5, WIDTH / 2 - 2.5, HEIGHT - 120, 'green', 
  (Math.random() - .5) * 3, -Math.random() * 2, null, true);
let balls = [ball, ball2];
let powerups = [];

// spawns 20 mobs
spawnMob(20);

// ########################## USER INPUT ###############################

let keysDown = {};

addEventListener("keydown", function (e) {
  keysDown[e.key] = true;
}, false);

addEventListener("keyup", function (e) {
  delete keysDown[e.key];
}, false);

// ########## UPDATE ALL ELEMENTS ON CANVAS ################################
function update() {
  player.update();
  //updates balls and checks to see if ball falls off bottom of map
  for (b in balls) {
    if (balls[b].update()) {
      if (balls.length > 1) {
        balls.splice(b, 1);
        continue;
      } else {
        balls.splice(b, 1);
        continue;
      }
    }
    //ball collision with player and movement
    if (balls[b].collide(player)) {
      balls[b].vy *= -1;
      balls[b].lastmovementy == true;
      balls[b].lastmovementx == false;
    }
  }
  //updating the falling powerups
  for (p in powerups) {
    powerups[p].update();
    if (powerups[p].types > .5) {
      powerups.splice(p, 1);
      continue;
    }
    //debuging
    console.log(powerups[p].types);
    //checking powerup collision and random powerup
    if (powerups[p].collide(player)) {
      msg1="POWERUP";
      msg2="OBTAINED";
      document.getElementById("powerupmsg1").innerHTML = msg1;
      document.getElementById("powerupmsg2").innerHTML = msg2;
      if (powerups[p].types < .1) {
        powername="NEW POWERUP: EXTRA BALL";
        balls.push(new Ball(5, 5, WIDTH / 2 - 2.5, HEIGHT - 120, 'green', 
          (Math.random() - .5) * 3, -Math.random() * 2, null, true));
      } else if (powerups[p].types < .2) {
        powername="NEW POWERUP: SMALL PADDLE";
        player.w = player.w / 2;
      } else if (powerups[p].types < .3) {
        powername="NEW POWERUP: WIDE PADDLE";
        player.w = player.w * 2;
      } else if (powerups[p].types < .4) {
        powername="NEW POWERUP: FASTER BALLS";
        for(let b in balls){
          balls[b].vx=balls[b].vx*2;
          balls[b].vy=balls[b].vy*2;
        }
      } else{
        powername="NEW POWERUP: GRAVITY FIELD";
        for(let b in balls){
          balloldy=balls[b].vy
          balls[b].vy=balls[b].vx;
          balls[b].vx=balloldy*2;
        }
      }
      drawText('black', "24px Helvetica", "left", "top", powername, 0, 100);
      setTimeout(function(){
        document.getElementById("powerupmsg1").innerHTML = '';document.getElementById("powerupmsg2").innerHTML = ''; powername="hi"}, 3000);
      powerups.splice(p, 1);
    }
  }
  //checking for mob and ball collisions
  for (let m in mobs1) {
    for (let b in balls) {
      mobs1[m].update();
      if (balls[b].collide(mobs1[m])) {
        powerups.push(new Powerup(10, 10, mobs1[m].x, mobs1[m].y, 'purple', 2, 
          Math.random()));
        POINTS = POINTS + 10;
        deleted = true;
        if (balls[b].lastmovementy == true || balls[b].y + 5 > 200) {
          balls[b].vy *= -1;
        } else if (balls[b].lastmovementx == true) {
          balls[b].vx *= -1;
        }
      }
    }
    //checks if mob has been deleted to avoid logic errors with checking all 
    //the mobs
    if (deleted) {
      deleted = false;
      mobs1.splice(m, 1);
    }
  }
}

// ########## DRAW ALL ELEMENTS ON CANVAS ##########
function draw() {
  // clears the canvas before drawing
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawText('black', "24px Helvetica", "left", "top", "Points: " + POINTS, 0, 0);

  //drawing sprites
  player.draw();
  for (let b of balls) {
    b.draw();
  }
  for (let p of powerups) {
    p.draw();
  }
  for (let w of walls) {
    w.draw();
  }
  for (let m of mobs1) {
    m.draw();
  }
}


// set variables necessary for game loop
let now;
let gDelta;
let then = performance.now();

//basically the main function
function change() {
  initialized = true;
  document.querySelector('#check').textContent = 'SPEED UP';
  if (initialized) {
    if (!paused) {
      update(gDelta);
    }
    draw();
  }
  then = now;

  //checking for end of game
  if (mobs1.length != 0 && balls.length != 0) {
    requestAnimationFrame(change);
  } else if (mobs1.length == 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawText('black', "24px Helvetica", "left", "top", "YOU WIN, WITH: " 
      + POINTS + " POINTS", 0, 0);
  } else if (balls.length == 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawText('black', "24px Helvetica", "left", "top", "YOU HAVE LOST, WITH: " 
      + POINTS + " POINTS", 0, 0);
  }
}
// helper function

// setup of the canvas

var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');

var x = 50;
var y = 50;

const RADIUS = 20;
function canvasDraw() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f00";
  ctx.beginPath();
  ctx.arc(x, y, RADIUS, 0, 2*Math.PI, true);
  ctx.fill();
}
//canvasDraw();

// pointer lock object forking for cross browser

canvas.requestPointerLock = canvas.requestPointerLock ||
                            canvas.mozRequestPointerLock;

document.exitPointerLock = document.exitPointerLock ||
                           document.mozExitPointerLock;

canvas.onclick = function() {
  canvas.requestPointerLock();
};

// pointer lock event listeners

// Hook pointer lock state change events for different browsers
document.addEventListener('pointerlockchange', lockChangeAlert, false);
document.addEventListener('mozpointerlockchange', lockChangeAlert, false);

function lockChangeAlert() {
  if (document.pointerLockElement === canvas ||
      document.mozPointerLockElement === canvas) {
    console.log('The pointer lock status is now locked');
    paused = false;
    document.addEventListener("mousemove", updatePosition, false);
  } else {
    console.log('The pointer lock status is now unlocked');  
    paused = true;
    document.removeEventListener("mousemove", updatePosition, false);
  }
}

//var tracker = document.getElementById('tracker');


class vec2
{
    constructor(x,y)
    {
        this.x = x;
        this.y = y;
    }
    length() //gets the vector length
    {
        return Math.sqrt(this.x**2 + this.y**2);
    }
    normalize()//normalizes the vector so the lenth is 1 (ie its a direcitonal vector)
    {
        let len = this.length();
        if(len == 0)return console.log("error no length");
        this.x /= len;
        this.y /= len;
        return this;
    }
    floatMul(f)
    {
        return new vec2(this.x*f, this.y*f);
    }
    mul(v)
    {
        return new vec2(this.x*v.x, this.y*v.y);
    }
    add(v)
    {
        return new vec2(this.x+v.x, this.y+v.y);
    }
    dist(v)
    {
        return new vec2(Math.abs(this.x - v.x),Math.abs(this.y-v.y)).length();
    }
}


const MAXSTEPPERPHYSICSFRAME = 0.001;
const BACKGROUNDCOLOR = "black";
var mousedx = 0;
var paused = true;
class Ball
{
    constructor(pos,radius, color, speed=2, direction = new vec2(0.5,0.5))
    {
        this.pos = new vec2(pos.x, pos.y);
        this.radius = radius;
        this.speed = speed;
        direction.normalize();
        this.direction = direction;
        this.color = color;
    }
    draw()
    {
       
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2*Math.PI, true);
        ctx.fill();
        ctx.closePath();
    }
    update(time)
    {
        Math.min(this.speed*time, this.radius/2) //make sure you are never moving faster than 1 radi (or half the ball size a cyles) this will prevent weird errros where you ping through objects
        this.physicsFrame(this.direction.floatMul(this.speed*time).add(this.pos),time);
    }
    physicsFrame(newpos,time)
    {
        var dx = newpos.x-this.pos.x;
        var dy = newpos.y-this.pos.y;
        if(this.pos.x + dx > canvas.width-this.radius || this.pos.x + dx < this.radius) {
            dx = -dx;
        }
        if(this.pos.y + dy < this.radius) {
            dy = -dy;
        }
        if(this.pos.y + dy > canvas.height+this.radius*20) {
            balls = balls.filter(x=> x!==this);
            return;
        }
        if(paddle.ishit(this.pos,this.radius))
        {
            dy = -dy;
        }
        for(let i = 0; i < bricks.length; i++)
        {
            if(bricks[i].ishit(this.pos,this.radius))
            {
                bricks[i].lives -= 1;
                if(bricks[i].lives < 1) bricks.splice(i,1);
                dy = -dy;
                break;
            }
        }
        this.direction = new vec2(dx,dy);
        this.speed = this.direction.length()/time;
        this.direction.normalize();
        this.pos = this.direction.floatMul(this.speed*time).add(this.pos);

        if(paddle.ishit(this.pos, this.radius))
        {
            
            //we are inside the paddle still.
            this.pos.y = paddle.pos.y-(paddle.height/2)-this.radius-2; //move it out forcefully;
            this.direction.y = -1;
            this.direction.normalize();
            console.log("im inside");
            this.speed += 1;
        }
    }
}

class Brick
{
    constructor(pos,length, height, color, lives)
    {
        this.pos = new vec2(pos.x, pos.y);
        this.length = length;
        this.height = height;
        this.color = color;
        this.lives = lives;
    }
    draw()
    {
        ctx.beginPath();
        var a = 20;
        ctx.fillStyle = `${this.color}${((10).toString(16))}`;
        ctx.fillRect(this.pos.x-(this.length/2), this.pos.y-(this.height/2), this.length, this.height);
        ctx.fill();
        ctx.closePath();
    }
    ishit(pos, radius)
    {
        return pos.x-radius >= this.pos.x-(this.length/2+2) && pos.x+radius <= this.pos.x+(this.length/2+2) && pos.y+radius >= this.pos.y-(this.height/2) && pos.y-radius <= this.pos.y+(this.height/2);
    }
}

class Paddle
{
    constructor(pos,length, height, color, speed=200)
    {
        this.pos = new vec2(pos.x, pos.y);
        this.length = length;
        this.height = height;
        this.maxSpeed = speed;
        this.direction = 0;
        this.color = color;
    }
    draw()
    {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.fillRect(this.pos.x-(this.length/2), this.pos.y-(this.height/2), this.length, this.height);
        ctx.fill();
        ctx.closePath();
    
    }
    update(time)
    {
        this.pos.x += mousedx*time*this.maxSpeed;
        mousedx = 0;
        if(this.pos.x - (this.length/2) >= canvas.width) this.pos.x = 0-this.length/2+1;
        if(this.pos.x + (this.length/2) <=  0) this.pos.x = canvas.width + this.length/2 -1;
    }
    ishit(pos, radius)
    {
        return pos.x-radius >= this.pos.x-(this.length/2+2) && pos.x+radius <= this.pos.x+(this.length/2+2) && pos.y+radius >= this.pos.y-(this.height/2) && canvas.height >= pos.y+radius;
    }
}

var balls = [new Ball(new vec2(200,300),5, "white", 500,new vec2(1,1))]
var paddle = new Paddle(new vec2(canvas.width/2,canvas.height-22),50,5,"white");
var bricks = [];
function resetViewPort()
{
    ctx.fillStyle = BACKGROUNDCOLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fill();
}

window.setInterval(function() //render frame
{
    resetViewPort();
    balls.map(x=> x.draw());
    paddle.draw();
    bricks.map(x=> x.draw());
}, 30);

var newballtimer = 0;
window.setInterval(function()//physics frame
{
    if(paused) return;
    balls.map(x=> x.update(0.001));
    paddle.update(0.001);

    if(newballtimer > 1000){ balls.push(new Ball(new vec2(200,300),5, "white", 500,new vec2(1,1))); newballtimer = 0;}
    newballtimer += 1;

}, 1);



function updatePosition(e) 
{
    mousedx +=  Math.min(Math.max(e.movementX, -100), 100); 
}

for(let c =0; c < 20; c++)
{
    for(let r = 0; r < 30; r++)
    {
        bricks.push(new Brick(new vec2(r*20+20,c*11+20),18,9,"FFFFFF",1));
    }
}
var a = 20;


//stuff i have to do 
//task 1
document.addEventListener("dblclick", (e)=> console.log("you double clicked"));
document.addEventListener("wheel", (e)=> console.log("you used the mouse wheel"));
document.addEventListener("offline", (e)=> console.log("you are offline"));
document.addEventListener("copy", (e)=> alert("you copied someting"));
document.addEventListener("paste", (e)=> console.log("you pasted something"));
document.addEventListener("keydown", (e)=> console.log(`#${e.keyCode} key is down`));

//task 2
var footer = document.querySelector("footer");
var footertext = document.querySelector("footer p");

footer.addEventListener("click", e => console.log("footer"));
footertext.addEventListener("click", e => { console.log("text"); e.stopPropagation()});

//task 3
var nav = document.querySelectorAll("nav a");
[...nav].map(x=> x.addEventListener("click", e=> e.preventDefault()));




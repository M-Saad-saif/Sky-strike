let opening_interface = document.querySelector(".image-container");
let option_interface = document.querySelector(".container");
let score_part = document.querySelector("#score");
let timeBtn = document.querySelector("#time-btn");
let easyBtn = document.querySelector("#easy-btn");
let hardBtn = document.querySelector("#hard-btn");
let insaneBtn = document.querySelector("#insane-btn");
let target_part = document.querySelector("#target-plane");
let validation = document.querySelector("#validation-notice");

let canvas = document.querySelector("canvas");
let c = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

let weaponType = null;
let firingInterval;
let lastArtilleryShoot = 0;
let score = 0;
let firing = false;
let plane_distroy = false;
let cannon_distroy = false;
let gameOverTimeout = null;

option_interface.style.display = "none";

opening_interface.addEventListener("click", () => {
  opening_interface.style.display = "none";
  option_interface.style.display = "block";
});

// for random targets==========
easyBtn.addEventListener("click", () => {
  target_part.innerHTML = Math.floor(Math.random() * 11 + 5);
  // target_part.innerHTML = 1;
});

hardBtn.addEventListener("click", () => {
  target_part.innerHTML = Math.floor(Math.random() * (25 - 15 + 1) + 15);
});

insaneBtn.addEventListener("click", () => {
  target_part.innerHTML = Math.floor(Math.random() * (35 - 25 + 1) + 25);
});
// ==============================

window.addEventListener("resize", () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;

  player.x = canvas.width / 2 - 100;
  player.y = canvas.height - 125;

  cannon.x = 10;
  cannon.y = canvas.height - 110;
});

// creating player
class Player {
  constructor() {
    let playerimage = new Image();
    playerimage.src = "antiaircraft gun.png";

    this.x = canvas.width / 2 - 100;
    this.y = canvas.height - 125;

    this.image = playerimage;
    let playerimageScale = 0.13;

    // for mobile screen
    if (window.innerWidth <= 950 && window.innerWidth >= 315) {
      playerimageScale = 0.1;
      this.y = canvas.height - 95;
    }

    this.image.onload = () => {
      this.width = this.image.width * playerimageScale;
      this.height = this.image.height * playerimageScale;
    };

    this.maxhealth = 15;
    this.health = this.maxhealth;

    let playerblastimage = new Image();
    playerblastimage.src = "player blast pic.png";
    this.blastImage = playerblastimage;

    this.blastImage.onload = () => {
      this.blastImage_width = this.blastImage.width * playerimageScale + 25;
      this.blastImage_height = this.blastImage.height * playerimageScale + 25;
    };
  }

  draw() {
    if (this.width && this.height)
      c.drawImage(this.image, this.x, this.y, this.width, this.height);
    // life line of player
    c.fillStyle = "green";

    // health line draw for mobile
    if (window.innerWidth <= 950 && window.innerWidth >= 315) {
      c.fillRect(
        this.x,
        this.y + 90,
        (this.health / this.maxhealth) * this.width,
        3
      );
      // for pc
    } else {
      c.fillRect(
        this.x,
        this.y + 118,
        (this.health / this.maxhealth) * this.width,
        3
      );
    }

    // player blast image
    if (this.health <= 0) {
      c.drawImage(
        this.blastImage,
        this.x,
        this.y - 20,
        this.blastImage_width,
        this.blastImage_height
      );
    }
  }
}

// creating cannon
class Cannon {
  constructor() {
    let cannonimage = new Image();
    cannonimage.src = "cannon image.png";

    this.x = 10;
    this.y = canvas.height - 110;
    this.image = cannonimage;

    if (window.innerWidth <= 950 && window.innerWidth >= 315) {
      this.y = canvas.height - 75;
    }
    // for mobile and pc
    let cannonimageScale =
      window.innerWidth <= 950 && window.innerWidth >= 315 ? 0.35 : 0.5;

    this.image.onload = () => {
      this.width = this.image.width * cannonimageScale;
      this.height = this.image.height * cannonimageScale;
    };
    this.maxhealth = 3;
    this.health = this.maxhealth;

    let cannanBlastPic = new Image();
    cannanBlastPic.src = "player blast pic.png";
    this.cannonblastImage = cannanBlastPic;

    this.cannonblastImage.onload = () => {
      this.cannonblastImage_width = this.cannonblastImage.width * 0.13;
      this.cannonblastImage_height = this.cannonblastImage.height * 0.13;
    };
  }

  draw() {
    if (this.width && this.height)
      c.drawImage(this.image, this.x, this.y, this.width, this.height);
    // life line of cannon
    c.fillStyle = "green";

    let cannon_life_height =
      window.innerWidth <= 950 && window.innerWidth >= 315 ? 70 : 104;
    c.fillRect(
      this.x,
      this.y + cannon_life_height,
      (this.health / this.maxhealth) * this.width,
      3
    );

    // cannon blast image
    let cannonblastImage_height =
      window.innerWidth <= 950 && window.innerWidth >= 315 ? -35 : 0;
    if (this.health <= 0)
      c.drawImage(
        this.cannonblastImage,
        this.x,
        this.y + cannonblastImage_height,
        this.cannonblastImage_width,
        this.cannonblastImage_height
      );
  }
}

// creating particles
class Particle {
  constructor(x, y, velocityX, velocityY, size, color, life) {
    this.x = x;
    this.y = y;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.size = size;
    this.color = color;
    this.life = life;
  }

  draw() {
    c.globalAlpha = Math.max(this.life / 20, 0);
    c.beginPath();
    c.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    c.globalAlpha = 1;
  }

  update() {
    this.x += this.velocityX;
    this.y += this.velocityY;

    this.life -= 1;
    this.size *= 0.95; //getting small over tmie

    this.draw();
  }
}

// creating bullets
class Bullet {
  constructor(x, y, radius, color, type = "normal", targetX, targetY, speed) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.type = type;

    let angle = Math.atan2(targetY - y, targetX - x);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.power = 1;
    this.particles = [];
  }

  draw() {
    // for cnanon

    if (this.type === "artillery") {
      let gradiant = c.createRadialGradient(
        this.x,
        this.y,
        0,
        this.x,
        this.y,
        this.radius * 3
      );

      gradiant.addColorStop(0, "rgba(255, 200, 100, 1)");
      gradiant.addColorStop(1, "rgba(255, 100, 0, 0)");

      c.fillStyle = gradiant;

      c.beginPath();
      c.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2, false);
      c.fill();
    }

    // for gun
    c.save();
    c.shadowBlur = 15;
    c.shadowColor = "red";
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    c.restore();
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    // fire particle of artileery
    if (this.type === "artillery") {
      this.particles.push(
        new Particle(
          this.x,
          this.y,
          (Math.random() - 0.5) * 1,
          (Math.random() - 0.5) * 1,
          Math.random() * 4 + 2,
          `hsl(${Math.random() * 60}, 100%, 50%)`,
          15
        )
      );
    }

    // fire particle of gun
    this.particles.push(
      new Particle(
        this.x,
        this.y,
        (Math.random() - 0.5) * 1,
        (Math.random() - 0.5) * 1,
        Math.random() * 5 + 2,
        `hsl(${Math.random() * 60}, 100%, 50%)`,
        10
      )
    );

    this.draw();

    this.particles.forEach((p, i) => {
      p.update();
      if (p.life < 0) {
        this.particles.splice(i, 1);
      }
    });
  }
}

// creating plane
class Plane {
  constructor(direction) {
    this.maxhealth = Math.random() * 20;
    this.health = this.maxhealth;
    // plane speed in miblie and laptop
    if (window.innerWidth <= 950 && window.innerWidth >= 315) {
      this.speed = 1 + Math.random() * 2.8;
    } else {
      this.speed = 2 + Math.random() * 10;
    }

    this.direction = direction;

    // plane for left👇 direction
    if (direction === "left") {
      let planepic = new Image();
      planepic.src = "planepic.png";
      this.image = planepic;

      let planepicScale = 0.41;
      if (window.innerWidth <= 950 && window.innerWidth >= 315) {
        planepicScale = 0.3;
      }
      this.image.onload = () => {
        this.width = this.image.width * planepicScale;
        this.height = this.image.height * planepicScale;
      };

      this.x = canvas.width;
      this.y = 10 + Math.random() * 150;
    } else {
      // plane for right👇 direction
      let planepic2 = new Image();
      planepic2.src = "planepic2.png";
      this.image = planepic2;

      let planepicScale2 = 0.41;
      // for mobile
      if (window.innerWidth <= 950 && window.innerWidth >= 315) {
        planepicScale2 = 0.3;
      }
      this.image.onload = () => {
        this.width = this.image.width * planepicScale2;
        this.height = this.image.height * planepicScale2;
      };

      this.x = -100;
      this.y = 10 + Math.random() * 150;
    }
    this.lastshoot = new Date();
    this.shootinterval = 2000;

    this.particles = [];
    this.jetSound = document.createElement("audio");
    this.jetSound.src = "jet engine.mp3";
    this.jetSound.play();
  }

  destroy() {
    // stop sound when plane dies
    this.jetSound.pause();
    this.jetSound.currentTime = 0;
  }

  draw() {
    if (this.width && this.height) {
      c.drawImage(this.image, this.x, this.y, this.width, this.height);
      c.fillStyle = "red";
      c.fillRect(
        this.x + 12,
        this.y + 20,
        (this.health / this.maxhealth) * this.width,
        2
      );
    }

    // drwaing planes particles
    this.particles.forEach((particle, p) => {
      particle.update();
      if (particle.life <= 0) {
        // console.log(this.particles);
        this.particles.splice(p, 1);
      }
    });
  }

  update() {
    // engin particles of plane coming from left👇
    if (this.direction === "left") {
      this.x -= this.speed;
      // particle positon for miblioe
      if (window.innerWidth <= 950 && window.innerWidth >= 315) {
        this.x -= this.speed;
        this.spawnPlaneParticles(
          this.x + this.width / 2 + 40,
          this.y + this.height / 2 + 5
        );
        // particle positon for lapotp
      } else {
        this.spawnPlaneParticles(
          this.x + this.width / 2 + 50,
          this.y + this.height / 2 + 6
        );
      }
      // engin particles of plane coming from right👇
    } else {
      this.x += this.speed;
      // particle positon for miblioe
      if (window.innerWidth <= 950 && window.innerWidth >= 315) {
        this.x += this.speed;
        this.spawnPlaneParticles(
          this.x + this.width / 2 - 40,
          this.y + this.height / 2 + 5
        );
        // particle positon for lapotp
      } else {
        this.spawnPlaneParticles(
          this.x + this.width / 2 - 50,
          this.y + this.height / 2 + 6
        );
      }
    }
    // removing engin particlse when plane go off or distroy
    // Update & remove particles (reverse loop for safety)
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      if (this.particles[i].life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Draw plane after particles so it's on top
    this.draw();
  }
  // spawing palne partticles function
  spawnPlaneParticles(px, py) {
    for (let i = 0; i < 2; i++) {
      this.particles.push(
        new Particle(
          px,
          py,
          (Math.random() - 0.5) * 1,
          (Math.random() - 0.5) * 1,
          Math.random() * 3 + 1,
          `hsl(${Math.random() * 60}, 100%, 50%)`,
          20
        )
      );
    }
  }

  // functio of jet missile sound
  jet_missile_sound() {
    this.jetMissileSound = document.createElement("audio");
    this.jetMissileSound.src = "jet missile sound.mp3";
    this.jetMissileSound.volume = 0.3;
    this.jetMissileSound.play();
  }

  shoot() {
    if (this.health <= 0 || player.health <= 0 || cannon.health <= 0) return; //with this👈 plane cannot fire
    let speed = window.innerWidth <= 950 && window.innerWidth >= 315 ? 6 : 10;

    // for weapon type gun
    if (weaponType === "gun") {
      let now = new Date();
      if (now - this.lastshoot > this.shootinterval) {
        enemymissile.push(
          new Bullet(
            this.x + this.width / 2,
            this.y + this.height,
            8,
            "yellow",
            "missile",
            player.x + player.width / 2,
            player.y + player.height,
            speed
          )
        );

        this.jet_missile_sound();
        this.lastshoot = now;
      }
      // for weapon type artillery
    } else if (weaponType === "artillery") {
      let now = new Date();
      if (now - this.lastshoot > this.shootinterval) {
        enemymissile.push(
          new Bullet(
            this.x + this.width / 2,
            this.y + this.height,
            8,
            "yellow",
            "missile",
            cannon.x + cannon.width / 2 - 100,
            cannon.y + cannon.height,
            speed
          )
        );
        this.jet_missile_sound();
        this.lastshoot = now;
      }
    }
  }
}

let player = new Player();
let cannon = new Cannon();
let planes = [];
let bullets = [];
let enemymissile = [];
let particles = [];
let explosion = [];

// ====spawning planes=====
function spawnPlane() {
  planes.push(new Plane("left"));
}

function spawnPlane1() {
  planes.push(new Plane("right"));
}

let planeSpawnInterval;
let planeSpawnInterval2;

function startSpawningPlanes() {
  planeSpawnInterval = setInterval(() => {
    if (weaponType) spawnPlane();
  }, 3000);

  planeSpawnInterval2 = setInterval(() => {
    if (weaponType) spawnPlane1();
  }, 6000);
}

// ================event listenenri=============
let mouse = {
  x: canvas.width / 2,
  y: canvas.height / 2,
};

window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener("mousedown", () => {
  if (player.health <= 0 || cannon.health <= 0) return; //with this👈 you cannot fire

  if (weaponType === "gun") {
    firing = true;
    firingInterval = setInterval(() => {
      let gunSound = document.createElement("audio");
      gunSound.volume = 0.6;
      gunSound.src = "gnfire.mp3";
      gunSound.play();
      gunSound.currentTime = 0;

      bullets.push(
        new Bullet(
          player.x + 120,
          player.y + 15,
          5,
          "red",
          "gun",
          mouse.x,
          mouse.y,
          10
        )
      );
    }, 50);
  } else if (weaponType === "artillery") {
    let now = new Date();
    if (now - lastArtilleryShoot > 1000) {
      let cannonsound = document.createElement("audio");
      cannonsound.src = "cannongun_fire.mp3";
      cannonsound.play();
      cannonsound.currentTime = 0;

      let cannon_bullet_hightpoisiton =
        window.innerWidth <= 950 && window.innerWidth >= 315 ? 20 : 50;
      let cannon_bullet_speed =
        window.innerWidth <= 950 && window.innerWidth >= 315 ? 15 : 23;

      bullets.push(
        new Bullet(
          cannon.x + 80,
          cannon.y + cannon_bullet_hightpoisiton,
          13,
          "red",
          "artillery",
          mouse.x,
          mouse.y,
          cannon_bullet_speed
        )
      );
      lastArtilleryShoot = now;
    }
  }
});

// funciton for gun and cannon evetlistenrer to not write again and again
function chosingweapon(type) {
  // /checking validation if player not select deff level
  if (target_part.innerHTML === "00") {
    firing = false;
    weaponType = null;
    bullets = [];

    validation.style.display = "block";
    setTimeout(() => {
      validation.style.display = "none";
    }, 1000);
  } else {
    weaponType = type;
    option_interface.style.display = "none";
    canvas.style.display = "block";
    startgame();
  }
}

window.addEventListener("mouseup", (e) => {
  firing = false;
  clearInterval(firingInterval);
});

document.querySelector("#gunbtn").addEventListener("click", () => {
  chosingweapon("gun");
});

document.querySelector("#cannonbtn").addEventListener("click", () => {
  chosingweapon("artillery");
});

// event listeners for mobile
window.addEventListener("touchmove", (e) => {
  let touch = e.touches[0]; // first finger
  mouse.x = touch.clientX - player.width / 2 - 5;
  mouse.y = touch.clientY - player.height / 2;
});

window.addEventListener("touchstart", () => {
  if (player.health <= 0 || firing) return;
  if (weaponType === "gun") {
    firing = true;
    firingInterval = setInterval(() => {
      let gunSound = document.createElement("audio");
      gunSound.volume = 0.6;
      gunSound.src = "gnfire.mp3";
      gunSound.play();
      gunSound.currentTime = 0;

      bullets.push(
        new Bullet(
          player.x + 85,
          player.y + 15,
          5,
          "red",
          "gun",
          mouse.x,
          mouse.y,
          10
        )
      );
    }, 50);
  }
});

window.addEventListener("touchend", () => {
  firing = false;
  clearInterval(firingInterval);
});

// ===========================================

// =======functions===========
// funciton sound of hitting player
function HittngPlayerSound() {
  let hittingMachineGun = document.createElement("audio");
  hittingMachineGun.src = "hitting machinegun.mp3";
  hittingMachineGun.volume = 0.4;
  hittingMachineGun.play();
}

// funciton sound of explosion
function explosionSound() {
  let explosionsound = document.createElement("audio");
  explosionsound.src = "explosion-01.mp3";
  explosionsound.play();
}

//function for calling particles
function updateParticles(
  x,
  y,
  Loopcounts,
  speedRange,
  sizeRange1,
  sizeRange2,
  Color,
  life
) {
  for (let i = 0; i < Loopcounts; i++) {
    particles.push(
      new Particle(
        x,
        y,
        (Math.random() - 0.5) * speedRange,
        (Math.random() - 0.5) * speedRange,
        Math.random() * sizeRange1 + sizeRange2,
        Color(),
        life
      )
    );
  }
}

// game over funtion
function GameOver() {
  if (gameOverTimeout) {
    clearTimeout(gameOverTimeout);
    gameOverTimeout = null;
  }

  // Stop animation
  if (animate) {
    cancelAnimationFrame(animate);
    animate = null;
  }

  clearInterval(planeSpawnInterval);
  clearInterval(planeSpawnInterval2);
  clearInterval(firingInterval);

  firing = false;
  weaponType = null;
  bullets = [];

  c.clearRect(0, 0, innerWidth, innerHeight);
  planes.forEach((plane) => plane.destroy());

  option_interface.style.display = "block";
  target_part.innerHTML = "00";
  canvas.style.display = "none";
}

// wining game funtion
let result_screen = document.querySelector(".result-screen");
function wingame() {
  GameOver();
  result_screen.style.display = "flex";
}

// losing game function
let lose_screen = document.querySelector("#lose-situation");
function loseGame() {
  GameOver();
  lose_screen.style.display = "flex";
}

let playagainBtn = document.querySelector(".playagian-btn");
playagainBtn.addEventListener("click", () => {
  result_screen.style.display = "none";
});

let playagainBtn2 = document.querySelector("#playagainBtn2");
playagainBtn2.addEventListener("click", () => {
  lose_screen.style.display = "none";
});

// function of strat game
function startgame() {
  if (animate) {
    cancelAnimationFrame(animate);
    animate = null;
  }
  planes = [];
  bullets = [];
  enemymissile = [];
  particles = [];
  explosion = [];
  score = 0;
  score_part.innerHTML = "00";

  firing = false;
  plane_distroy = false;
  cannon_distroy = false;
  clearInterval(planeSpawnInterval);
  clearInterval(planeSpawnInterval2);
  clearInterval(firingInterval);

  if (gameOverTimeout) {
    clearTimeout(gameOverTimeout);
    gameOverTimeout = null;
  }

  player.health = player.maxhealth;
  cannon.health = cannon.maxhealth;

  // Reset player and cannon
  player = new Player();
  cannon = new Cannon();

  // Reset weapon state
  firing = false;
  plane_distroy = false;
  cannon_distroy = false;

  startSpawningPlanes();
  animation();
}

// event listener for day and night
let time = "day";
timeBtn.addEventListener("click", () => {
  if (time === "day") {
    time = "night";
    timeBtn.innerHTML = `<i class="ri-moon-fill"></i>Night`;
    timeBtn.style.backgroundColor = "#2f004e";
    timeBtn.style.color = "white";
  } else if (time === "night") {
    time = "day";
    timeBtn.innerHTML = `<i class="ri-sun-fill"></i> Day`;
    timeBtn.style.backgroundColor = "#f7cc0dcf";
    timeBtn.style.color = "black";
  }
});

// funciton of canvas background
function BGgradiant() {
  let gradiant = c.createLinearGradient(0, 0, 0, canvas.height);

  if (time === "day") {
    gradiant.addColorStop(0, "#0032c8");
    gradiant.addColorStop(1, "#c6ffd2");
  } else if (time === "night") {
    gradiant.addColorStop(0, "#000000");
    gradiant.addColorStop(1, "#0f032bff");
  }

  c.fillStyle = gradiant;
  c.fillRect(0, 0, canvas.width, canvas.height);
}
// ======================================

//===== animation function====
let animate = null;
function animation() {
  animate = requestAnimationFrame(animation);
  BGgradiant();

  if (!target_part.innerHTML) {
    easyBtn.textContent = "fill";
  } else {
    if (weaponType === "gun") {
      player.draw();
    } else if (weaponType === "artillery") {
      cannon.draw();
    }
  }
  // calling each planes
  for (let p = planes.length - 1; p >= 0; p--) {
    let plane = planes[p];
    plane.update();
    plane.shoot();

    // Check collision of plane with bullets
    for (let b = bullets.length - 1; b >= 0; b--) {
      let bullet = bullets[b];
      if (
        bullet.x > plane.x &&
        bullet.x < plane.x + plane.width &&
        bullet.y > plane.y &&
        bullet.y < plane.y + plane.height
      ) {
        // rendering particles funtion when bullet hit plane
        updateParticles(
          plane.x + plane.width / 2,
          plane.y + plane.height / 2,
          5,
          4.5,
          3,
          2,
          () => `hsl(0, 0%, ${Math.random() * 50 + 50}%)`,
          20
        );
        bullets.splice(b, 1); // remove bullet
        if (weaponType === "gun") plane.health--;
        else if (weaponType === "artillery") plane.health -= 20;

        let hittingsound = document.createElement("audio");
        hittingsound.src = "hitting sound1.mp3";
        hittingsound.play();

        // removing plane after distroy
        if (plane.health <= 0) {
          explosionSound();
          plane.destroy();
          planes.splice(p, 1); // remove plane
          score++;
          score_part.innerHTML = score;

          let blastimage = new Image();
          blastimage.src = "blastplane.png";

          // redering particles function when plane distroy
          updateParticles(
            plane.x + plane.width / 2,
            plane.y + plane.height / 2,
            40,
            4.5,
            9,
            3,
            () =>
              `hsl(${Math.random() * 60}, 100%, ${Math.random() * 20 + 40}%)`,
            40
          );

          // struct for plane blast image
          explosion.push({
            image: blastimage,
            x: plane.x,
            y: plane.y,
            width: plane.width,
            height: plane.height,
            life: 20,
          });

          // when gun achieve target you won
          if (score >= target_part.innerHTML) {
            setTimeout(() => {
              wingame();
            }, 1000);
          }
        }
      }
    }

    // Remove plane if off-screen
    if (plane.x + plane.width < 0 || plane.x > canvas.width) {
      // console.log(planes)
      plane.destroy();
      planes.splice(p, 1);
    }
  }

  // calling each enemy missilbe
  for (let es = enemymissile.length - 1; es >= 0; es--) {
    let eBullets = enemymissile[es];
    eBullets.update();

    // collision detetion btw enemy missile and player
    if (player.width && player.height) {
      // for gun
      if (
        weaponType === "gun" &&
        eBullets.x > player.x &&
        eBullets.x < player.x + player.width &&
        eBullets.y > player.y &&
        eBullets.y < player.y + player.height
      ) {
        // particles function of player when bullet hit gun
        updateParticles(
          player.x + player.width / 2,
          player.y + player.height / 2,
          10,
          4.5,
          6,
          3,
          () => `hsl(${Math.random() * 60}, 100%, ${Math.random() * 20 + 40}%)`,
          30
        );
        HittngPlayerSound();
        player.health--;
        enemymissile.splice(es, 1);

        // for cannon
      } else if (
        weaponType === "artillery" &&
        eBullets.x > cannon.x &&
        eBullets.x < cannon.x + cannon.width &&
        eBullets.y > cannon.y &&
        eBullets.y < cannon.y + cannon.height
      ) {
        // particals function when enemy bullets hit cannnon
        updateParticles(
          cannon.x + cannon.width / 2,
          cannon.y + cannon.height / 2,
          10,
          4.5,
          6,
          3,
          () => `hsl(${Math.random() * 60}, 100%, ${Math.random() * 20 + 40}%)`,
          30
        );
        HittngPlayerSound();
        cannon.health--;
        enemymissile.splice(es, 1);
      }

      // particles after distroy of gun
      if (player.health <= 0 && !plane_distroy) {
        plane_distroy = true;
        // rendering particles when player is distroy
        updateParticles(
          player.x + player.width / 2,
          player.y + player.height / 2 + 2,
          50,
          7.5,
          10,
          5,
          () => `hsl(${Math.random() * 60}, 100%, ${Math.random() * 20 + 40}%)`,
          50
        );
        explosionSound();

        // calling game over funtion after 1s
        gameOverTimeout = setInterval(() => {
          loseGame();
        }, 1000);

        // particles after distroy of cannon
      } else if (cannon.health <= 0 && !cannon_distroy) {
        cannon_distroy = true;
        updateParticles(
          cannon.x + cannon.width / 2,
          cannon.y + cannon.height / 2 + 2,
          50,
          7.5,
          10,
          5,
          () => `hsl(${Math.random() * 60}, 100%, ${Math.random() * 20 + 40}%)`,
          50
        );
        explosionSound();

        // calling game over funtion after 1s
        gameOverTimeout = setTimeout(() => {
          loseGame();
        }, 1000);
      }
    }

    // when enemy fire collide with cannon fire
    bullets.forEach((bullet, i) => {
      let dx = bullet.x - eBullets.x;
      let dy = bullet.y - eBullets.y;

      let distance = Math.sqrt(dx * dx + dy * dy);
      if (
        weaponType === "artillery" &&
        distance < bullet.radius + eBullets.radius
      ) {
        updateParticles(
          eBullets.x,
          eBullets.y,
          50,
          5.5,
          4,
          2,
          () => `hsl(${Math.random() * 60}, 100%, ${Math.random() * 20 + 40}%)`,
          30
        );

        let bulletscolliding_Sound = document.createElement("audio");
        bulletscolliding_Sound.src = "bullets colliding.mp3";
        bulletscolliding_Sound.play();
        enemymissile.splice(i, 1);
      }
    });

    // removing enemy bulletts off screen
    if (
      eBullets.x < 0 ||
      eBullets.x > canvas.width ||
      eBullets.y < 0 ||
      eBullets.y > canvas.height
    ) {
      enemymissile.splice(es, 1);
    }
  }
  // removing bullet when outof screen
  bullets.forEach((bullet, index) => {
    bullet.update();
    // console.log(bullets);
    if (
      bullet.x < 0 ||
      bullet.x > canvas.width ||
      bullet.y < 0 ||
      bullet.y > canvas.height
    ) {
      bullets.splice(index, 1);
    }
  });

  // removingparticles that when bullet hit plane
  particles.forEach((particle, i) => {
    particle.update();
    if (particle.life <= 0 || particle.size <= 0.2) {
      particles.splice(i, 1);
    }
    // console.log(particles);
  });

  // making plane blast pic
  explosion.forEach((blast, i) => {
    if (blast.life > 0) {
      c.drawImage(blast.image, blast.x, blast.y, blast.width, blast.height);
      blast.life--;
    } else {
      explosion.splice(i, 1);
    }
  });
}

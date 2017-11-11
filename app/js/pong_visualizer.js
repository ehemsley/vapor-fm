/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let PongVisualizer;
const Visualizer = require('js/visualizer');

module.exports = (PongVisualizer = class PongVisualizer extends Visualizer {
  constructor(audioInitializer) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super(); }
      let thisFn = (() => { this; }).toString();
      let thisName = thisFn.slice(thisFn.indexOf('{') + 1, thisFn.indexOf(';')).trim();
      eval(`${thisName} = this;`);
    }
    this.Activate = this.Activate.bind(this);
    this.InitializeHud = this.InitializeHud.bind(this);
    this.UpdateScoreDisplay = this.UpdateScoreDisplay.bind(this);
    this.UpdateWinDisplay = this.UpdateWinDisplay.bind(this);
    this.Update = this.Update.bind(this);
    this.CheckBallCollision = this.CheckBallCollision.bind(this);
    this.HandleKeyDownInput = this.HandleKeyDownInput.bind(this);
    this.HandleKeyUpInput = this.HandleKeyUpInput.bind(this);
    this.PaddleUpInputPressed = this.PaddleUpInputPressed.bind(this);
    this.PaddleDownInputPressed = this.PaddleDownInputPressed.bind(this);
    this.PaddleUpInputReleased = this.PaddleUpInputReleased.bind(this);
    this.PaddleDownInputReleased = this.PaddleDownInputReleased.bind(this);
    this.ResetInputs = this.ResetInputs.bind(this);
    this.ResetBall = this.ResetBall.bind(this);
    this.ResetPaddles = this.ResetPaddles.bind(this);
    this.ResetGame = this.ResetGame.bind(this);
    this.InitResetTimer = this.InitResetTimer.bind(this);
    this.CheckWin = this.CheckWin.bind(this);
    this.PlayerWin = this.PlayerWin.bind(this);
    this.PlayerLose = this.PlayerLose.bind(this);
    super(audioInitializer,
          { strength: 3, kernelSize: 12, sigma: 1.1, resolution: 512 },
          0.15,
          2.0,
          false);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    this.playerPaddle = this.Paddle();
    this.enemyPaddle = this.Paddle();
    this.rightBound = this.HorizontalBound();
    this.leftBound = this.HorizontalBound();
    this.topBound = this.VerticalBound();
    this.bottomBound = this.VerticalBound();

    this.ball = this.Ball();
    this.ball.position.set(0, 0, 0);
    this.ResetBall();
    this.ballCollisionRaycaster = new THREE.Raycaster();

    this.scene.add(this.playerPaddle);
    this.scene.add(this.enemyPaddle);
    this.scene.add(this.ball);
    this.scene.add(this.rightBound);
    this.scene.add(this.leftBound);
    this.scene.add(this.topBound);
    this.scene.add(this.bottomBound);

    this.midlines = this.Midlines(0, -40, 40, 2, 2);
    for (let line of Array.from(this.midlines)) {
      this.scene.add(line);
    }

    this.playerScore = 0;
    this.enemyScore = 0;

    this.InitializeHud();
    this.UpdateScoreDisplay();

    this.ResetPaddles();

    this.rightBound.position.set(22, 0, 0);
    this.leftBound.position.set(-22, 0, 0);
    this.topBound.position.set(0, 15, 0);
    this.bottomBound.position.set(0, -15, 0);

    this.paddleSpeed = 18;

    this.ResetInputs();

    this.camera.position.z = 20;

    this.gameOver = false;
    this.resetTimer = 0;

  }

  Activate() {
    return this.ResetGame();
  }

  Paddle() {
    const geometry = new THREE.BoxGeometry(1, 6, 1);
    const material = new THREE.MeshBasicMaterial({color: 0xffffff});
    const paddle = new THREE.Mesh(geometry, material);
    return paddle;
  }

  Ball() {
    const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const material = new THREE.MeshBasicMaterial({color: 0xffffff});
    const ball = new THREE.Mesh(geometry, material);
    return ball;
  }

  Midlines(x, bottom_y, top_y, size, space) {
    const lines = [];
    for (let y = bottom_y, end = top_y, step = size+space, asc = step > 0; asc ? y <= end : y >= end; y += step) {
      const lineMaterial = new THREE.LineBasicMaterial({color: 0xffffff});
      const geometry = new THREE.Geometry();
      geometry.vertices.push(new THREE.Vector3(x, y));
      geometry.vertices.push(new THREE.Vector3(x, y+size));
      const line = new THREE.Line(geometry, lineMaterial);
      lines.push(line);
    }
    return lines;
  }

  HorizontalBound() {
    const geometry = new THREE.BoxGeometry(1, 30, 2);
    const material = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, side: THREE.DoubleSide});
    const horBound = new THREE.Mesh(geometry, material);
    return horBound;
  }

  VerticalBound() {
    const geometry = new THREE.BoxGeometry(45, 1, 2);
    const material = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, side: THREE.DoubleSide});
    const verBound = new THREE.Mesh(geometry, material);
    return verBound;
  }

  InitializeHud() {
    this.canvas1 = document.createElement('canvas');
    this.canvas1.width = 120;
    this.canvas1.height = 60;
    this.context1 = this.canvas1.getContext('2d');
    this.context1.font = "30px TelegramaRaw";
    this.context1.textAlign = "left";
    this.context1.textBaseline = "top";
    this.context1.fillStyle = "rgba(255,255,255,0.95)";
    this.context1.strokeStyle = 'white';
    this.context1.lineWidth = 2;

    this.context1.fillText('press i for info...', 0, 0);
    // @context1.fillRect(0, 0, @canvas1.width, @canvas1.height)

    this.texture1 = new THREE.Texture(this.canvas1);
    this.texture1.minFilter = THREE.LinearFilter;
    this.texture1.magFilter = THREE.LinearFilter;
    this.texture1.needsUpdate = true;
    this.material1 = new THREE.MeshBasicMaterial({map: this.texture1, side: THREE.DoubleSide, transparent: true, opacity: 1.0});
    this.mesh1 = new THREE.Mesh(new THREE.PlaneGeometry(20, 10), this.material1);
    this.mesh1.position.set(0, 10, 0);
    this.scene.add(this.mesh1);

  }

  UpdateScoreDisplay() {
    this.context1.clearRect(0, 0, this.canvas1.width, this.canvas1.height);
    this.context1.fillStyle = 'white';
    this.context1.textAlign = "left";
    this.context1.fillText(this.playerScore, 10, 0);
    this.context1.textAlign = "right";
    this.context1.fillText(this.enemyScore, 110, 0);

    this.mesh1.material.map.needsUpdate = true;
    this.mesh1.material.needsUpdate = true;

  }

  UpdateWinDisplay(text) {
    this.context1.clearRect(0, 0, this.canvas1.width, this.canvas1.height);
    this.context1.fillStyle = 'white';
    this.context1.textAlign = "left";
    this.context1.fillText(text, 20, 0);

    this.mesh1.material.map.needsUpdate = true;
    this.mesh1.material.needsUpdate = true;

  }

  Update(deltaTime) {
    if (deltaTime != null) {
      if (this.gameOver) {
        if (this.resetTimer > 0) {
          this.resetTimer -= deltaTime;
        } else {
          this.ResetGame();
        }
        return;
      } else {
        this.CheckWin();
      }

      if (this.playerPaddleUp) {
        this.playerPaddle.position.y = Math.min(this.playerPaddle.position.y + (this.paddleSpeed * deltaTime), 14);
      } else if (this.playerPaddleDown) {
        this.playerPaddle.position.y = Math.max(this.playerPaddle.position.y - (this.paddleSpeed * deltaTime), -14);
      }

      if (this.ballVelocity.x > 0) {
        const enemyToBallDistance = this.ball.position.y - this.enemyPaddle.position.y;
        if (enemyToBallDistance > 0.2) {
          this.enemyPaddle.position.y = this.enemyPaddle.position.y + (this.paddleSpeed * 0.8 * deltaTime);
        } else if (enemyToBallDistance < 0.2) {
          this.enemyPaddle.position.y = this.enemyPaddle.position.y - (this.paddleSpeed * 0.8 * deltaTime);
        }
      }

      this.ball.position.x += this.ballVelocity.x * deltaTime;
      this.ball.position.y += this.ballVelocity.y * deltaTime;
      this.ball.position.z += this.ballVelocity.z * deltaTime;
    }

    this.CheckBallCollision();

  }

  CheckBallCollision() {
    this.ballCollisionRaycaster.set(this.ball.position.clone(), this.ballVelocity.clone().normalize());
    const intersects = this.ballCollisionRaycaster.intersectObjects([this.playerPaddle,
                                                           this.enemyPaddle,
                                                           this.leftBound,
                                                           this.topBound,
                                                           this.rightBound,
                                                           this.bottomBound]);
    const intersectObjects = [];
    for (let intersect of Array.from(intersects)) {
      if (intersect.distance < 1.5) {
        if (intersect.object === this.leftBound) {
          this.enemyScore += 1;
          this.UpdateScoreDisplay();
          this.ResetBall();
          return;
        } else if (intersect.object === this.rightBound) {
          this.playerScore += 1;
          this.UpdateScoreDisplay();
          this.ResetBall();
          return;
        } else if (intersect.object === this.topBound) {
          this.ballVelocity.y = -this.ballVelocity.y;
          return;
        } else if (intersect.object === this.bottomBound) {
          this.ballVelocity.y = -this.ballVelocity.y;
          return;
        } else if (intersect.object === this.playerPaddle) {
          this.ballVelocity.x = -this.ballVelocity.x;
          this.ballVelocity.y = (intersect.point.y - this.playerPaddle.position.y) * 8;
          this.ballVelocity.normalize().multiplyScalar(38.0);
          return;
        } else if (intersect.object === this.enemyPaddle) {
          this.ballVelocity.x = -this.ballVelocity.x;
          this.ballVelocity.y = (intersect.point.y - this.enemyPaddle.position.y) * 8;
          this.ballVelocity.normalize().multiplyScalar(38.0);
          return;
        }
      }
    }
  }

  HandleKeyDownInput(keyCode) {
    if (keyCode === 65) { //a key
      this.PaddleUpInputPressed();
    } else if (keyCode === 90) { //z key
      this.PaddleDownInputPressed();
    }

  }

  HandleKeyUpInput(keyCode) {
    if (keyCode === 65) { //a key
      this.PaddleUpInputReleased();
    } else if (keyCode === 90) { //z key
      this.PaddleDownInputReleased();
    }

  }

  PaddleUpInputPressed() {
    return this.playerPaddleUp = true;
  }

  PaddleDownInputPressed() {
    return this.playerPaddleDown = true;
  }

  PaddleUpInputReleased() {
    return this.playerPaddleUp = false;
  }

  PaddleDownInputReleased() {
    return this.playerPaddleDown = false;
  }

  ResetInputs() {
    this.playerPaddleDown = false;
    this.playerPaddleUp = false;

    this.enemyPaddleDown = false;
    return this.enemyPaddleUp = false;
  }

  ResetBall() {
    this.ball.position.set(0,0,0);

    const ballDirection = new THREE.Vector3((Math.random() < 0.5 ? -1 : 1), (Math.random() * 0.8) - 0.4, 0);
    this.ballVelocity = ballDirection.clone().normalize().multiplyScalar(25.0);

  }

  ResetPaddles() {
    this.playerPaddle.position.set(-20, 0, 0);
    this.enemyPaddle.position.set(20, 0, 0);

  }

  ResetGame() {
    this.playerScore = 0;
    this.enemyScore = 0;
    this.ResetBall();
    this.ResetPaddles();
    this.gameOver = false;
    this.UpdateScoreDisplay();
  }

  InitResetTimer() {
    this.resetTimer = 5;
  }

  CheckWin() {
    if (this.playerScore === 10) {
      this.PlayerWin();
    } else if (this.enemyScore === 10) {
      this.PlayerLose();
    }
  }

  PlayerWin() {
    this.UpdateWinDisplay('NICE');
    this.gameOver = true;
    this.InitResetTimer();

  }

  PlayerLose() {
    this.UpdateWinDisplay('FAIL');
    this.gameOver = true;
    this.InitResetTimer();

  }
});

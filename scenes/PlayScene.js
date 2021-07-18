class PlayScene extends Phaser.Scene {
  constructor ()
  {
      super('PlayScene');
  }

  preload () {}

  create()
  {
    if( /Android|webOS|iPhone|iPad|Mac|Macintosh|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
      this.isMobile = true;
    }

    window.addEventListener('resize', resize);
    resize();
    // constants
    // port overlap dimensions
    const PORT_AREA_Y = 1310;
    const PORT_AREA_HEIGHT = 200;
    const PORT_AREA_WIDTH  = 225;

    // initalize groups
    enemyShips        = this.physics.add.group({immovable: true});
    enemies           = this.physics.add.group({immovable: true, allowDrag: false});
    allyShips         = this.physics.add.group({immovable: true});
    allies            = this.physics.add.group({immovable: true, allowDrag: false});
    leftPorts         = this.physics.add.group({allowGravity: false});
    rightPorts        = this.physics.add.group({allowGravity: false});
    allyBuildings     = this.physics.add.staticGroup({immovable: true});
    enemyBuildings    = this.physics.add.staticGroup({immovable: true});
    playerShips       = this.physics.add.group({immovable: true});
    players           = this.physics.add.group({immovable: true});
    cannonSmoke       = this.physics.add.group({allowGravity: false});
    enemyCannonBalls  = this.physics.add.group();
    playerCannonBalls = this.physics.add.group();
    goldCoins         = this.physics.add.group({allowGravity: false});

    // add health bar
    this.healthBar = this.add.image(990, 30, 'healthBar6');
    this.healthBar.setScrollFactor(0,0);

    // initalize class level variables
    this.cursors  = this.input.keyboard.createCursorKeys();
    this.attackKey = this.input.keyboard.addKey('A');
    this.runKey = this.input.keyboard.addKey('R');
    this.buildKey = this.input.keyboard.addKey('B');
    this.shipKey = this.input.keyboard.addKey('S');
    this.printKey = this.input.keyboard.addKey('P');
    this.killKey = this.input.keyboard.addKey('K');

    var self = this;

    // build map
    const tileSpriteX = GAME_WIDTH/2;
    const tileSpriteY = GAME_HEIGHT/2;
    this.physics.world.setBounds(0, 0, GAME_HEIGHT, GAME_WIDTH);

    let sky       = this.add.tileSprite(tileSpriteX, tileSpriteY, GAME_WIDTH, GAME_HEIGHT, 'sky_color').setDepth(-200);
    let farCloud1 = this.add.tileSprite(tileSpriteX, tileSpriteY, GAME_WIDTH, 110, 'farground_cloud_1').setDepth(-190);
    let farCloud2 = this.add.tileSprite(tileSpriteX, tileSpriteY, GAME_WIDTH, 295, 'farground_cloud_2').setDepth(-180);
    this.midCloud1 = this.add.tileSprite(tileSpriteX, tileSpriteY, GAME_WIDTH, 954, 'mid_ground_cloud_1').setDepth(-170);
    this.midCloud2 = this.add.tileSprite(tileSpriteX, tileSpriteY, GAME_WIDTH, 474, 'mid_ground_cloud_2').setDepth(-160);
    this.mountain1 = this.add.tileSprite(tileSpriteX, tileSpriteY + 350, GAME_WIDTH, 330, 'farground_mountains').setDepth(-150);

    let map = this.add.tilemap('map32');
    let waterTiles = map.addTilesetImage('bright_water_tiles_288x32');
    let grassTiles = map.addTilesetImage('grass_tiles_320x192');
    let woodTiles  = map.addTilesetImage('wood_tiles');

    world = map.createStaticLayer('world', [grassTiles], 0 , 0).setDepth(-10);
    water = map.createStaticLayer('water', [waterTiles], 0 , 0).setDepth(20);
    wood  = map.createStaticLayer('wood' , [woodTiles] , 0 , 0).setDepth(10);
    world.setCollisionByProperty({collides:true});
    water.setCollisionByProperty({collides:true});
    wood.setCollisionByProperty({collides:true});

    // create port 'areas'
    var rect = this.add.rectangle(2830, PORT_AREA_Y, PORT_AREA_WIDTH, PORT_AREA_HEIGHT, 0xff0000, 1);
    rect.setVisible(false);
    leftPorts.add(rect);
    rect = this.add.rectangle(7312, PORT_AREA_Y, PORT_AREA_WIDTH, PORT_AREA_HEIGHT, 0xff0000, 1);
    rect.setVisible(false);
    leftPorts.add(rect);
    rect = this.add.rectangle(11377, PORT_AREA_Y, PORT_AREA_WIDTH, PORT_AREA_HEIGHT, 0xff0000, 1);
    rect.setVisible(false);
    leftPorts.add(rect);

    rect = this.add.rectangle(4305, PORT_AREA_Y, PORT_AREA_WIDTH, PORT_AREA_HEIGHT, 0xff0000, 1);
    rect.setVisible(false);
    rightPorts.add(rect);
    rect = this.add.rectangle(8978, PORT_AREA_Y, PORT_AREA_WIDTH, PORT_AREA_HEIGHT, 0xff0000, 1);
    rect.setVisible(false);
    rightPorts.add(rect);
    rect = this.add.rectangle(12879, PORT_AREA_Y, PORT_AREA_WIDTH, PORT_AREA_HEIGHT, 0xff0000, 1);
    rect.setVisible(false);
    rightPorts.add(rect);

    // add group colliders
    self.physics.add.overlap(leftPorts, enemies, (port, enemy) => {
      if(player.isHost && enemy.direction === 'Left')
        self.processPortSkeletonCollision(self, port, enemy, 'enemies');
    });
    self.physics.add.overlap(rightPorts, enemies, (port, enemy) => {
      if(player.isHost && enemy.direction === 'Right')
        self.processPortSkeletonCollision(self, port, enemy, 'enemies');
    })
    self.physics.add.overlap(leftPorts, allies, (port, enemy) => {
      if(player.isHost && enemy.direction === 'Left')
        self.processPortSkeletonCollision(self, port, enemy, 'allies');
    });
    self.physics.add.overlap(rightPorts, allies, (port, enemy) => {
      if(player.isHost && enemy.direction === 'Right')
        self.processPortSkeletonCollision(self, port, enemy, 'allies');
    })
    self.physics.add.overlap(playerCannonBalls, enemyShips, function(ball, ship){
      ball.destroy();
      ship.health -= ball.damage;

      if(ship.health <= 0){
        ship.waterCollider.active = false;
        ship.setVelocityY(10);
      }
    });
    self.physics.add.collider(enemyShips, world, function(ship){
      if(player.isHost){
        self.socket.emit('removeShip', ship);
      }
    });
    self.physics.add.collider(allyShips, world, function(ship){
      if(player.isHost){
        self.socket.emit('removeShip', ship);
      }
    });
    this.physics.add.collider(enemyCannonBalls, players, function(ball, player){
      ball.destroy();
    });
    this.physics.add.collider(enemyCannonBalls, world, function(ball, layer){
      ball.destroy();
    });
    this.physics.add.collider(enemyCannonBalls, wood, function(ball, layer){
      ball.destroy();
    });
    this.physics.add.collider(enemyCannonBalls, water, function(ball, layer){
      ball.destroy();
    });
    this.physics.add.collider(water, enemies);
    this.physics.add.collider(world, enemies);
    this.physics.add.collider(wood, enemies);
    this.physics.add.collider(water, allies);
    this.physics.add.collider(world, allies);
    this.physics.add.collider(wood, allies);
    this.physics.add.collider(enemyBuildings, allies, function(building, enemy){
      if(player.isHost)
        self.processEnemyBuildingCollision(self, building, enemy);
    }, null, this);
    this.physics.add.collider(allyBuildings, enemies, function(building, enemy){
      if(player.isHost)
        self.processEnemyBuildingCollision(self, building, enemy);
    }, null, this);
    self.physics.add.collider(allyBuildings, world);
    self.physics.add.collider(enemyBuildings, world);
    this.physics.add.collider(water, playerShips, function(ship){});
    this.physics.add.collider(wood, playerShips, function(ship){
      ship.play(ship.character+'SlowRock'+ship.direction, true);
    });
    this.physics.add.collider(wood,  enemyShips, function(ship, layer){
      self.processShipPortCollision(self, ship, layer);
    });
    this.physics.add.collider(wood,  allyShips, function(ship, layer){
      self.processShipPortCollision(self, ship, layer);
    });

    // setup socket
    const searchParams = new URLSearchParams(location.search);
    const roomName = searchParams.get("roomName");
    const queryStr = roomName && roomName.trim() != '' ? 'room=' + roomName : '';
    //const queryStr = 'room=dinningHall&character=Knight1';
    this.socket = io(window.location.origin,{autoConnect: false, transports: ['websocket', 'polling'], query: queryStr});

    this.socket.on('fullRoom', function(response){
      alert('Room was Full.');
    })

    this.socket.on('currentState', function (stateInfo) {
      console.log(self.socket.id+'currentState');
      var players         = stateInfo.players ?? {};
      var allies          = (player.isHost ? stateInfo.player1Skels : stateInfo.player2Skels) ?? {};
      var enemies         = (player.isHost ? stateInfo.player2Skels : stateInfo.player1Skels) ?? {};
      var enemyShips      = (player.isHost ? stateInfo.player2Ships : stateInfo.player1Ships) ?? {};
      var allyShips       = (player.isHost ? stateInfo.player2Ships : stateInfo.player1Ships) ?? {};
      var allyBuildings       = (player.isHost ? stateInfo.player1Buildings : stateInfo.player2Buildings) ?? {};
      var enemyBuildings  = (player.isHost ? stateInfo.player2Buildings : stateInfo.player1Buildings) ?? {};
      var playerShips     = stateInfo.playerShips ?? {};
      Object.keys(players).forEach(function (id) {
        if (players[id].playerId === self.socket.id) {
          self.addPlayer(self, players[id]);
        } else {
          self.addOtherPlayer(self, players[id]);
        }
      });
      Object.entries(enemyShips).forEach((item, i) => {
        if(item[1])
          self.addEnemyShip(self, item[1]);
      });
      Object.entries(allyShips).forEach((item, i) => {
        if(item[1])
          self.addAllyShip(self, item[1]);
      });
      Object.entries(playerShips).forEach((item, i) => {
        if(item[1])
          self.addOtherPlayerShip(self, item[1]);
      });
      Object.entries(enemies).forEach((item, i) => {
        if(item[1])
          self.addEnemy(self, item[1]);
      });
      Object.entries(allies).forEach((item, i) => {
        if(item[1])
          self.addAlly(self, item[1]);
      });
      Object.entries(allyBuildings).forEach((item, i) => {
        if(item[1])
          self.addAllyBuilding(self, item[1]);
      });
      Object.entries(enemyBuildings).forEach((item, i) => {
        if(item[1])
          self.addEnemyBuilding(self, item[1]);
      });
    });

    this.socket.on('becomeHost', function(info){
      player.isHost = true;
      player.character = info.character;
    });

    this.socket.on('updatePlayerMovement', function (info) {
      players.getChildren().forEach(function (child) {
        if (info.playerId === child.playerId) {
          child.setPosition(info.x, info.y);
          child.action    = info.action;
          child.direction = info.direction;
          child.isAShip   = info.isAShip;
          child.play(child.character+child.action+child.direction, true);

          if(child.isAShip) {
            child.setActive(false).setVisible(false);
            child.body.enable = false;
          } else if (!child.body.enable){
            child.setActive(true).setVisible(true);
            child.body.enable = true;
          }
        }
      });
    });

    this.socket.on('updatePlayerShipMovement', function (info) {
      playerShips.getChildren().forEach(function (child) {
        if (info.shipId === child.shipId) {
          child.setPosition(info.x, info.y);
          child.action    = info.action;
          child.direction = info.direction;
          child.play(child.character+child.action+child.direction, true);
        }
      });
    });

    this.socket.on('createPlayerShip', function(shipInfo) {
      if(player.playerId === shipInfo.shipId) {
        self.addPlayerShip(self, shipInfo);
      } else {
        self.addOtherPlayerShip(self, shipInfo);
      }
    });

    this.socket.on('createShip', function (shipInfo) {
      if(shipInfo.ownerId === self.socket.id){
        self.addAllyShip(self, shipInfo);
      } else {
        self.addEnemyShip(self, shipInfo);
      }
    });

    this.socket.on('createSkeletons', function (info) {
        Object.entries(info).forEach(function(entry, index, arr){
          self.time.addEvent({
              delay: 350*(index+1),
              callback: ()=>{
                if(entry[1].ownerId === self.socket.id){
                  self.addAlly(self, entry[1]);
                } else {
                  self.addEnemy(self, entry[1]);
                }
              },
          },self);
        });
    });

    this.socket.on('createBuilding', function (info) {
        if(info.playerId === self.socket.id){
          self.addAllyBuilding(self, info.building, info.playerId);
        } else {
          self.addEnemyBuilding(self, info.building, info.playerId);
        }
    });

    this.socket.on('removeBuilding', function (info) {
        self.removeBuilding(self, info);
    });

    this.socket.on('removeSkeleton', function (skelInfo) {
        self.removeSkeleton(self, skelInfo);
    });

    this.socket.on('killEnemy', function (skelInfo) {
        self.killEnemy(self, skelInfo);
    });

    this.socket.on('removeShip', function (shipInfo) {
      const shipGroup = shipInfo.ownerId === self.socket.id ? allyShips : enemyShips;
        shipGroup.getChildren().forEach((child, i) => {
          if(child.shipId === shipInfo.shipId){
            if(child.cannonEvent){
              child.cannonEvent.destroy();
            }
            child.destroy();
          }
        });
    });

    this.socket.on('removePlayerShip', function (shipId) {
        playerShips.getChildren().forEach((child, i) => {
          if(shipId === child.shipId){
            child.destroy();
          }
        });
    });

    this.socket.on('skelMovementUpdate', function (batchMovements) {
      Object.entries(batchMovements).forEach((item, i) => {
        let type  = item[0];
        let batch = item[1];
        switch (type) {
          case 'player1Skels':
              self.updateEnemyMovements(self, player.isHost ? allies.getChildren() : enemies.getChildren(), batch);
            break;
          case 'player2Skels':
              self.updateEnemyMovements(self, player.isHost ? enemies.getChildren() : allies.getChildren(), batch);
            break;
          case 'player1Ships':
            self.updateEnemyShipMovements(self, player.isHost ? allyShips.getChildren() : enemyShips.getChildren(), batch);
            break;
          case 'player2Ships':
            self.updateEnemyShipMovements(self, player.isHost ? enemyShips.getChildren() : allyShips.getChildren(), batch);
            break;
          default: console.log('Unidentified Batch Movement Key');
        }
      });
    });

    this.socket.on('fireCannonBall', function(shipId){
      if(playerShip && playerShip.shipId === shipId){
        self.firePlayerCannon(self, playerShip);
      } else {
        playerShips.getChildren().forEach((ship, i) => {
          if(ship.shipId === shipId)
            self.firePlayerCannon(self, ship);
        });
      }
    });

    this.socket.on('newPlayer', function (playerInfo) {
        self.addOtherPlayer(self, playerInfo);
    });

    this.socket.on('removePlayer', function(playerId){
      players.getChildren().forEach((item, i) => {
        if(item.playerId == playerId)
          item.destroy();
      });
      playerShips.getChildren().forEach((item, i) => {
        if(item.shipId == playerId)
          item.destroy();
      });
    });

    // disconnect if player changes tabs
    this.game.events.on('hidden', function(){
        this.socket.disconnect();
        self.socket.disconnect();
        window.location.replace("https://reddit.com/r/psvr");
        console.log('game was hidden.');
    }.bind(this));

    this.socket.open();
  }

  firePlayerCannon(self, ship) {
    let x;
    var xMultiplier = ship.direction === 'Left' ? -1 : 1;
    // toggle cannons
    if(ship.cannon === 2){
      x = ship.x + (40*xMultiplier)
      ship.cannon = 1;
    } else {
      x = ship.x
      ship.cannon = 2;
    }
    // create smoke and cannon ball
    let smoke = cannonSmoke.create(x, ship.y+138, 'CannonSmoke').play('CannonSmoke').on('animationcomplete', function(animation, frame) {
      smoke.destroy();
    }, this);
    smoke.setDepth(11);
    smoke.setVelocityX(ship.body.velocity.x);

    let cannonBall = playerCannonBalls.create(x, ship.y+138, 'ball');
    cannonBall.setVelocity((350+Math.abs(ship.body.velocity.x))*xMultiplier, -120);
    cannonBall.damage = ship.damage;
    cannonBall.setDepth(12);
    // unlock cannon requests
    self.time.addEvent({
        delay: CANNON_DELAY,
        callback: ()=>{
          ship.attackLocked = false;
        },
    },self);
  }

  updateEnemyMovements(self, children, updates) {
    children.forEach((child, i) => {
      if(updates[child.skelId]){
        let info = updates[child.skelId];
        console.log('action: ' + info.action + ' direction: ' + info.direction + ' velocity: ' + info.velocity + ' character: ' + child.character);
        child.setVelocityX(info.velocity);
        child.action = info.action;
        child.direction = info.direction;
        child.play(child.character+child.action+child.direction, true);
      }
    });
  }

  updateEnemyShipMovements(self, children, updates) {
    children.forEach((child, i) => {
      if(updates[child.shipId]){
        let info = updates[child.shipId];
        console.log('action: ' + info.action + ' direction: ' + info.direction + ' velocity: ' + info.velocity + ' character: ' + child.character);
        child.setVelocityX(info.velocity);
        child.action = info.action;
        child.direction = info.direction;
        child.fire = info.fire
        child.play(child.character+child.action+child.direction, true);

        if(child.cannonEvent)
          child.cannonEvent.destroy();

        if(info.fire){
          self.fireEnemyCannon(self, child);
        }
      }
    });
  }

  fireAllyCannon(self, child){
    this.fireCannon1(self, child, playerCannonBalls);
  }

  fireEnemyCannon(self, child){
    this.fireCannon1(self, child, enemyCannonBalls);
  }

  fireCannon1(self, child, group) {
    child.cannonEvent = self.time.addEvent({
        delay: 2000,
        callback: ()=>{
          if(child.body) {
            var xMultiplier = child.direction === 'Left' ? -1 : 1;
            let smoke = cannonSmoke.create(child.x, child.y+138, 'CannonSmoke').play('CannonSmoke').on('animationcomplete', function(animation, frame) {
              smoke.destroy();
              if(child && child.body)
                self.fireCannon2(self, child.x+(40*xMultiplier), child.y+138, child.body.velocity.x, child.direction, child.damage, group);
            }, this);
            smoke.setVelocityX(child.body.velocity.x);
            smoke.setDepth(1);

            let cannonBall = enemyCannonBalls.create(child.x, child.y+138, 'ball');
            cannonBall.setVelocity((350+Math.abs(child.body.velocity.x))*xMultiplier, -120);
            cannonBall.damage = child.damage;
          }
        },
        loop: true
    },self);
  }

  fireCannon2(self, x, y, velocity, direction, damage, group) {
    var xMultiplier = direction === 'Left' ? -1 : 1;
    let smoke = cannonSmoke.create(x,y, 'CannonSmoke').play('CannonSmoke').on('animationcomplete', function(animation, frame) {
      smoke.destroy();
    }, this);
    smoke.setDepth(1);
    smoke.setVelocityX(velocity);

    let cannonBall = group.create(x, y, 'ball');
    cannonBall.setVelocity(350*xMultiplier, -110);
    cannonBall.damage = damage;
  }

  addPlayer(self, playerInfo) {
    player = self.physics.add.sprite(playerInfo.x, playerInfo.y, playerInfo.character).play(playerInfo.character+playerInfo.action+playerInfo.direction, true);
    player.setMass(50);
    player.isHost    = playerInfo.isHost;
    player.action    = playerInfo.action;
    player.playerId  = playerInfo.playerId;
    player.money     = playerInfo.money;
    player.health    = playerInfo.health;
    player.totalHealth = playerInfo.totalHealth
    player.strength  = playerInfo.strength;
    player.character = playerInfo.character;
    player.direction = playerInfo.direction;
    player.damage    = playerInfo.damage;
    player.lockBuildAction = false;

    //add money text
    moneyText = this.add.text(1040, 60, '$' + player.money, { strokeThickness: 10, fontSize: '20px', fill: '#000' });
    moneyText.setScrollFactor(0,0);
    //add buttons
    this.addBuildBtn();

    self.cameras.main.startFollow(player);
    self.physics.add.collider(player, world);
    self.physics.add.collider(player, water, function(player, water){
      player.health = 0;
      self.updateHealth();
    });
    self.physics.add.collider(player, wood);
    self.physics.add.collider(enemyCannonBalls, player, function(person, ball){
      ball.destroy();
      player.health -= ball.damage;
      console.log('player health: '+ person.health);
      player.once('animationcomplete', function(animation, frame) {
        player.play(player.character+'Idle'+player.direction, true);
      });
      person.play(player.character+'Hurt'+player.direction, true);
      self.updateHealth();
    });
    self.physics.add.overlap(player, enemies, function(player, enemy) {
      self.processEnemyPlayerCollision(self, player, enemy);
    }, null, self);
    self.physics.add.overlap(leftPorts, player, function() {
      if(self.shipKey.isDown && !player.isAShip && !playerShip && !player.lockShipBuildAction){
        self.requestPlayerShip(self, 'Left');
      }
    }, null, self);
    self.physics.add.overlap(rightPorts, player, function() {
      if(self.shipKey.isDown && !player.isAShip && !playerShip && !player.lockShipBuildAction){
        self.requestPlayerShip(self, 'Right');
      }
    }, null, self);
    self.physics.add.overlap(player, goldCoins, function(player, coin) {
      self.processPlayerGoldCoinCollision(self, player, coin);
    }, null, self);
  }

  addBuildBtn(){
    const buildBtn = this.add.image((this.isMobile ? 90 : 30), (this.isMobile ? 90 : 30), (this.isMobile ? 'mobileBuildBtn' : 'buildBtn'));
    buildBtn.setInteractive();
    buildBtn.setScrollFactor(0,0);

    buildBtn.on('pointerover', () => {
        buildBtn.setScale(.85);
    });

    buildBtn.on('pointerout',function(pointer){
      buildBtn.setScale(1);
    })

    buildBtn.on('pointerdown', function(){
      const portDirection = this.currentPlayerPort();
      if(portDirection && !this.isbuildMenuOpen){
        this.openBuildMenu(portDirection);
      } else if(this.buildMenu){
        this.closeBuildMenu();
      }
    },this);
  }

  currentPlayerPort(){
    try{
      leftPorts.getChildren().forEach(function (child) {
        const intersection = Phaser.Geom.Rectangle.Intersection(player.getBounds(), child.getBounds());
        if (intersection.height > 0 || intersection.width > 0){
          throw {direction:'Left'};
        }
      });

      rightPorts.getChildren().forEach(function (child) {
        const intersection = Phaser.Geom.Rectangle.Intersection(player.getBounds(), child.getBounds());
        if (intersection.height > 0 || intersection.width > 0){
          throw {direction:'Right'};
        }
      });
    }catch(e){
      if(e.direction){
        return e.direction;
      }
    }

    return undefined;
  }

  closeBuildMenu(){
    this.isbuildMenuOpen = false;
    for (const prop in this.buildMenu) {
      if(this.buildMenu[prop]){
        this.buildMenu[prop].destroy();
        this.buildMenu[prop] = null;
      }
    }
  }

  openBuildMenu(direction){
    this.isbuildMenuOpen = true;
    this.buildMenu = {};
    let buildNum = 0;

    const fontSize = this.isMobile ? '50px' : '20px';
    let buildNumTxt = this.add.text(600, this.isMobile ? 300 : 360, buildNum, { strokeThickness: 10, fontSize: fontSize, fill: '#000' });
    buildNumTxt.setScrollFactor(0,0);
    buildNumTxt.depth = 17000;
    this.buildMenu.buildNumTxt = buildNumTxt;

    const panel = this.add.image(600, 400, 'panel');
    panel.setScrollFactor(0,0);
    panel.depth = 16000;
    this.buildMenu.panel = panel;

    const upBtn = this.add.image(this.isMobile ? 740 : 690, this.isMobile ? 230 : 350, 'upBtn');
    upBtn.setInteractive();
    upBtn.setScrollFactor(0,0);
    upBtn.depth = 17000;
    upBtn.on('pointerdown', function(){
      if(buildNum < 5){
        buildNumTxt.setText(++buildNum);
      }
    },this);
    this.buildMenu.upBtn = upBtn;

    const downBtn = this.add.image(this.isMobile ? 740 : 690, 410, 'downBtn');
    downBtn.setInteractive();
    downBtn.setScrollFactor(0,0);
    downBtn.depth = 17000;
    downBtn.on('pointerdown', function(){
      if(buildNum > 0){
        buildNumTxt.setText(--buildNum);
      }
    },this);
    this.buildMenu.downBtn = downBtn;

    const submitBtn = this.add.image(this.isMobile ? 740 : 690, this.isMobile ? 600 : 480, 'submitBtn');
    submitBtn.setInteractive();
    submitBtn.setScrollFactor(0,0);
    submitBtn.depth = 17000;
    submitBtn.on('pointerdown', function(){
      this.socket.emit('sendShip', {
        x: player.x,
        enemyNum: buildNum,
        direction: direction,
        damage    : player.damage
       });
    },this);
    this.buildMenu.submitBtn = submitBtn;

    if(!this.isMobile){
      panel.displayWidth = 400;
      panel.scaleY = panel.scaleX;
      upBtn.displayWidth = 56;
      upBtn.scaleY = upBtn.scaleX;
      downBtn.displayWidth = 56;
      downBtn.scaleY = downBtn.scaleX;
      submitBtn.displayWidth = 56;
      submitBtn.scaleY = submitBtn.scaleX;
    }

  }

  requestPlayerShip(self, direction) {
    player.lockShipBuildAction = true;
    self.socket.emit('createPlayerShip', {
      x: player.x,
      direction: direction,
      health: 2000,
      totalHealth: 2000,
      damage: player.damage*2
    });
  }

  addOtherPlayer(self, playerInfo) {
    let otherPlayer = players.create(playerInfo.x, playerInfo.y, playerInfo.character).play(playerInfo.character+playerInfo.action+playerInfo.direction, true);
    for (let prop in playerInfo) {
      otherPlayer[prop] = playerInfo[prop];
    }

    otherPlayer.setMass(50);
    self.physics.add.collider(otherPlayer, world);
    self.physics.add.collider(otherPlayer, water);
    self.physics.add.collider(otherPlayer, wood);
    self.physics.add.overlap(otherPlayer, goldCoins, function(player, coin) {
      if(!coin.pickedUp){
        this.time.addEvent({
            delay: 500,
            callback: ()=>{
              coin.destroy();
            },
        },this);
      }
      coin.pickedUp = true;
    }, null, self);
    if(otherPlayer.isAShip) {
      otherPlayer.setActive(false).setVisible(false);
      otherPlayer.body.enable = false;
    }
  }

  addEnemy(self, info) {
    var enemy = enemies.create(info.x, info.y, info.character).play(info.character+info.action+info.direction, true);
    for (let prop in info) {
      enemy[prop] = info[prop];
    }

    const xMultiplier = info.direction === 'Left' ? -1 : 1;
    enemy.setVelocityX(info.speed*xMultiplier);
    enemy.setBounceX(0);
    enemy.setMass(45);
  }

  addAlly(self, info) {
    var ally = allies.create(info.x, info.y, info.character).play(info.character+info.action+info.direction, true);
    for (let prop in info) {
      ally[prop] = info[prop];
    }

    const xMultiplier = info.direction === 'Left' ? -1 : 1;
    ally.setVelocityX(info.speed*xMultiplier);
    ally.setBounceX(0);
    ally.setMass(45);
  }

  addPlayerShip(self, shipInfo) {
    self.time.addEvent({
        delay: BUILD_DELAY,
        callback: ()=>{
          player.lockShipBuildAction = false;
        }
    });

    player.isAShip = true;
    player.body.enable = false;
    player.setActive(false).setVisible(false);
    playerShip = self.physics.add.sprite(shipInfo.x, shipInfo.y, shipInfo.character).play(shipInfo.character+shipInfo.action+shipInfo.direction, true);
    for (let prop in shipInfo) {
      playerShip[prop] = shipInfo[prop];
    }

    playerShip.setImmovable(true);
    playerShip.waterCollider = self.physics.add.collider(playerShip, water);

    self.physics.add.collider(playerShip, world, function(ship){
      self.socket.emit('removePlayerShip', playerShip.shipId);
      playerShip.destroy();
      playerShip = undefined;
    });

    self.physics.add.collider(playerShip, wood, function(ship){
      ship.play(ship.character+'SlowRock'+ship.direction, true);
    });

    self.physics.add.collider(enemyCannonBalls, playerShip, function(ship, ball){
      ball.destroy();
      ship.health -= ball.damage;
      self.updateHealth()
    });

    self.cameras.main.startFollow(playerShip);
    // playerShip.shipId     = shipInfo.shipId;
    // playerShip.health     = shipInfo.health;
    // playerShip.totalHealth = shipInfo.totalHealth;
    // playerShip.damage     = shipInfo.damage;
    // playerShip.direction  = shipInfo.direction;
    // playerShip.character  = shipInfo.character;
    playerShip.setDepth(10);
    this.updateHealth();
  }

  addOtherPlayerShip(self, shipInfo) {
    let otherPlayerShip = playerShips.create(shipInfo.x, shipInfo.y, shipInfo.character).play(shipInfo.character+shipInfo.action+shipInfo.direction, true);
    for (let prop in shipInfo) {
      otherPlayerShip[prop] = shipInfo[prop];
    }
    // otherPlayerShip.shipId     = shipInfo.shipId;
    // otherPlayerShip.health     = shipInfo.health;
    // otherPlayerShip.damage     = shipInfo.damage;
    // otherPlayerShip.direction  = shipInfo.direction;
    // otherPlayerShip.character  = shipInfo.character;
    otherPlayerShip.setImmovable(true);
    otherPlayerShip.setDepth(10);
  }

  addAllyShip(self, shipInfo) {
    var ship = allyShips.create(shipInfo.x, shipInfo.y, shipInfo.character).play(shipInfo.character+shipInfo.action+shipInfo.direction, true);
    for (let prop in shipInfo) {
      ship[prop] = shipInfo[prop];
    }

    const xMultiplier = shipInfo.direction === 'Left' ? -1 : 1;
    ship.setVelocityX(shipInfo.speed*xMultiplier);
    ship.waterCollider = this.physics.add.collider(ship, water);

    if(shipInfo.fire){
      self.fireAllyCannon(self, ship);
    }
  }

  addEnemyShip(self, shipInfo) {
    var ship = enemyShips.create(shipInfo.x, shipInfo.y, shipInfo.character).play(shipInfo.character+shipInfo.action+shipInfo.direction, true);
    for (let prop in shipInfo) {
      ship[prop] = shipInfo[prop];
    }

    const xMultiplier = shipInfo.direction === 'Left' ? -1 : 1;
    ship.setVelocityX(shipInfo.speed*xMultiplier);
    ship.waterCollider = this.physics.add.collider(ship, water);

    if(shipInfo.fire){
      self.fireEnemyCannon(self, ship);
    }
  }

  addAllyBuilding(self, info, playerId) {
    let releaseMyBuildLock = playerId === player.playerId;

    if(releaseMyBuildLock) // delay players build lock to reduce spamming
      self.time.addEvent({
          delay: BUILD_DELAY,
          callback: ()=>{
            player.lockBuildAction = false;
          },
      },self);

    if(!info){
      if(!info)
      var warning = self.add.text(player.x, player.y + 110, 'Cant Build Here', { strokeThickness: 5, fontSize: '30px', fill: '#000' }).setDepth(100);
      self.tweens.add({
        targets: warning,
        alpha: 0,
        ease: 'easeInQuint',
        duration: 500,
        repeat: 1,
        yoyo: true,
        onComplete: ()=>{
          warning.destroy();
        }
      });
      return;
    }

    player.money -= BUILDING_COST;
    moneyText.setText('$' + player.money);

    let building = allyBuildings.create(info.x, (player.isHost ? 1260 : 1225), (player.character === 'Knight1' ? 'Building' : 'EnemyBuilding'));
    for (let prop in info) {
      building[prop] = info[prop];
    }
    building.setDepth(-1);
    building.setBounce(0, 0);
    building.setMass(20000);
  }

  addEnemyBuilding(self, info, playerId) {
    let building = enemyBuildings.create(info.x, (player.isHost ? 1225 : 1260), (player.isHost ? 'EnemyBuilding' : 'Building'));
    for (let prop in info) {
      building[prop] = info[prop];
    }
    building.setDepth(-1);
    building.setBounce(0, 0);
    building.setMass(20000);
  }

  removeBuilding(self, info) {
    if(info.ownerId === self.socket.id) {
      allyBuildings.getChildren().forEach((building, i) => {
        if(building.buildingId === info.buildingId)
          building.destroy();
      });
    } else {
      enemyBuildings.getChildren().forEach((building, i) => {
        if(building.buildingId === info.buildingId)
          building.destroy();
      });
    }
  }

  killEnemy(self, skelInfo) {
    const skelGroup = (skelInfo.ownerId === self.socket.id ? allies : enemies);
    skelGroup.getChildren().forEach((skel, i) => {
      if(skel.skelId === skelInfo.skelId){
        skel.action = 'Die';
        skel.play(skel.character+skel.action+skel.direction, false).on('animationcomplete', function(animation, frame) {
          self.removeSkeleton(self, skel);
          if(skelInfo.ownerId !== self.socket.id){
            goldCoins.create(skel.x, skel.y, 'GoldCoin').play('GoldCoin');
          }
        }, this);
      }
    });
  }

  removeSkeleton(self, skelInfo) {
    const skelGroup = (skelInfo.ownerId === self.socket.id ? allies : enemies);
    const skelShipGroup = (skelInfo.ownerId === self.socket.id ? allyShips : enemyShips);

    let shipId = -1;
    skelGroup.getChildren().forEach((enemy, i) => {
      if(enemy.skelId === skelInfo.skelId){
        shipId = enemy.shipId;
        enemy.destroy();
      }
    });

    if(shipId > -1){
      let enableShip = true;
      skelGroup.getChildren().forEach((skel, i) => {
        if(skel.shipId === shipId){
          enableShip = false;
        }
      });
      if(enableShip){
        skelShipGroup.getChildren().forEach((ship, i) => {
          if(ship.shipId === shipId){
            ship.body.enable = true;
          }
        });
      }
    }
  }

  processShipPortCollision(self, ship, layer){
    if(!ship.hasHitDock && player.isHost) {
          ship.hasHitDock = true
          ship.body.enable = false;
          let info = {
            ownerId:   ship.ownerId,
            health:    ship.health,
            shipId:    ship.shipId,
            enemyNum:  ship.enemyNum,
            direction: ship.direction,
            x:         layer.pixelX
          }
          self.socket.emit('createSkeletons', info);
          ship.enemyNum = 0;
    }
    ship.play(ship.character+'SlowRock'+ship.direction, true);
  }

  processPortSkeletonCollision(self, port, enemy, group) {
    const shipGroup = (group === 'allies' ? allyShips : enemyShips);
    const skelGroup = (group === 'allies' ? allies : enemies);
    // get neccessary enemy information and destroy enemy to prevent duplicate collisions
    let skelId      = enemy.skelId;
    let ownerId     = enemy.ownerId;
    let enemyShipId = enemy.shipId;
    let direction   = enemy.direction;
    let enemyX      = enemy.x
    enemy.destroy();

    let enemiesLeft = 0;
    var ship;
    // add enemy back to ship's enemy count
    shipGroup.getChildren().forEach((child) => {
      if(enemyShipId === child.shipId){
        child.enemyNum++;
        ship = child;
      }
    });

    if(!ship){
      console.log('couldnt find a ship');
      return;
    }
    // rebuild ship at new location if enemy is last alive from its ship
    skelGroup.getChildren().forEach((child) => {
      if(enemyShipId === child.shipId)
        enemiesLeft++;
    });
    if(enemiesLeft < 1){
      let shipInfo = {
        ownerId:   ship.ownerId,
        character: ship.character,
        oldShipId: ship.shipId,
        enemyNum:  ship.enemyNum,
        health:    ship.health,
        speed:     ship.speed,
        damage:    ship.damage,
        direction: direction,
        x:         enemyX
      }
      console.log('create new enemy ship')
      self.socket.emit('rebuildShip', shipInfo);
    }
    self.socket.emit('removeSkeleton', {skelId: skelId, ownerId: ownerId});
  }

  processEnemyBuildingCollision(self, building, enemy) {
    if(enemy.lockBuildingAttacks)
      return;

    enemy.lockBuildingAttacks = true;
    this.time.addEvent({
        delay: 1000,
        callback: ()=>{
            enemy.lockBuildingAttacks = false;
            self.socket.emit('reduceBuildingHealth',{
              skelId:     enemy.skelId,
              buildingId: building.buildingId,
              damage:     enemy.damage,
              landId:     building.landId,
              ownerId:    building.ownerId
            });
        },
    },this);
  }

  processPlayerGoldCoinCollision(self, player, coin) {
    if(!coin.pickedUp){
      player.money += 10;
      this.time.addEvent({
          delay: 500,
          callback: ()=>{
            coin.destroy();
            moneyText.setText('$' + player.money);
          },
      },this);
    }
    coin.pickedUp = true;
  }

  processEnemyPlayerCollision(self, player, enemy) {
    if(!enemy.lockPlayerAttacks && enemy.action === 'Slash') {
      enemy.lockPlayerAttacks = true;
      player.health -= 50;
      this.updateHealth();

      this.time.addEvent({
          delay: 1000,
          callback: ()=>{
              enemy.lockPlayerAttacks = false;
          }
      },this);
    }

    if(!player.lockPlayerAttacks && player.action === 'Attack1' && enemy.action !== 'Die' && player.anims.currentFrame.index > 5) {
      player.lockPlayerAttacks = true;
      self.socket.emit('killEnemy', { skelId: enemy.skelId, ownerId: enemy.ownerId });
      this.time.addEvent({
          delay: 1000,
          callback: ()=>{
              player.lockPlayerAttacks = false;
          }
      },this);
    }
  }

  doPlayerUpdates(){
    // emit player movement
    player.action = player.anims.currentAnim.key.replace(player.character, '').replace(player.direction, '');

    if (player.oldPosition && (player.oldPosition.isAShip !== player.isAShip || player.action !== player.oldPosition.action
      || player.direction !== player.oldPosition.direction || player.x !== player.oldPosition.x || player.y !== player.oldPosition.y))
    {
      this.socket.emit('updatePlayerMovement', {
        playerId: player.playerId,
        x: player.x,
        y: player.y ,
        direction: player.direction,
        action: player.action,
        isAShip: player.isAShip
      });
    }

    if(playerShip) {
      playerShip.action = playerShip.anims.currentAnim.key.replace(playerShip.character, '').replace(playerShip.direction, '');

      if(player.isAShip && playerShip.oldPosition && (playerShip.action !== playerShip.oldPosition.action
        || playerShip.direction !== playerShip.oldPosition.direction
        || playerShip.x !== playerShip.oldPosition.x || playerShip.y !== playerShip.oldPosition.y))
      {
        this.socket.emit('updatePlayerShipMovement', {
          shipId: playerShip.shipId,
          x:      playerShip.x,
          y:      playerShip.y,
          action: playerShip.action,
          direction: playerShip.direction
        });
      };

      playerShip.oldPosition = {
        x:       playerShip.x,
        y:        playerShip.y,
        action:   playerShip.action,
        direction: playerShip.direction
      };
    }
    // save old position data
    player.oldPosition = {
      x:         player.x,
      y:         player.y,
      action:    player.action,
      direction: player.direction,
      isAShip:   player.isAShip
    };
  }

  doBatchUpdates() {
    var batchUpdateMap = new Map();
        batchUpdateMap.set('player1Skels', {});
        batchUpdateMap.set('player1Ships', {});
        batchUpdateMap.set('player2Skels', {});
        batchUpdateMap.set('player2Ships', {});

    let setUpdate = function(child, group, identifier) {
      if (child.oldPosition && (child.x !== child.oldPosition.x || child.y !== child.oldPosition.y || child.action !== child.oldPosition.action)){
        batchUpdateMap.get(group)[child[identifier]] =  { x: child.x, y: child.y };
      }
      // save old position data
      child.oldPosition = { x: child.x, y: child.y, action: child.action, direction: child.direction };
    }
    // let skelShipUpdateLogic = function(child, group) {
    //   if (child.oldPosition && (child.x !== child.oldPosition.x || child.y !== child.oldPosition.y || child.action !== child.oldPosition.action)){
    //     batchUpdateMap.get(group)[child.shipId] = { x: child.x, y: child.y };
    //   }
    //   // save old position data
    //   child.oldPosition = { x: child.x, y: child.y, action: child.action, direction: child.direction };
    // }

    allies.getChildren().forEach((child, i) => {
      setUpdate(child, 'player1Skels', 'skelId');
    });
    allyShips.getChildren().forEach((child, i) => {
      setUpdate(child, 'player2Ships', 'shipId');
    });
    enemies.getChildren().forEach((child, i) => {
      setUpdate(child, 'player2Skels', 'skelId');
    });
    enemyShips.getChildren().forEach((child, i) => {
      setUpdate(child, 'player2Ships', 'shipId');
    });

    this.socket.emit('updateModels', Object.fromEntries(batchUpdateMap));
  }

  resetGame(self) {
    player = {};
    playerShip  = undefined;
    playerShips = undefined;
    world       = undefined;
    water       = undefined;
    wood        = undefined;
    enemyShips  = undefined;
    allyShips   = undefined;
    leftPorts   = undefined;
    rightPorts  = undefined;
    enemies     = undefined;
    allies      = undefined;
    allyBuildings   = undefined;
    enemyBuildings  = undefined;
    cannonSmoke = undefined;
    enemyCannonBalls = undefined;
    self.socket.disconnect();
    self.registry.destroy(); // destroy registry
    self.events.off();﻿ // disable all active events
    self.scene.restart();﻿﻿﻿﻿ // restart current scene
  }

  updateHealth() {
    let healthPct;
    if(player.isAShip){
      healthPct = playerShip.health / playerShip.totalHealth * 100;
    } else {
      healthPct = player.health / player.totalHealth * 100;
    }

    this.healthBar.destroy();

    if(healthPct < 1)
    {
      this.healthBar = this.add.image(990, 30, 'healthBar0');
    }
    else if(healthPct > 99)
    {
      this.healthBar = this.add.image(990, 30, 'healthBar6');
    }
    else if(healthPct > 90)
    {
      this.healthBar = this.add.image(990, 30, 'healthBar5');
    }
    else if(healthPct > 70)
    {
      this.healthBar = this.add.image(990, 30, 'healthBar4');
    }
    else if(healthPct > 50)
    {
      this.healthBar = this.add.image(990, 30, 'healthBar3');
    }
    else if(healthPct > 30)
    {
      this.healthBar = this.add.image(990, 30, 'healthBar2');
    }
    else {
      this.healthBar = this.add.image(990, 30, 'healthBar1');
    }

    this.healthBar.setScrollFactor(0,0);

    // Reset Player if they have no health
    if(player.isAShip && playerShip.health <=0){
      playerShip.waterCollider.active = false;
      playerShip.setVelocityY(10);
      player.isAShip = false;
      player.body.enable = true;
      player.health = player.totalHealth;
      player.setPosition(3050, 1300);
      player.setActive(true).setVisible(true);
      this.cameras.main.startFollow(player);
      this.updateHealth();
    }
    else if(player.health <=0){
      // player.once('animationcomplete', function(animation, frame) {
      //   player.play(player.character+'Idle'+player.direction, true);
      // });
      // player.play(player.character+'Die'+player.direction, true);
      player.health = player.totalHealth;
      player.setPosition(3050, 1300);
      this.updateHealth();
    }
  }

  update() {
    if(player == undefined || Object.keys(player).length === 0 || player.anims.currentAnim.key.includes('Die')) {
      return;
    }

    if(this.printKey.isDown){
      this.socket.emit('printToConsole');
    }

    if(this.buildKey.isDown && !player.lockBuildAction && !player.isAShip)
    {
      if(player.money >= BUILDING_COST){
        player.lockBuildAction = true;
        this.socket.emit('createBuilding', {x: player.x, buildWidth: 342});
      }
    }

    if(this.attackKey.isDown && player.isAShip && !playerShip.attackLocked){
      playerShip.attackLocked = true
      this.socket.emit('fireCannonBall', playerShip.shipId);
    }

    if(this.shipKey.isDown && player.isAShip && playerShip && !player.lockShipBuildAction)
    {
      let xMultiplier = playerShip.direction === 'Left' ? -1 : 1;
      playerShip.waterCollider.active = false;
      playerShip.setVelocityY(10);
      player.isAShip = false;
      player.body.enable = true;
      player.setPosition(playerShip.x + (350*xMultiplier), 1300);
      player.setActive(true).setVisible(true);
      this.cameras.main.startFollow(player);
    }

    if(this.attackKey.isDown)
    {
      if(!player.isAShip)
      {
        player.setVelocityX(0);
        player.play(player.character+'Attack1'+player.direction, true).on('animationcomplete', function(animation, frame) {
          player.play(player.character+'Idle'+player.direction, true);
        }, this);
      }
    }
    else if (this.cursors.left.isDown)
    {
      if(!player.isAShip)
      {
        player.direction = 'Left';
        if(this.runKey.isDown){
          player.setVelocityX(-250);
          player.play(player.character+'Run'+player.direction, true);
        } else {
          player.setVelocityX(-160);
          player.play(player.character+'Walk'+player.direction, true);
        }
      }
      else
      {
        playerShip.direction = 'Left';
        playerShip.setVelocityX(-150);
        playerShip.play(playerShip.character+'FastRock'+playerShip.direction, true);
      }
    }
    else if (this.cursors.right.isDown)
    {
      if(!player.isAShip)
      {
        player.direction = 'Right';
        if(this.runKey.isDown){
          player.setVelocityX(250);
          player.play(player.character+'Run'+player.direction, true);
        } else {
          player.setVelocityX(160);
          player.play(player.character+'Walk'+player.direction, true);
        }
      }
      else
      {
        playerShip.direction = 'Right';
        playerShip.setVelocityX(150);
        playerShip.play(playerShip.character+'FastRock'+playerShip.direction, true);
      }
    }
    else if (!this.cursors.right.isDown && !this.cursors.left.isDown
      && !player.anims.currentAnim.key.includes('Attack')
      && !player.anims.currentAnim.key.includes('Die')
      && !player.anims.currentAnim.key.includes('Hurt'))
    {
      if(!player.isAShip)
      {
       player.play(player.character+'Idle'+player.direction, true);
       player.setVelocityX(0);
      }
    }

    // update player's state to the server
    this.doPlayerUpdates()

    // update object locations and run enemy movement logic
    if(player.isHost){
      this.doBatchUpdates();
      this.socket.emit('doSkelMovementLogic');
    }

    // background parallaxing
    this.midCloud1.tilePositionX = this.cameras.main.scrollX * .2;
    this.midCloud2.tilePositionX = this.cameras.main.scrollX * .3;
    this.mountain1.tilePositionX = this.cameras.main.scrollX * .15;
  }
}

var express = require('express');
var app = express();
var server = require('http').Server(app);

const io = require('socket.io')(server, {
  pingTimeout: 60000,
});
//var io = require('socket.io').listen(server);
// map out land mass locations
var landMassMap = new Map();
landMassMap.set(1, {x1: 3180, x2: 3950});
landMassMap.set(2, {x1: 7662, x2: 8628});
landMassMap.set(3, {x1: 11727, x2: 12529});

const SHIP_HEALTH  = 100;
const ENEMY_HEALTH = 200;
const ENEMY_SPEED  = 150;

//var shipIntervals = new Map();
var players          = new Map();
var playerShips      = new Map();
//var enemies          = new Map();
var player1Skels     = new Map();
var player1Ships     = new Map();
var player1Buildings = new Map();
var player2Skels     = new Map();
var player2Ships     = new Map();
var player2Buildings = new Map();
//var enemyShips  = new Map();
//var buildings   = new Map();
var hostIds     = new Map();
var shipId      = 1;
var skelId      = 1;
var buildingId  = 1;
var roomNumber  = 1;

app.use(express.static(__dirname));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
  console.log('a user connected: ' + socket.id);

  var room = socket.handshake.query.room
  // var character = socket.handshake.query.character
  // if(room == undefined || character == undefined) {
  //   console.log('Undefined connection arguments.');
  //   socket.disconnect();
  //   return;
  // }

  // generate roomName if not specified
  if(!room){
    players.forEach((playerRoom, roomName) => {
      console.log('Room: ' + roomName)
      console.log('Size: ' + playerRoom.size)
      if(playerRoom.size < 2){
        room = roomName;
      }
    });
    if(!room){
      room = roomNumber++;
    }
  }

  console.log('Player attempting to join room: ' + room);

  // deny connection if room is full
  if(players.has(room) && players.get(room).size >= 2){
    socket.emit('fullRoom');
    socket.removeAllListeners();
    socket.disconnect();
    return;
  }

  const character = (players.has(room) && players.get(room).size >= 1) ? 'Knight7' : 'Knight1';
  const startPosition = (players.has(room) && players.get(room).size >= 1) ? 11850 : 3050;
  // create player object
  player = {
    playerId: socket.id,
    character: character,
    strength: 1,
    damage: 10,
    health: 300,
    totalHealth: 300,
    width:  118,
    money: 100,
    x: startPosition,
    y: 1300,
    direction: 'Left',
    action: 'Idle',
    isHost: false
  };
  // join player to room
  socket.join(room);
  socket.room = room;

  // initialize all maps for room
  confirmRoomMapInitialized('players',          room);
  confirmRoomMapInitialized('playerShips',      room);
  confirmRoomMapInitialized('player1Ships',     room);
  confirmRoomMapInitialized('player2Ships',     room);
  confirmRoomMapInitialized('player1Skels',     room);
  confirmRoomMapInitialized('player2Skels',     room);
  confirmRoomMapInitialized('player1Buildings', room);
  confirmRoomMapInitialized('player2Buildings', room);

  // add player to room's player map if it exists, else create it and add player
  setMap('players', room, socket.id, player);

  // set initial hostId
  if(!players.get(room).has(hostIds.get(room))) {
    hostIds.set(room, socket.id);
    player.isHost = true;
  }

  // first player initiates ship interval
  // if(players.get(room).size === 1) {
  //   console.log('begin sending ships.');
  //   startShipInterval(room, 20000, false);
  // }

  // print rooms and their players
  console.log(io.sockets.adapter.rooms);

  socket.on('disconnect', function() {
    console.log('user disconnected: ' + socket.id);
    // socket tells everyone to remove its avatar
    socket.to(socket.room).emit('removePlayer', socket.id);
    socket.leave(socket.room);
    // and tell server players array to remove player from room map
    if(players.has(socket.room)){
      players.get(socket.room).delete(socket.id);
    }

    if(playerShips.has(socket.room)){
      playerShips.get(socket.room).delete(socket.id);
    }

    console.log(io.sockets.adapter.rooms);
    //Reset room if room is empty
    if(players.get(socket.room).size === 0) {
      console.log('game is empty')
      resetRoom(socket.room);
    } else { // reasign hostId if host leaves
      if(!players.get(socket.room).has(hostIds.get(socket.room))){
        players.get(socket.room).forEach((item, i) => {
          hostIds.set(socket.room, item.playerId);
          item.isHost = true;
           // tell player to begin sending batch updates and emitting enemy movement requests
          socket.to(item.playerId).emit('becomeHost', {character: 'Knight1'});
          item.character = 'Knight1';
        });
      }
    }
    socket.removeAllListeners();
    socket.disconnect();
  });

  socket.on('sendShip', function(info){
    const isHost = (socket.id === hostIds.get(socket.room));
    const shipGroup = isHost ? 'player1Ships' : 'player2Ships';
    const xMultiplier = info.direction === 'Left' ? -1 : 1;
    const character = (socket.id === hostIds.get(socket.room)) ? 'WhiteShip' : 'BlackShip';

    var shipInfo = {
      character: character,
      ownerId: socket.id,
      shipId: shipId++,
      action: 'FastRock',
      health: SHIP_HEALTH,
      speed: 150,
      x: info.x + (700*xMultiplier),
      y: 1200,
      enemyNum: info.enemyNum,
      direction: info.direction,
      hasHitDock: false,
      damage    : info.damage
     };

    setMap(shipGroup, room, shipInfo.shipId, shipInfo);
    console.log('emitting createShip.');
    io.in(room).emit('createShip', shipInfo);
  });

  socket.on('doSkelMovementLogic', function(){
    if(socket.id !== hostIds.get(socket.room)){
      return;
    }

    // TO-DO make movement logic look for a single player instead of an array of players

    let movementUpdatesBatch = {};
    let player1inArray      = Array.from(players.get(socket.room).values()).filter(p => p.playerId === socket.id);
    let player2inArray      = Array.from(players.get(socket.room).values()).filter(p => p.playerId !== socket.id);
    let player1SkelsArr     = Array.from(player1Skels.get(socket.room).values());
    let player2SkelsArr     = Array.from(player2Skels.get(socket.room).values());
    let player1ShipsArr     = Array.from(player1Ships.get(socket.room).values());
    let player2ShipsArr     = Array.from(player2Ships.get(socket.room).values());
    let player1BuildingsArr = Array.from(player1Buildings.get(socket.room).values());
    let player2BuildingsArr = Array.from(player2Buildings.get(socket.room).values());

    let player1SkelUpdates = doSkelMovementLogic(socket.room, player1SkelsArr, player2inArray, player2BuildingsArr, 'Run', 'Slash');
    let player2SkelUpdates = doSkelMovementLogic(socket.room, player2SkelsArr, player1inArray, player1BuildingsArr, 'Run', 'Slash');
    let player1ShipUpdates = doSkelMovementLogic(socket.room, player1ShipsArr, player2inArray, player2BuildingsArr,'FastRock' , 'SlowRock');
    let player2ShipUpdates = doSkelMovementLogic(socket.room, player2ShipsArr, player1inArray, player1BuildingsArr,'FastRock' , 'SlowRock');

    movementUpdatesBatch['player1Skels'] = player1SkelUpdates;
    movementUpdatesBatch['player1Ships'] = player1ShipUpdates;
    movementUpdatesBatch['player2Skels'] = player2SkelUpdates;
    movementUpdatesBatch['player2Ships'] = player2ShipUpdates;
    io.in(socket.room).emit('skelMovementUpdate', movementUpdatesBatch);
  });

  socket.on('updateModels', function(updateObject) {
    if (socket.id !== hostIds.get(socket.room)){
      return;
    }

    Object.entries(updateObject).forEach((item, i) => {
      var type   = item[0];
      var object = item[1];
      var group;

      switch (type) {
        case 'player1Skels': group = player1Skels; break;
        case 'player1Ships': group = player1Ships; break;
        case 'player2Skels': group = player2Skels; break;
        case 'player2Ships': group = player2Ships; break;
        default: console.log('Requested update with invalid type.');
      }

      Object.entries(object).forEach((entry, i) => {
        if(group.get(socket.room).has(parseInt(entry[0]))) {
          group.get(socket.room).get(parseInt(entry[0])).x = entry[1].x;
          group.get(socket.room).get(parseInt(entry[0])).y = entry[1].y;
        }
      });
    });
  });

  socket.on('fireCannonBall', function(shipId){
    io.in(socket.room).emit('fireCannonBall', shipId);
  })

  socket.on('updatePlayerMovement', function(info) {
    let player = players.get(socket.room).get(socket.id);
    player.x      = info.x;
    player.y      = info.y;
    player.action = info.action;
    player.direction = info.direction;
    player.isAShip   = info.isAShip;
    socket.to(socket.room).emit('updatePlayerMovement', info);
  });

  socket.on('updatePlayerShipMovement', function(info) {
    let playerShip = playerShips.get(socket.room).get(socket.id);
    playerShip.x      = info.x;
    playerShip.y      = info.y;
    playerShip.action = info.action;
    playerShip.direction = info.direction;
    socket.to(socket.room).emit('updatePlayerShipMovement', info);
  });

  socket.on('createBuilding', function(info) {
    let landId;
    landMassMap.forEach((land, i) => {
      if(info.x >= land.x1 && info.x <= land.x2)
        landId = i;
    });

    if(!landId){
      console.log('Building request was not within land coordinates.');
      socket.emit('createBuilding', { playerId: socket.id });
      return;
    }

    // return and release build lock if building would overlap another building
    let breakException = {};
    try{
      if(player1Buildings.has(socket.room)){
        player1Buildings.get(socket.room).forEach((building, i) => {
          if(info.x > building.x - info.buildWidth && info.x < building.x + info.buildWidth){
            console.log('Building request overlapped an existing player 1 building.');
            socket.emit('createBuilding', { playerId: socket.id })
            throw breakException;
          }
        });
      }

      if(player2Buildings.has(socket.room)){
        player2Buildings.get(socket.room).forEach((building, i) => {
          if(info.x > building.x - info.buildWidth && info.x < building.x + info.buildWidth){
            console.log('Building request overlapped an existing player 2 building.');
            socket.emit('createBuilding', { playerId: socket.id })
            throw breakException;
          }
        });
      }
    } catch(e) {
      return;
    };

    let building = {
      ownerId   : socket.id,
      buildingId: buildingId++,
      width:     342,
      landId:    landId,
      health:    300,
      x:         info.x
    }
    let buildInfo = { building: building, playerId: socket.id };
    const buildingGroup = (socket.id === hostIds.get(socket.room)) ? 'player1Buildings' : 'player2Buildings';
    setMap(buildingGroup, socket.room, building.buildingId, building);
    io.in(socket.room).emit('createBuilding', buildInfo);
    console.log('emitting create building for player:' + socket.id);
    console.log('printing buildings in room:');
  });

  socket.on('reduceBuildingHealth', function(info) {
    if (socket.id !== hostIds.get(socket.room)) {
      console.log('Reduce_Building_Health_Request denied.');
      return;
    }

    const group = info.ownerId === socket.id ? player1Buildings : player2Buildings;
    const groupName = info.ownerId === socket.id ? 'player1Buildings' : 'player2Buildings';
    if(!group.get(socket.room).has(info.buildingId)){
      console.log('Could not find building in group: ' + groupName);
      console.log('Building Id: ' + info.buildingId);
      console.log('ownerId: ' + info.ownerId);
      console.log(group.get(socket.room).get(info.buildingId));
      return;
    }

    var building = group.get(socket.room).get(info.buildingId);
    building.health -= info.damage;
    setMap(groupName, socket.room, info.buildingId, building);

    if(building.health <= 0){
      console.log('deleting building ' + info.buildingId);
      group.get(socket.room).delete(info.buildingId);
      io.in(socket.room).emit('removeBuilding', { buildingId: info.buildingId, landId: info.landId, ownerId: info.ownerId });
    }
    console.log('Reduced building num '+info.buildingId+' by '+info.damage);
  });

  socket.on('rebuildShip', function(info) {
    const isHost = (socket.id === hostIds.get(socket.room));
    const isHostShip = (info.ownerId === hostIds.get(socket.room));

    if(!isHost) {
      console.log('ship creation request denied.');
      return;
    }
    console.log(socket.id + ' is creating a new ship');
    console.log(hostIds.get(socket.room))
    // remove old ship
    io.in(socket.room).emit('removeShip', {shipId: info.oldShipId, ownerId: info.ownerId});

    if(isHostShip){
      player1Ships.get(socket.room).delete(info.oldShipId);
    } else {
      player2Ships.get(socket.room).delete(info.oldShipId);
    }

    const xMultiplier = info.direction === 'Left' ? -1 : 1;
    var shipInfo = {
      shipId:     shipId++,
      ownerId:    info.ownerId,
      character:  info.character,
      health:     info.health,
      action:     'FastRock',
      speed:      info.speed,
      x:          info.x + (500*xMultiplier),
      y:          1270,
      enemyNum:   info.enemyNum,
      direction:  info.direction,
      hasHitDock: false,
      damage    : info.damage
     };

    console.log('emitting rebuild ship.');
    setMap(isHostShip ? 'player1Ships' : 'player2Ships', socket.room, shipInfo.shipId, shipInfo);
    io.in(socket.room).emit('createShip', shipInfo);
  });

  socket.on('createPlayerShip', function(info) {
    console.log('Creating a ship for player ' + socket.id);
    let xMultiplier = info.direction === 'Left' ? -1 : 1;
    const character = (socket.id === hostIds.get(socket.room)) ? 'WhiteShip' : 'BlackShip';
    let ship = {
      shipId:     socket.id,
      width:      396,
      action:     'FastRock',
      health:     info.health,
      totalHealth: info.totalHealth,
      damage:     info.damage,
      direction:  info.direction,
      character:  character,
      x:          info.x + (500*xMultiplier),
      y:          1270
    }
    playerShips.get(socket.room).set(socket.id, ship);
    io.in(socket.room).emit('createPlayerShip', ship);
  });

  socket.on('printToConsole', function(){
    console.log('player1Skels: ');
    console.log(player1Skels.get(socket.room));
    console.log('player2Skels: ');
    console.log(player2Skels.get(socket.room));
    console.log('player1Ships: ');
    console.log(player1Ships.get(socket.room));
    console.log('player2Ships: ');
    console.log(player2Ships.get(socket.room));
    console.log('Player 1 Buildings: ');
    console.log(player1Buildings.get(socket.room));
    console.log('Player 2 Buildings: ');
    console.log(player2Buildings.get(socket.room));
    console.log('Players: ');
    console.log(players.get(socket.room));
  })

  socket.on('removeSkeleton', function(skelInfo){
    if (socket.id !== hostIds.get(socket.room)){
      return;
    }

    const skelGroup = (socket.id === skelInfo.ownerId ? player1Skels : player2Skels);

    if(skelGroup.has(socket.room) && skelGroup.get(socket.room).has(skelInfo.skelId)){
      skelGroup.get(socket.room).delete(skelInfo.skelId);
    }
    io.in(socket.room).emit('removeSkeleton', skelInfo);
  });

  socket.on('killEnemy', function(skelInfo){

    console.log('kill enemy with ownerId: ' + skelInfo.ownerId);

    const skelGroup = (socket.id === skelInfo.ownerId ? player1Skels : player2Skels);

    if(skelGroup.has(socket.room) && skelGroup.get(socket.room).has(skelInfo.skelId)){
      skelGroup.get(socket.room).delete(skelInfo.skelId);
    }
    io.in(socket.room).emit('killEnemy', skelInfo);
  });

  socket.on('removeShip', function(shipInfo){
    if (socket.id !== hostIds.get(socket.room)){
      return;
    }

    const shipGroup  = (shipInfo.ownerId === socket.id) ? player1Ships : player2Ships;

    if(shipGroup.has(socket.room) && shipGroup.get(socket.room).has(shipInfo.shipId)){
      shipGroup.get(socket.room).delete(shipInfo.shipId);
    }
    io.in(socket.room).emit('removeShip', shipInfo);
  });

  socket.on('removePlayerShip', function(shipId){
    if(playerShips.has(socket.room) && playerShips.get(socket.room).has(shipId))
      playerShips.get(socket.room).delete(shipId);
    io.in(socket.room).emit('removePlayerShip', shipId);
  });

  socket.on('createSkeletons', function(info) {
    const isHost = (socket.id === hostIds.get(socket.room));

    if (!isHost) {
      console.log('enemy creation request denied.');
      return;
    }

    const isHostShip = (info.ownerId === socket.id);
    const shipGroup  = isHostShip ? player1Ships : player2Ships;
    const skelGroup  = isHostShip ? 'player1Skels' : 'player2Skels';

    var ship = shipGroup.get(socket.room).get(info.shipId);
    if(!ship || (ship && ship.hasHitDock)){
      console.log('it aint happening');
      console.log('is host ship? ' + isHostShip);
      console.log('ship? ' + ship);
      return;
    }

    console.log('creating '+info.enemyNum+' enemies');
    ship.hasHitDock = true;
    ship.enemyNum   = 0;
    // create enemy objects
    var skelArr = []
    const xMultiplier = info.direction === 'Left' ? -1 : 1;
    const character = (ship.character === 'BlackShip') ? 'Skel7' : 'Skel5';
    for(var i = 0; i < info.enemyNum; i++){
      var skel = {
        ownerId:   info.ownerId,
        skelId:    skelId++,
        character: character,
        action:    'Run',
        damage:    20,
        shipId:    info.shipId,
        health:    ENEMY_HEALTH * (info.health/SHIP_HEALTH),
        speed:     150,
        direction: info.direction,
        x:         info.x + (20*xMultiplier),
        y:         1200
      };
      skelArr.push(skel);
    }
    io.in(socket.room).emit('createSkeletons', Object.assign({}, skelArr));
    // delay so enemies can be created locally becfore server-side movement logic
    setTimeout(function(){
      for(let i=0; i < skelArr.length; i++ ){
        setMap(skelGroup, socket.room, skelArr[i].skelId, skelArr[i]);
        console.log(skel.skelId+ '=> added skel? '+ player1Skels.length);
      }
    },1500)
  });

  var currentState = {
    players:          Object.fromEntries(players.has(room)?players.get(room):new Map()),
    player1Buildings: Object.fromEntries(player1Buildings.has(room)?player1Buildings.get(room):new Map()),
    player2Buildings: Object.fromEntries(player2Buildings.has(room)?player2Buildings.get(room):new Map()),
    player1Skels:     Object.fromEntries(player1Skels.has(room)?player1Skels.get(room):new Map()),
    player2Skels:     Object.fromEntries(player2Skels.has(room)?player2Skels.get(room):new Map()),
    player1Ships:     Object.fromEntries(player1Ships.has(room)?player1Ships.get(room):new Map()),
    player2Ships:     Object.fromEntries(player2Ships.has(room)?player2Ships.get(room):new Map()),
    playerShips:      Object.fromEntries(playerShips.has(room)?playerShips.get(room):new Map())
  }
  // tell player current state of game
  socket.emit('currentState', currentState);
  // inform others of new player
  socket.to(socket.room).emit('newPlayer', player);
})

server.listen(8080, function () {
  console.log(`Listening on ${server.address().port}`);
});

function resetRoom(room) {
  players.delete(room);
  player1Skels.delete(room);
  player2Skels.delete(room);
  player1Ships.delete(room);
  player2Ships.delete(room);
  player1Buildings.delete(room);
  player2Buildings.delete(room);
  playerShips.delete(room);
}

function doSkelMovementLogic(room, enemyArray, playersArr, buildingsArr, baselineAction, destinationAction){
  const CANNON_RANGE = 600;
  const WIDTH_VARIANCE = 3;
  const ENEMY_SPEED = 150;
  let actionsBatch = {};
  for(let i=0; i<enemyArray.length; i++) {
    let actionModel = {};
    let key;
    let enemy = enemyArray[i];
    const enemyIsShip = enemy.skelId ? false : true;
    let initialDirection = enemy.direction;
    let initialAction = enemy.action;
    let initialSpeed  = enemy.speed;
    let initialFire = enemy.fire;

    if(enemyIsShip)
    {
      actionModel.shipId = enemy.shipId;
    }
    else
    {
      actionModel.skelId = enemy.skelId;
    }

    actionModel.action = baselineAction;

    let closestBuilding;
    buildingsArr.forEach((child, i) => { // search for closest building
      if(!closestBuilding){
        closestBuilding = child;
      } else {
        if(Math.abs(enemy.x - closestBuilding.x) > Math.abs(enemy.x - child.x))
          closestBuilding = child;
      }
    });

    let xCoord;
    let displayWidth;
    if(closestBuilding) // found a building
    {
      xCoord       = closestBuilding.x;
      displayWidth = closestBuilding.width;
    }
    else
    {
      let closestPlayer;
      playersArr.forEach((child, i) => { // find closest player or closest player ship
        var trackedObj = child.isAShip ? playerShips.get(room).get(child.playerId) : child;
        if(!closestPlayer){
          closestPlayer = trackedObj;
        } else {
          if(Math.abs(enemy.x - closestPlayer.x) > Math.abs(enemy.x - trackedObj.x))
            closestPlayer = trackedObj;
        }
      });
      if(closestPlayer) // found a player
      {
        xCoord       = closestPlayer.x;
        displayWidth = closestPlayer.width;
      }
    }

    if(xCoord && displayWidth)
    {
      if(xCoord + (displayWidth/2) + WIDTH_VARIANCE < enemy.x) // enemy go left
      {
        actionModel.velocity = (ENEMY_SPEED * -1);
        actionModel.direction = 'Left';
        // console.log('tell enemy to go left');
      }
      else if(xCoord - (displayWidth/2) - WIDTH_VARIANCE > enemy.x) // enemy go right
      {
        actionModel.velocity = (ENEMY_SPEED);
        actionModel.direction = 'Right';
        // console.log('tell enemy to go right');
      }
      else // enemy reached destination
      {
        actionModel.velocity = 0;
        actionModel.action = destinationAction;
        actionModel.direction = initialDirection;
         // console.log('tell enemy to stop moving');
      }

      // if(enemyIsShip && enemy.hasHitDock) { //  only update ship fire if enemy is docked
      //   actionModel.velocity = 0;
      //   actionModel.action = initialAction;
      //   actionModel.direction = initialDirection;
      // }

      // enemy ship cannon fire logic
      if(enemyIsShip && (Math.abs(xCoord - enemy.x) <= CANNON_RANGE)){
        if(enemyIsShip)
        actionModel.fire = true;
      } else {
        actionModel.fire = undefined;
      }

      if(initialSpeed !== Math.abs(actionModel.velocity) || initialDirection !== actionModel.direction
        || initialAction !== actionModel.action || initialFire !== actionModel.fire){
          console.log('telling someone go '+actionModel.direction+':');
          if(enemyIsShip)
            console.log('fire?:' + actionModel.fire)
          actionsBatch[enemyIsShip ? enemy.shipId : enemy.skelId] = actionModel;
          enemy.direction = actionModel.direction
          enemy.action = actionModel.action
          enemy.speed = Math.abs(actionModel.velocity);
          enemy.fire = actionModel.fire;
      }
    }
  }
  return actionsBatch;
}

function setMap(map, room, key, value){
  switch (map) {
    case 'players':
      if(players.has(room)){
        players.get(room).set(key, value);
      } else {
        let map = new Map();
        map.set(key, value)
        players.set(room, map);
      }
      break;
    case 'player1Skels':
      if(player1Skels.has(room)){
        player1Skels.get(room).set(key, value);
      } else {
        let map = new Map();
        map.set(key, value)
        player1Skels.set(room, map);
      }
      break;
    case 'player2Skels':
      if(player2Skels.has(room)){
        player2Skels.get(room).set(key, value);
      } else {
        let map = new Map();
        map.set(key, value)
        player2Skels.set(room, map);
      }
      break;
    case 'player1Ships':
      if(player1Ships.has(room)){
        player1Ships.get(room).set(key, value);
      } else {
        let map = new Map();
        map.set(key, value)
        player1Ships.set(room, map);
      }
      break;
    case 'player2Ships':
      if(player2Ships.has(room)){
        player2Ships.get(room).set(key, value);
      } else {
        let map = new Map();
        map.set(key, value)
        player2Ships.set(room, map);
      }
      break;
    case 'playerShips':
      if(playerShips.has(room)){
        playerShips.get(room).set(key, value);
      } else {
        let map = new Map();
        map.set(key, value)
        playerShips.set(room, map);
      }
      break;
    case 'player1Buildings':
      if(player1Buildings.has(room)){
        player1Buildings.get(room).set(key, value);
      } else {
        let map = new Map();
        map.set(key, value)
        player1Buildings.set(room, map);
      }
      break;
    case 'player2Buildings':
      if(player2Buildings.has(room)){
        player2Buildings.get(room).set(key, value);
      } else {
        let map = new Map();
        map.set(key, value)
        player2Buildings.set(room, map);
      }
      break;
    default: console.log('INVALID MAP NAME');
  }
}

function confirmRoomMapInitialized(map, room){
  switch (map) {
    case 'players':
      if(!players.has(room))
        players.set(room, new Map());
      break;
    case 'player1Skels':
      if(!player1Skels.has(room))
        player1Skels.set(room, new Map());
      break;
    case 'player2Skels':
      if(!player2Skels.has(room))
        player2Skels.set(room, new Map());
      break;
    case 'player1Ships':
      if(!player1Ships.has(room))
        player1Ships.set(room, new Map());
      break;
    case 'player2Ships':
      if(!player2Ships.has(room))
        player2Ships.set(room, new Map());
      break;
    case 'playerShips':
      if(!playerShips.has(room))
        playerShips.set(room, new Map());
      break;
    case 'player1Buildings':
      if(!player1Buildings.has(room))
        player1Buildings.set(room, new Map());
      break;
    case 'player2Buildings':
      if(!player2Buildings.has(room))
        player2Buildings.set(room, new Map());
      break;
    default: console.log('INVALID MAP NAME');
  }
}

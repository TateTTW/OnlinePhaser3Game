class LoadAssets extends Phaser.Scene {
  constructor ()
  {
      super('LoadAssets');
  }

  preload ()
  {
    //background images
    this.load.image('sky_color', 'assets/background/parallax_parts/sky_color32.png');
    this.load.image('farground_cloud_1', 'assets/background/parallax_parts/farground_cloud_1.png');
    this.load.image('farground_cloud_2', 'assets/background/parallax_parts/farground_cloud_2.png');
    this.load.image('mid_ground_cloud_1', 'assets/background/parallax_parts/mid_ground_cloud_1.png');
    this.load.image('mid_ground_cloud_2', 'assets/background/parallax_parts/mid_ground_cloud_2.png');
    this.load.image('farground_mountains', 'assets/background/parallax_parts/mountain_with_hills/farground_mountains.png');
    //map assets
    this.load.image('bright_water_tiles_288x32', 'assets/image/bright_water_tiles_288x32.png');
    this.load.image('grass_tiles_320x192', 'assets/image/grass_tiles_320x192.png');
    this.load.image('wood_tiles', 'assets/image/wood_tiles.png');
    this.load.tilemapTiledJSON('map32', 'assets/map/map32_2.json');
    //sprite sheets
     this.load.atlas('Knight1','assets/image/Knight1.png','assets/image/Knight1.json');
     this.load.atlas('Knight1Right','assets/image/Knight1Right.png','assets/image/Knight1Right.json');
     this.load.atlas('Knight7','assets/image/Knight7.png','assets/image/Knight7.json');
     this.load.atlas('Knight7Right','assets/image/Knight7Right.png','assets/image/Knight7Right.json');
     this.load.atlas('WhiteShip','assets/image/whiteShipLeft2.png','assets/image/whiteShipLeft2.json');
     this.load.atlas('WhiteShipRight','assets/image/whiteShipRight.png','assets/image/whiteShipRight.json');
     this.load.atlas('BlackShip','assets/image/BlackShipLeft.png','assets/image/BlackShipLeft.json');
     this.load.atlas('BlackShipRight','assets/image/BlackShipRight2.png','assets/image/BlackShipRight2.json');
     this.load.atlas('Skel5','assets/image/Skel5.png','assets/image/Skel5.json');
     this.load.atlas('Skel5Right','assets/image/Skel5Right.png','assets/image/Skel5Right.json');
     this.load.atlas('Skel7','assets/image/Skel7.png','assets/image/Skel7.json');
     this.load.atlas('Skel7Right','assets/image/Skel7Right.png','assets/image/Skel7Right.json');
     this.load.atlas('Building','assets/image/buildingSprite.png','assets/image/buildingSprite.json');
     this.load.atlas('EnemyBuilding','assets/image/enemyBuildingSprite.png','assets/image/enemyBuildingSprite.json');
     this.load.atlas('CannonSmoke','assets/image/CannonSmoke.png','assets/image/CannonSmoke.json');
     this.load.atlas('GoldCoin','assets/image/goldCoin.png','assets/image/goldCoin.json');
     // other images
     this.load.image('ball', 'assets/image/ball.png');
     this.load.image('healthBar0', 'assets/image/healthBar/health0.png');
     this.load.image('healthBar1', 'assets/image/healthBar/health1.png');
     this.load.image('healthBar2', 'assets/image/healthBar/health2.png');
     this.load.image('healthBar3', 'assets/image/healthBar/health3.png');
     this.load.image('healthBar4', 'assets/image/healthBar/health4.png');
     this.load.image('healthBar5', 'assets/image/healthBar/health5.png');
     this.load.image('healthBar6', 'assets/image/healthBar/health6.png');
     //build menu elements
     this.load.image('upBtn', 'assets/image/buttons/mobileButtons/up.png');
     this.load.image('downBtn', 'assets/image/buttons/mobileButtons/down.png');
     this.load.image('mobileBuildBtn', 'assets/image/buttons/mobileButtons/build.png');
     this.load.image('submitBtn', 'assets/image/buttons/mobileButtons/submit.png');
     this.load.image('buildBtn', 'assets/image/buttons/build.png');
     this.load.image('panel', 'assets/image/panel.png');

  }

  create()
  {
    this.anims.create({
        key: 'GoldCoin',
        frames:  this.anims.generateFrameNames('GoldCoin', {
          start: 0,
          end: 6,
          zeroPad: 0,
          prefix: '',
          suffix: '.png'
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'CannonSmoke',
        frames:  this.anims.generateFrameNames('CannonSmoke', {
          start: 1,
          end: 14,
          zeroPad: 0,
          prefix: '',
          suffix: '.png'
        }),
        frameRate: 20
    });
    //Skel5 animations
    this.anims.create({
        key: 'Skel5DieLeft',
        frames:  this.anims.generateFrameNames('Skel5', {
          start: 0,
          end: 9,
          zeroPad: 3,
          prefix: '__skeleton_warrior_05_die_2_',
          suffix: '.png'
        }),
        frameRate: 20
    });

    this.anims.create({
        key: 'Skel5WalkLeft',
        frames:  this.anims.generateFrameNames('Skel5', {
          start: 0,
          end: 15,
          zeroPad: 3,
          prefix: '__skeleton_warrior_05_walk_',
          suffix: '.png'
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'Skel5IdleLeft',
        frames:  this.anims.generateFrameNames('Skel5', {
          start: 0,
          end: 19,
          zeroPad: 3,
          prefix: '__skeleton_warrior_05_idle_',
          suffix: '.png'
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'Skel5RunLeft',
        frames:  this.anims.generateFrameNames('Skel5', {
          start: 0,
          end: 15,
          zeroPad: 3,
          prefix: '__skeleton_warrior_05_run_',
          suffix: '.png'
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'Skel5SlashLeft',
        frames:  this.anims.generateFrameNames('Skel5', {
          start: 0,
          end: 9,
          zeroPad: 3,
          prefix: '__skeleton_warrior_05_attack_slash_',
          suffix: '.png'
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'Skel5DieRight',
        frames:  this.anims.generateFrameNames('Skel5Right', {
          start: 0,
          end: 9,
          zeroPad: 3,
          prefix: '__skeleton_warrior_05_die_2_',
          suffix: '.png'
        }),
        frameRate: 20
    });

    this.anims.create({
        key: 'Skel5WalkRight',
        frames:  this.anims.generateFrameNames('Skel5Right', {
          start: 0,
          end: 15,
          zeroPad: 3,
          prefix: '__skeleton_warrior_05_walk_',
          suffix: '.png'
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'Skel5IdleRight',
        frames:  this.anims.generateFrameNames('Skel5Right', {
          start: 0,
          end: 19,
          zeroPad: 3,
          prefix: '__skeleton_warrior_05_idle_',
          suffix: '.png'
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'Skel5RunRight',
        frames:  this.anims.generateFrameNames('Skel5Right', {
          start: 0,
          end: 15,
          zeroPad: 3,
          prefix: '__skeleton_warrior_05_run_',
          suffix: '.png'
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'Skel5SlashRight',
        frames:  this.anims.generateFrameNames('Skel5Right', {
          start: 0,
          end: 9,
          zeroPad: 3,
          prefix: '__skeleton_warrior_05_attack_slash_',
          suffix: '.png'
        }),
        frameRate: 10,
        repeat: -1
    });

    //skell7 animations
    this.anims.create({
        key: 'Skel7DieLeft',
        frames:  this.anims.generateFrameNames('Skel7', {
          start: 0,
          end: 9,
          zeroPad: 3,
          prefix: '__skeleton_warrior_07_die_2_',
          suffix: '.png'
        }),
        frameRate: 20
    });

    this.anims.create({
        key: 'Skel7WalkLeft',
        frames:  this.anims.generateFrameNames('Skel7', {
          start: 0,
          end: 15,
          zeroPad: 3,
          prefix: '__skeleton_warrior_07_walk_',
          suffix: '.png'
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'Skel7IdleLeft',
        frames:  this.anims.generateFrameNames('Skel7', {
          start: 0,
          end: 19,
          zeroPad: 3,
          prefix: '__skeleton_warrior_07_idle_',
          suffix: '.png'
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'Skel7RunLeft',
        frames:  this.anims.generateFrameNames('Skel7', {
          start: 0,
          end: 15,
          zeroPad: 3,
          prefix: '__skeleton_warrior_07_run_',
          suffix: '.png'
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'Skel7SlashLeft',
        frames:  this.anims.generateFrameNames('Skel7', {
          start: 0,
          end: 9,
          zeroPad: 3,
          prefix: '__skeleton_warrior_07_attack_slash_',
          suffix: '.png'
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'Skel7DieRight',
        frames:  this.anims.generateFrameNames('Skel7Right', {
          start: 0,
          end: 9,
          zeroPad: 3,
          prefix: '__skeleton_warrior_07_die_2_',
          suffix: '.png'
        }),
        frameRate: 20
    });

    this.anims.create({
        key: 'Skel7WalkRight',
        frames:  this.anims.generateFrameNames('Skel7Right', {
          start: 0,
          end: 15,
          zeroPad: 3,
          prefix: '__skeleton_warrior_07_walk_',
          suffix: '.png'
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'Skel7IdleRight',
        frames:  this.anims.generateFrameNames('Skel7Right', {
          start: 0,
          end: 19,
          zeroPad: 3,
          prefix: '__skeleton_warrior_07_idle_',
          suffix: '.png'
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'Skel7RunRight',
        frames:  this.anims.generateFrameNames('Skel7Right', {
          start: 0,
          end: 15,
          zeroPad: 3,
          prefix: '__skeleton_warrior_07_run_',
          suffix: '.png'
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'Skel7SlashRight',
        frames:  this.anims.generateFrameNames('Skel7Right', {
          start: 0,
          end: 9,
          zeroPad: 3,
          prefix: '__skeleton_warrior_07_attack_slash_',
          suffix: '.png'
        }),
        frameRate: 10,
        repeat: -1
    });

    // Knight1 animations
    this.anims.create({
        key: 'Knight1DieLeft',
        frames:  this.anims.generateFrameNames('Knight1', {
          start: 0,
          end: 3,
          zeroPad: 3,
          prefix: '__knight_1_die_',
          suffix: '.png'
        }),
        frameRate: 10
    });

    this.anims.create({
        key: 'Knight1HurtLeft',
        frames:  this.anims.generateFrameNames('Knight1', {
          start: 0,
          end: 3,
          zeroPad: 3,
          prefix: '__knight_1_hurt_',
          suffix: '.png'
        }),
        frameRate: 10
    });

    this.anims.create({
        key: 'Knight1DieRight',
        frames:  this.anims.generateFrameNames('Knight1Right', {
          start: 0,
          end: 3,
          zeroPad: 3,
          prefix: '__knight_1_die_',
          suffix: '.png'
        }),
        frameRate: 10
    });

    this.anims.create({
        key: 'Knight1HurtRight',
        frames:  this.anims.generateFrameNames('Knight1Right', {
          start: 0,
          end: 3,
          zeroPad: 3,
          prefix: '__knight_1_hurt_',
          suffix: '.png'
        }),
        frameRate: 10
    });

    this.anims.create({
        key: 'Knight1IdleLeft',
        frames:  this.anims.generateFrameNames('Knight1', {
          start: 0,
          end: 19,
          zeroPad: 3,
          prefix: '__knight_1_idle_',
          suffix: '.png'
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'Knight1IdleRight',
        frames:  this.anims.generateFrameNames('Knight1Right', {
          start: 0,
          end: 19,
          zeroPad: 3,
          prefix: '__knight_1_idle_',
          suffix: '.png'
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'Knight1WalkLeft',
        frames:  this.anims.generateFrameNames('Knight1', {
          start: 0,
          end: 11,
          zeroPad: 3,
          prefix: '__knight_1_walk_',
          suffix: '.png'
        }),
        frameRate: 12,
        repeat: -1
    });

    this.anims.create({
        key: 'Knight1WalkRight',
        frames:  this.anims.generateFrameNames('Knight1Right', {
          start: 0,
          end: 11,
          zeroPad: 3,
          prefix: '__knight_1_walk_',
          suffix: '.png'
        }),
        frameRate: 12,
        repeat: -1
    });

    this.anims.create({
        key: 'Knight1RunLeft',
        frames:  this.anims.generateFrameNames('Knight1', {
          start: 0,
          end: 11,
          zeroPad: 3,
          prefix: '__knight_1_run_',
          suffix: '.png'
        }),
        frameRate: 12,
        repeat: -1
    });

    this.anims.create({
        key: 'Knight1RunRight',
        frames:  this.anims.generateFrameNames('Knight1Right', {
          start: 0,
          end: 11,
          zeroPad: 3,
          prefix: '__knight_1_run_',
          suffix: '.png'
        }),
        frameRate: 12,
        repeat: -1
    });

    this.anims.create({
        key: 'Knight1Attack1Left',
        frames:  this.anims.generateFrameNames('Knight1', {
          start: 0,
          end: 24,
          zeroPad: 3,
          prefix: '__knight_1_attack_one_',
          suffix: '.png'
        }),
        frameRate: 10
    });

    this.anims.create({
        key: 'Knight1Attack1Right',
        frames:  this.anims.generateFrameNames('Knight1Right', {
          start: 0,
          end: 24,
          zeroPad: 3,
          prefix: '__knight_1_attack_one_',
          suffix: '.png'
        }),
        frameRate: 10
    });

    //knight7 animations
    this.anims.create({
        key: 'Knight7DieLeft',
        frames:  this.anims.generateFrameNames('Knight7', {
          start: 0,
          end: 3,
          zeroPad: 3,
          prefix: '__knight_7_die_',
          suffix: '.png'
        }),
        frameRate: 10
    });

    this.anims.create({
        key: 'Knight7HurtLeft',
        frames:  this.anims.generateFrameNames('Knight7', {
          start: 0,
          end: 3,
          zeroPad: 3,
          prefix: '__knight_7_hurt_',
          suffix: '.png'
        }),
        frameRate: 10
    });

    this.anims.create({
        key: 'Knight7DieRight',
        frames:  this.anims.generateFrameNames('Knight7Right', {
          start: 0,
          end: 3,
          zeroPad: 3,
          prefix: '__knight_7_die_',
          suffix: '.png'
        }),
        frameRate: 10
    });

    this.anims.create({
        key: 'Knight7HurtRight',
        frames:  this.anims.generateFrameNames('Knight7Right', {
          start: 0,
          end: 3,
          zeroPad: 3,
          prefix: '__knight_7_hurt_',
          suffix: '.png'
        }),
        frameRate: 10
    });

    this.anims.create({
        key: 'Knight7IdleLeft',
        frames:  this.anims.generateFrameNames('Knight7', {
          start: 0,
          end: 19,
          zeroPad: 3,
          prefix: '__knight_7_idle_',
          suffix: '.png'
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'Knight7IdleRight',
        frames:  this.anims.generateFrameNames('Knight7Right', {
          start: 0,
          end: 19,
          zeroPad: 3,
          prefix: '__knight_7_idle_',
          suffix: '.png'
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'Knight7WalkLeft',
        frames:  this.anims.generateFrameNames('Knight7', {
          start: 0,
          end: 11,
          zeroPad: 3,
          prefix: '__knight_7_walk_',
          suffix: '.png'
        }),
        frameRate: 12,
        repeat: -1
    });

    this.anims.create({
        key: 'Knight7WalkRight',
        frames:  this.anims.generateFrameNames('Knight7Right', {
          start: 0,
          end: 11,
          zeroPad: 3,
          prefix: '__knight_7_walk_',
          suffix: '.png'
        }),
        frameRate: 12,
        repeat: -1
    });

    this.anims.create({
        key: 'Knight7RunLeft',
        frames:  this.anims.generateFrameNames('Knight7', {
          start: 0,
          end: 11,
          zeroPad: 3,
          prefix: '__knight_7_run_',
          suffix: '.png'
        }),
        frameRate: 12,
        repeat: -1
    });

    this.anims.create({
        key: 'Knight7RunRight',
        frames:  this.anims.generateFrameNames('Knight7Right', {
          start: 0,
          end: 11,
          zeroPad: 3,
          prefix: '__knight_7_run_',
          suffix: '.png'
        }),
        frameRate: 12,
        repeat: -1
    });

    this.anims.create({
        key: 'Knight7Attack1Left',
        frames:  this.anims.generateFrameNames('Knight7', {
          start: 0,
          end: 24,
          zeroPad: 3,
          prefix: '__knight_7_attack_one_',
          suffix: '.png'
        }),
        frameRate: 10
    });

    this.anims.create({
        key: 'Knight7Attack1Right',
        frames:  this.anims.generateFrameNames('Knight7Right', {
          start: 0,
          end: 24,
          zeroPad: 3,
          prefix: '__knight_7_attack_one_',
          suffix: '.png'
        }),
        frameRate: 10
    });

    //ship animations
    this.anims.create({
        key: 'WhiteShipFastRockLeft',
        frames: this.anims.generateFrameNames('WhiteShip', {
          start: 0,
          end: 24,
          zeroPad: 0,
          prefix: 'whiteShipSheet-',
          suffix: '.png'
        }),
        frameRate: 20,
        repeat: -1
    });

    this.anims.create({
        key: 'WhiteShipFastRockRight',
        frames: this.anims.generateFrameNames('WhiteShipRight', {
          start: 0,
          end: 24,
          zeroPad: 0,
          prefix: 'whiteShipSheet-',
          suffix: '.png'
        }),
        frameRate: 20,
        repeat: -1
    });

    this.anims.create({
        key: 'WhiteShipSlowRockLeft',
        frames: this.anims.generateFrameNames('WhiteShip', {
          start: 0,
          end: 24,
          zeroPad: 0,
          prefix: 'whiteShipSheet-',
          suffix: '.png'
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'WhiteShipSlowRockRight',
        frames: this.anims.generateFrameNames('WhiteShipRight', {
          start: 0,
          end: 24,
          zeroPad: 0,
          prefix: 'whiteShipSheet-',
          suffix: '.png'
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'BlackShipFastRockLeft',
        frames: this.anims.generateFrameNames('BlackShip', {
          start: 0,
          end: 24,
          zeroPad: 0,
          prefix: 'black-sails-rocking-action-25-frames-1317px-by-1437per-frame-',
          suffix: '.png'
        }),
        frameRate: 20,
        repeat: -1
    });

    this.anims.create({
        key: 'BlackShipFastRockRight',
        frames: this.anims.generateFrameNames('BlackShipRight', {
          start: 0,
          end: 24,
          zeroPad: 0,
          prefix: 'black-sails-rocking-action-25-frames-1317px-by-1437per-frame-',
          suffix: '.png'
        }),
        frameRate: 20,
        repeat: -1
    });

    this.anims.create({
        key: 'BlackShipSlowRockLeft',
        frames: this.anims.generateFrameNames('BlackShip', {
          start: 0,
          end: 24,
          zeroPad: 0,
          prefix: 'black-sails-rocking-action-25-frames-1317px-by-1437per-frame-',
          suffix: '.png'
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'BlackShipSlowRockRight',
        frames: this.anims.generateFrameNames('BlackShipRight', {
          start: 0,
          end: 24,
          zeroPad: 0,
          prefix: 'black-sails-rocking-action-25-frames-1317px-by-1437per-frame-',
          suffix: '.png'
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'Building',
        frames:  this.anims.generateFrameNames('Building', {
          start: 1,
          end: 5,
          zeroPad: 2,
          prefix: 'building',
          suffix: '.png'
        }),
        frameRate: 10
    });

    // start game after loading assets
    this.scene.start('PlayScene');
  }

  update() {}
}

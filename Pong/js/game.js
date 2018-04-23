var gameProperties = {
    screenWidth: 640,
    screenHeight: 480,
    dashSize: 5,
    paddleLeft_x: 40,
    paddleRight_x: 600,
    paddleVelocity: 600,
    paddleSegmentsMax: 4,
    paddleSegmentHeight: 4,
    paddleSegmentAngle: 15,
    paddleTopGap: 0,

    ballVelocity: 350,
    ballStartDelay: 2,
    ballRandomStartingAngleLeft: [-120, 120],
    ballRandomStartingAngleRight: [-60, 60],
    ballVelocityIncrement: 25,
    ballReturnCount: 4,

    scoreToWin: 3,

    isVsAI: true,
    AIPaddleVelocity: 400,
    //if paddle is within this much of ball AI wont move
    AIFreezeGap: 10,
};

var graphicAssets = {
    ballURL: 'assets/ball.png',
    ballName: 'ball',
    
    paddleURL: 'assets/paddle.png',
    paddleName: 'paddle'
};
 
var soundAssets = {
    ballBounceURL: 'assets/ballBounce',
    ballBounceName: 'ballBounce',
    
    ballHitURL: 'assets/ballHit',
    ballHitName: 'ballHit',
    
    ballMissedURL: 'assets/ballMissed',
    ballMissedName: 'ballMissed',
    
    mp4URL: '.m4a',
    oggURL: '.ogg'
};

var fontAssets = {
    scoreLeft_x: gameProperties.screenWidth * 0.25,
    scoreRight_x: gameProperties.screenWidth * 0.75,
    scoreTop_y: 10,
    
    scoreFontStyle:{font: '80px Arial', fill: '#FFFFFF', align: 'center'},
    instructionsFontStyle:{font: '24px Arial', fill: '#FFFFFF', align: 'center'},
};

var labels = {
    instructions: 'UP and DOWN to move.\n\n- click to start -',
    winner: 'Winner!',
}; 

// The main state that contains our game. Think of states like pages or screens such as the splash screen, main menu, game screen, high scores, inventory, etc.
var mainState = function(game)
{
    this.backgroundGraphics;
    this.ballSprite;
    this.paddleLeftSprite;
    this.paddleRightSprite;
    this.paddleGroup;

    this.paddleLeft_up;
    this.paddleLeft_down;
    this.paddleRight_up;
    this.paddleRight_down;

    this.missedSide;

    this.scoreLeft;
    this.scoreRight;
    //tf is for text field
    this.tf_scoreLeft;
    this.tf_scoreRight;

    //sounds
    this.sndBallHit;
    this.sndBallBounce;
    this.sndBallMissed;

    this.instructions;
    this.winnerLeft;
    this.winnerRight;

    this.ballVelocity;
}

mainState.prototype = {

    // The preload function is use to load assets into the game
    preload: function () {
        game.load.image(graphicAssets.ballName, graphicAssets.ballURL);
        game.load.image(graphicAssets.paddleName, graphicAssets.paddleURL);
        
        game.load.audio(soundAssets.ballBounceName, [soundAssets.ballBounceURL+soundAssets.mp4URL, soundAssets.ballBounceURL+soundAssets.oggURL]);
        game.load.audio(soundAssets.ballHitName, [soundAssets.ballHitURL+soundAssets.mp4URL, soundAssets.ballHitURL+soundAssets.oggURL]);
        game.load.audio(soundAssets.ballMissedName, [soundAssets.ballMissedURL+soundAssets.mp4URL, soundAssets.ballMissedURL+soundAssets.oggURL]);
    },

    // The create function is called after all assets are loaded and ready for use. This is where we add all our sprites, sounds, levels, text, etc.
    create: function () {
        this.initGraphics();
        this.initPhysics();
        this.initKeyboard();
        this.initSounds();
        this.startDemo();
    },

    // The update function is run every frame. The default frame rate is 60 frames per second, so the update function is run 60 times per second
    update: function () {
        this.moveLeftPaddle();
        this.moveRightPaddle();
        game.physics.arcade.overlap(this.ballSprite,this.paddleGroup, this.collideWithPaddle, null, this);
        //play sound if it hits the edge
        if (this.ballSprite.body.blocked.up || this.ballSprite.body.blocked.down || this.ballSprite.body.blocked.left || this.ballSprite.body.blocked.right) {
            this.sndBallBounce.play();
        }
    },

    initGraphics: function () {
        this.backgroundGraphics = game.add.graphics(0, 0);
        this.backgroundGraphics.lineStyle(2, 0xFFFFFF, 1);
        
        for (var y = 0; y < gameProperties.screenHeight; y += gameProperties.dashSize * 2) {
            this.backgroundGraphics.moveTo(game.world.centerX, y);
            this.backgroundGraphics.lineTo(game.world.centerX, y + gameProperties.dashSize);
        }
        
        this.ballSprite = game.add.sprite(game.world.centerX, game.world.centerY, graphicAssets.ballName);
        this.ballSprite.anchor.set(0.5, 0.5);
        
        this.paddleLeftSprite = game.add.sprite(gameProperties.paddleLeft_x, game.world.centerY, graphicAssets.paddleName);
        this.paddleLeftSprite.anchor.set(0.5, 0.5);
        
        this.paddleRightSprite = game.add.sprite(gameProperties.paddleRight_x, game.world.centerY, graphicAssets.paddleName);
        this.paddleRightSprite.anchor.set(0.5, 0.5);

        this.tf_scoreLeft = game.add.text(fontAssets.scoreLeft_x, fontAssets.scoreTop_y, "0", fontAssets.scoreFontStyle);
        this.tf_scoreLeft.anchor.set(0.5, 0);
        
        this.tf_scoreRight = game.add.text(fontAssets.scoreRight_x, fontAssets.scoreTop_y, "0", fontAssets.scoreFontStyle);
        this.tf_scoreRight.anchor.set(0.5, 0);
 
        this.instructions = game.add.text(game.world.centerX, game.world.centerY, labels.instructions, fontAssets.instructionsFontStyle);
        this.instructions.anchor.set(0.5, 0.5);
        
        this.winnerLeft = game.add.text(gameProperties.screenWidth * 0.25, gameProperties.screenHeight * 0.25, labels.winner, fontAssets.instructionsFontStyle);
        this.winnerLeft.anchor.set(0.5, 0.5);
        
        this.winnerRight = game.add.text(gameProperties.screenWidth * 0.75, gameProperties.screenHeight * 0.25, labels.winner, fontAssets.instructionsFontStyle);
        this.winnerRight.anchor.set(0.5, 0.5);

        this.hideTextFields();
    },

    initPhysics: function () {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.enable(this.ballSprite);
 
        this.ballSprite.checkWorldBounds = true;
        this.ballSprite.body.collideWorldBounds = true;
        //stops natural physics forces from happening when it collides
        this.ballSprite.body.immovable = true;
        this.ballSprite.body.bounce.set(1);
        this.ballSprite.events.onOutOfBounds.add(this.ballOutOfBounds, this);

        this.paddleGroup = game.add.group();
        this.paddleGroup.enableBody = true;
        this.paddleGroup.physicsBodyType = Phaser.Physics.ARCADE;

        this.paddleGroup.add(this.paddleLeftSprite);
        this.paddleGroup.add(this.paddleRightSprite);
       
        this.paddleGroup.setAll('checkWorldBounds', true);
        this.paddleGroup.setAll('body.collideWorldBounds', true);
        this.paddleGroup.setAll('body.immovable', true);
    },
    
    initKeyboard: function () {
        this.paddleLeft_up = game.input.keyboard.addKey(Phaser.Keyboard.UP) || game.input.keyboard.addKey(Phaser.Keyboard.W);
        this.paddleLeft_down = game.input.keyboard.addKey(Phaser.Keyboard.DOWN)|| game.input.keyboard.addKey(Phaser.Keyboard.S);
        
        this.paddleRight_up = game.input.keyboard.addKey(Phaser.Keyboard.A);
        this.paddleRight_down = game.input.keyboard.addKey(Phaser.Keyboard.Z);
    },

    initSounds: function(){
        this.sndBallHit = game.add.audio(soundAssets.ballHitName);
        this.sndBallBounce = game.add.audio(soundAssets.ballBounceName);
        this.sndBallMissed = game.add.audio(soundAssets.ballMissedName);
    },
    
    startDemo: function () {
        //this.resetBall();
        this.enablePaddles(false);
        this.enableBoundaries(true);
        game.input.onDown.add(this.startGame, this);

        this.instructions.visible = true;
    },
    
    startGame: function () {
        game.input.onDown.remove(this.startGame, this);
        this.enablePaddles(true);
        this.enableBoundaries(false);
        this.resetBall();
        this.resetScores();
        this.hideTextFields();
    },
 
    resetBall: function () {
        console.log("RESET BALL");
        this.ballSprite.reset(game.world.centerX, (gameProperties.screenHeight/2));
        this.ballSprite.visible = false;
        //call start ball after a delay
        game.time.events.add(Phaser.Timer.SECOND * gameProperties.ballStartDelay, this.startBall, this);
    },
 
    enablePaddles: function (enabled) {
        this.paddleGroup.setAll('visible', enabled);
        this.paddleGroup.setAll('body.enable', enabled);
        
        this.paddleLeft_up.enabled = enabled;
        this.paddleLeft_down.enabled = enabled;
        this.paddleRight_up.enabled = enabled;
        this.paddleRight_down.enabled = enabled;

        this.paddleLeftSprite.y = game.world.centerY;
        this.paddleRightSprite.y = game.world.centerY;
    },

    enableBoundaries: function(enabled)
    {
        game.physics.arcade.checkCollision.left = enabled;
        game.physics.arcade.checkCollision.right = enabled;
    },

    startBall: function () {
        console.log("START BALL");
        this.ballVelocity = gameProperties.ballVelocity;
        this.ballReturnCount = 0;
        this.ballSprite.visible = true;   
        var randomAngle = game.rnd.pick(gameProperties.ballRandomStartingAngleRight.concat(gameProperties.ballRandomStartingAngleLeft));
        if (this.missedSide == 'right') {
            randomAngle = game.rnd.pick(gameProperties.ballRandomStartingAngleRight);
        } else if (this.missedSide == 'left') {
            randomAngle = game.rnd.pick(gameProperties.ballRandomStartingAngleLeft);
        }
        game.physics.arcade.velocityFromAngle(randomAngle, gameProperties.ballVelocity, this.ballSprite.body.velocity);
    },

    moveLeftPaddle: function () {
        if (this.paddleLeft_up.isDown)
        {
            this.paddleLeftSprite.body.velocity.y = -gameProperties.paddleVelocity;
        }
        else if (this.paddleLeft_down.isDown)
        {
            this.paddleLeftSprite.body.velocity.y = gameProperties.paddleVelocity;
        } else {
            this.paddleLeftSprite.body.velocity.y = 0;
        }

        if(this.paddleLeftSprite.body.y < gameProperties.paddleTopGap) {
            this.paddleLeftSprite.body.y = gameProperties.paddleTopGap;
        }
    },

    moveRightPaddle: function () {
       if(gameProperties.isVsAI)
       {
        this.moveRightPaddleAI();
       }
       else{
            if (this.paddleRight_up.isDown)
            {
                this.paddleRightSprite.body.velocity.y = -gameProperties.paddleVelocity;
            }
            else if (this.paddleRight_down.isDown)
            {
                this.paddleRightSprite.body.velocity.y = gameProperties.paddleVelocity;
            } 
            else {
                this.paddleRightSprite.body.velocity.y = 0;
            }

            if(this.paddleRightSprite.body.y < gameProperties.paddleTopGap) {
                this.paddleRightSprite.body.y = gameProperties.paddleTopGap;
            }
        }
    },

    moveRightPaddleAI: function()
    {
        //AI only moves when ball is moving toward it
        if(this.ballSprite.body.velocity.x <0)
        {
            this.paddleRightSprite.body.velocity.y = 0;
        }
        else
        {
            //compare paddle to AI
            if(this.paddleRightSprite.body.y > this.ballSprite.body.y + gameProperties.AIFreezeGap)
            {
                this.paddleRightSprite.body.velocity.y = -gameProperties.AIPaddleVelocity;
            }
            else if (this.paddleRightSprite.body.y < this.ballSprite.body.y - gameProperties.AIFreezeGap)
            {
                this.paddleRightSprite.body.velocity.y = gameProperties.AIPaddleVelocity;
            }
            else
            {
                this.paddleRightSprite.body.velocity.y = 0;
            }
        }
    },

    collideWithPaddle: function(ball, paddle){
        this.sndBallHit.play();
        var returnAngle;
        var segmentHit = Math.floor((ball.y - paddle.y)/gameProperties.paddleSegmentHeight);
        //every time you return 4 times in a row increase the velocity
        this.ballReturnCount++;

        if(this.ballReturnCount >= gameProperties.ballReturnCount) {
            this.ballReturnCount = 0;
            this.ballVelocity += gameProperties.ballVelocityIncrement;
        }

        //calculate which quadrant of the paddle was hit to determine return angle
        if (segmentHit >= gameProperties.paddleSegmentsMax) {
            segmentHit = gameProperties.paddleSegmentsMax - 1;
        } 
        else if (segmentHit <= -gameProperties.paddleSegmentsMax) {
            segmentHit = -(gameProperties.paddleSegmentsMax - 1);
        }
        //see if its on th elft or right side to decide which way to go
        if (paddle.x < gameProperties.screenWidth * 0.5) {
            returnAngle = segmentHit * gameProperties.paddleSegmentAngle;
            game.physics.arcade.velocityFromAngle(returnAngle, this.ballVelocity, this.ballSprite.body.velocity);
        } else {
            returnAngle = 180 - (segmentHit * gameProperties.paddleSegmentAngle);
            if (returnAngle > 180) {
                returnAngle -= 360;
            }
            
            game.physics.arcade.velocityFromAngle(returnAngle, this.ballVelocity, this.ballSprite.body.velocity);
        }
    },

    ballOutOfBounds: function(){
        this.sndBallMissed.play();
        if (this.ballSprite.x < 0) {
            this.missedSide = 'left';
            this.scoreRight++;
        } 
        else if (this.ballSprite.x > gameProperties.screenWidth) {
            this.missedSide = 'right';
            this.scoreLeft++;
        }
        this.updateScoreTextFields();
 
        if (this.scoreLeft >= gameProperties.scoreToWin) {
            this.winnerLeft.visible = true;
            this.startDemo();
        } 
        else if (this.scoreRight >= gameProperties.scoreToWin) {
            this.winnerRight.visible = true;
            this.startDemo();
        } 
        else {
            this.resetBall();
        }

        //this.resetBall();
    },

    resetScores: function () {
        this.scoreLeft = 0;
        this.scoreRight = 0;
        this.updateScoreTextFields();
    },
 
    updateScoreTextFields: function () {
        this.tf_scoreLeft.text = this.scoreLeft;
        this.tf_scoreRight.text = this.scoreRight;
    },

    hideTextFields: function () {
        this.instructions.visible = false;
        this.winnerLeft.visible = false;
        this.winnerRight.visible = false;
    },
};

// Initialise the Phaser framework by creating an instance of a Phaser.Game object and assigning it to a local variable called 'game'.
// The first two arguments are the width and the height of the canvas element. In this case 640 x 480 pixels. You can resize this in the gameProperties object above.
// The third argument is the renderer that will be used. Phaser.AUTO is used to automatically detect whether to use the WebGL or Canvas renderer.
// The fourth argument is 'gameDiv', which is the id of the DOM element we used above in the index.html file where the canvas element is inserted.
var game = new Phaser.Game(gameProperties.screenWidth, gameProperties.screenHeight, Phaser.AUTO, 'gameDiv');

// Here we declare and add a state to the game object.
// The first argument is the state name that will is used to switch between states
// The second argument is the object name that will used when a state name is called
game.state.add('main', mainState);

// We are using the 'main' state name as the argument to load our new state.
game.state.start('main');
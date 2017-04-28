var Main = function(game){

};

	Main.prototype = {

		create: function() {
	 
	    var me = this;
	 
	    //Set the background colour of the game
	    me.game.stage.backgroundColor = "34495f";
	 
	    //Declare assets that will be used as tiles
	    me.tileLetters = [
	        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k',
	        'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
	        'w', 'x', 'y', 'z'
	    ];
	 
	    //What colours will be used for our tiles?
	    me.tileColors = [
	        '#ffffff'
	    ];
	 	
	    me.wordsForGame = [
	    	"bench", "three", "over", "reason", "marked", "every", "excited", "suplex"
	    ];
	    // me.wordsForGame = [
	    // "rainbows", "panda", "unicorn", "huggers", "choice", "blanket", "city", "flowing"
	    // ];
	    //Set the width and height for the tiles
	    me.tileWidth = 70;
	    me.tileHeight = 70;
	 
	    //This will hold all of the tile sprites
	    me.tiles = me.game.add.group();
	 
	    me.gridWidth = 12;
	    me.gridHeight = 12;
	 	//instead lets initialize with gridwidth and gridlength

	    //Initialise tile grid, this array will hold the positions of the tiles
	    me.tileGrid=[];
	 	me.initTileGridArray();
	    //Keep a reference to the total grid width and height
	    me.boardWidth = me.tileGrid[0].length * me.tileWidth;
	    me.boardHeight = me.tileGrid.length  * me.tileHeight;
	 
	    //We want to keep a buffer on the left and top so that the grid
	    //can be centered
	    me.leftBuffer = (me.game.width - me.boardWidth) / 2;
	    me.topBuffer = (me.game.height - me.boardHeight) / 2;
	 
	    //Create a random data generator to use later
	    var seed = Date.now();
	    me.random = new Phaser.RandomDataGenerator([seed]);
	 
	    //Set up some initial tiles and the score label
	    //me.initTiles();
	    me.initWordGrid();
	    me.guessing = false;
		me.currentWord = [];
		me.correctWords = [];
	 	
		//on click down
	 	me.game.input.onDown.add(function(){me.guessing = true;}, me);
	 	//on click up
		me.game.input.onUp.add(function(){me.guessing = false;}, me);

		//Set the width and height for the tiles
		me.tileWidth = 150;
		me.tileHeight = 150;
		 
		//A buffer for how much of the tile activates a select
		me.selectBuffer = me.tileWidth / 8;

		//Keep track of the users score
		me.score = 0;
		me.scoreBuffer = 0;

		me.createScore();

		me.remainingTime = 6000;
		me.fullTime = 6000;

		//me.createTimer();
 
		// me.gameTimer = game.time.events.loop(100, function(){
		//     me.updateTimer();
		// });
	},

	createTimer: function(){
	 
	    var me = this;
	 
	    me.timeBar = me.game.add.bitmapData(me.game.width, 50);
	 
	    //make white and have a blue background
	    me.timeBar.ctx.rect(0, 0, me.game.width, 50);
	    me.timeBar.ctx.fillStyle = '#ffffff';
	    me.timeBar.ctx.fill();
	 
	    me.timeBar = me.game.add.sprite(0, 0, me.timeBar);
	    me.timeBar.cropEnabled = true;
	 
	},
	 
	updateTimer: function(){
	 
	    var me = this;
	 
	    me.remainingTime -= 10;
	 
	    var cropRect = new Phaser.Rectangle(0, 0, (me.remainingTime / me.fullTime) * me.game.width, me.timeBar.height);
	    me.timeBar.crop(cropRect);
	 
	},

	// initTiles: function(){
	 
	//     var me = this;
	 
	//     //Loop through each column in the grid
	//     for(var i = 0; i < me.tileGrid.length; i++){
	//  		me.tileGrid[i]=[];
	//         //Loop through each position in a specific column, starting from the top
	//         for(var j = 0; j < me.tileGrid.length; j++){
	 
	//             //Add the tile to the game at this grid position
	//             var tile = me.addTile(i, j);
	 
	//             //Keep a track of the tiles position in our tileGrid
	//             me.tileGrid[i][j] = tile;
	 
	//         }
	//     }
	 
	// },
	initTileGridArray: function()
	{
		var me = this;
		   //Loop through each column in the grid
	    for(var i = 0; i < me.gridHeight; i++){
	 		me.tileGrid[i] = [];

	        //Loop through each position in a specific column, starting from the top
	        for(var j = 0; j < me.gridWidth; j++){
	 
	           me.tileGrid[i][j]=0;
	        }
	    }
	},
	
	//add something here so that when it fails overlap, then fails regular fit, it tries random fit again instead of going back to overlap
	initWordGrid: function()
	{
		//chose the first word
		var me = this;
		var i =0;
		var counter = 0;
		while(i < me.wordsForGame.length && counter<2500)
		{
			var word = me.wordsForGame[i];
			
			var success=false;
			while(!success && counter < 2500)
			{
				var startX;
				var startY;
				var direction
				//if you arent going down then start far enough left to fit the word
				//here we want to force some overlaps if i!=0
				//so search the grid for an overlapping letter, then see if we have space to put it in and if we dont then choose randomly
				//CHOOSING FOR OVERLAP

			//go through each letter to look for an overlap, then choose a direction, reverse engineer the start location, check for conflict and add it
				for(var a = 0; a<word.length; a++)
				{
					if(success)
					{
						break;
					}
					for(var b=0; b<me.tileGrid.length; b++)
					{
						if(success)
						{
							break;
						}	
						for(var c=0; c<me.tileGrid[b].length; c++)
						{
							if(success)
							{
								break;
							}			
							if(word[a] == me.tileGrid[b][c])
							{
								//try to fit at direction 1, then 0, then 2
								for(var d = 0; d<3; d++)
								{
									var startLoc = me.startPointFromOverlapPoint(a,d,b,c);
									startX = startLoc[0];
									startY = startLoc[1];
									console.log("SL X: " + startLoc[0]);
									console.log("SL Y: " + startLoc[1]);
									direction = d;
									if(me.doesWordFitInDirection(word,direction,startX,startY))
									{
										console.log("found overlap fit " + word + " X: " + startX +" Y: " + startY);
										success=true;
										break;
									}
								}
							}
						}
					}
				}
				//CHOOSING RANDOMLY
				//0 = down, 1 = diagonal, 2= right
				if(!success)
				{
					console.log("COULD NOT FIND OVERLAP FOR: " + word);

					direction = me.random.integerInRange(0,2);
					//choose starting location randomly. see if any tiles conflict
					if(direction!=0)
					{
						startX = me.random.integerInRange(0,(me.tileGrid[0].length-word.length-1));
					}
					//else start anywhere on X
					else
					{
						startX = me.random.integerInRange(0, me.tileGrid[0].length-1);
					}
					//if you arent right start far enough up to fit the word
					if(direction!=2)
					{
						startY = me.random.integerInRange(0,(me.tileGrid.length-word.length-1));
					}
					//else start anywhere on Y
					else
					{
						startY = me.random.integerInRange(0, me.tileGrid.length-1);
					}
					
					if(me.doesWordFitInDirection(word,direction,startX,startY))
					{
						success=true;
					}
					else
					{
						counter++;
					}
				}
			}
			//we found a word that fits in a certain place in the grid
			if(!success)
			{
				console.log("no successful fit");
			}
			i++;
			me.addWordToTileGrid(word,direction,startX,startY);
			//then the next thing we should do is find a word with an overlapping letter and see if it will fit anywhere

			//so choose a word, find overlapping possibilities based on the location of the overlapping tile using both directions
		}
	},

	startPointFromOverlapPoint: function(pointInWord, direction, overlapX, overlapY)
	{
		var startX;
		var startY;
		if(direction == 0)
		{
			startX = overlapX;
			startY = overlapY - pointInWord;
		}
		if(direction == 1)
		{
			startX = overlapX - pointInWord;
			startY = overlapY - pointInWord;
		}
		if(direction == 2)
		{
			startX = overlapX - pointInWord;
			startY = overlapY;
		}
		var arr = new Array(startX, startY);
		return arr;

	},

	doesWordFitInDirection: function(word, direction, startX, startY)
	{
		var me = this;
		for(var w = 0; w<word.length; w++)
		{
			var posX = startX;
			var posY = startY;
			if(direction==0)
			{
				posX = startX;
				posY = startY+w;
			}
			if(direction==1)
			{
				posX = startX+w;
				posY = startY+w;
			}
			if(direction==2)
			{
				posX=startX+w;
				posY=startY;
			}
			if(me.hasConflict(word[w],posX,posY))
			{
				return false;
			}
		}
		return true;
	},

	addWordToTileGrid: function(word, direction, startX, startY)
	{
		console.log("ADDING WORD: " + word + " " + startX + " " +startY);
		var me = this;
		for(var w = 0; w<word.length; w++)
		{
			var posX = startX;
			var posY = startY;
			if(direction==0)
			{
				posX = startX;
				posY = startY+w;
			}
			if(direction==1)
			{
				posX = startX+w;
				posY = startY+w;
			}
			if(direction==2)
			{
				posX=startX+w;
				posY=startY;
			}
			me.tileGrid[posX][posY] = word[w];
			me.addTile(posX,posY,word[w]);
		}
	},

	hasConflict: function(letter, x, y)
	{
		var me = this;
		if(x>=me.tileGrid.length || x<0)
		{
			console.log("OFF GRID X");
			return true;
		}
		if(y>=me.tileGrid[0].length || y<0)
		{
			console.log("OFF GRID Y");
			return true;
		}

		// if(letter == me.tileGrid[x][y])
		// {
		// 	//console.log("MATCHING LETTER");
		// }
		if(me.tileGrid[x][y]!=0 && me.tileGrid[x][y]!=letter)
		{
			//console.log("CONFLICT: " + "X: " + x + "Y: " + y);
			return true;
		}
		return false;
	},

	addTile: function(x, y, letter){
	 
	    var me = this;
	 
	    //Choose a random tile to add
	    var tileLetter = letter;//me.tileLetters[me.random.integerInRange(0, me.tileLetters.length - 1)];
	    var tileColor = me.tileColors[me.random.integerInRange(0, me.tileColors.length - 1)];
	    var tileToAdd = me.createTile(tileLetter, tileColor);   
	 
	    //Add the tile at the correct x position, but add it to the top of the game (so we can slide it in)
	    var tile = me.tiles.create(me.leftBuffer + (x * me.tileWidth) + me.tileWidth / 2, 0, tileToAdd);
	 
	    //Animate the tile into the correct vertical position
	    me.game.add.tween(tile).to({y:me.topBuffer + (y*me.tileHeight+(me.tileHeight/2))}, 500, Phaser.Easing.Linear.In, true)
	 
	    //Set the tiles anchor point to the center
	    tile.anchor.setTo(0.5, 0.5);
	 
	    //Keep track of the type of tile that was added
	    tile.tileLetter = tileLetter;
	 
	    return tile;
	 
	},

	createTile: function(letter, color){
	 
	    var me = this;
	 
	    var tile = me.game.add.bitmapData(me.tileWidth, me.tileHeight);
	 
	    tile.ctx.rect(5, 5, me.tileWidth - 5, me.tileHeight - 5);
	    tile.ctx.fillStyle = color;
	    tile.ctx.fill();
	 
	    tile.ctx.font = '30px Arial';
	    tile.ctx.textAlign = 'center';
	    tile.ctx.textBaseline = 'middle';
	    tile.ctx.fillStyle = '#fff';
	    if(color == '#ffffff'){
	        tile.ctx.fillStyle = '#000000';
	    }
	    tile.ctx.fillText(letter, me.tileWidth / 2, me.tileHeight / 2);
	 
	    return tile;
	 
	},

	incrementScore: function(){
 
    var me = this;
 
    me.score += 1;   
    me.scoreLabel.text = me.score;      
 
	},
	 
	createScore: function(){
	 
	    var me = this;
	    var scoreFont = "100px Arial";
	 
	    me.scoreLabel = me.game.add.text(me.game.world.centerX, me.topBuffer + 10 + me.tileGrid.length * me.tileHeight, "0", {font: scoreFont, fill: "#ffffff", stroke: "#535353", strokeThickness: 15}); 
	    me.scoreLabel.anchor.setTo(0.5, 0);
	    me.scoreLabel.align = 'center';
	 
	},

	update: function() {
    
    var me = this;
 
    if(me.guessing){
 
        //Get the location of where the pointer is currently
        var hoverX = me.game.input.x;
        var hoverY = me.game.input.y;
 
        //Figure out what position on the grid that translates to
        var hoverPosX = Math.floor((hoverX - me.leftBuffer)/me.tileWidth);
        var hoverPosY = Math.floor((hoverY - me.topBuffer)/me.tileHeight);
 
        //Check that we are within the game bounds
        if(hoverPosX >= 0 && hoverPosX < me.tileGrid[0].length && hoverPosY >= 0 && hoverPosY < me.tileGrid.length){
 
            //Grab the tile being hovered over
            var hoverTile = me.tileGrid[hoverPosX][hoverPosY];
            console.log("X" + hoverPosX);
            console.log("Y" + hoverPosY);
            //Figure out the bounds of the tile
            var tileLeftPosition = me.leftBuffer + (hoverPosX * me.tileWidth);
            var tileRightPosition = me.leftBuffer + (hoverPosX * me.tileWidth) + me.tileWidth;
            var tileTopPosition = me.topBuffer + (hoverPosY * me.tileHeight);
            var tileBottomPosition = me.topBuffer + (hoverPosY * me.tileHeight) + me.tileHeight;
 
            //If the player is hovering over the tile set it to be active. The buffer is provided here so that the tile is only selected
            //if the player is hovering near the center of the tile
            if(!hoverTile.isActive && hoverX > tileLeftPosition + me.selectBuffer && hoverX < tileRightPosition - me.selectBuffer 
                && hoverY > tileTopPosition + me.selectBuffer && hoverY < tileBottomPosition - me.selectBuffer){
 				
                //Set the tile to be active
                hoverTile.isActive = true;
 
                console.log(hoverTile.tileLetter);
 
                //Push this tile into the current word that is being built
                me.currentWord.push(hoverTile);
            }
 
        }
 
    }
    else {
 
        if(me.currentWord.length > 0){
 
            var guessedWord = '';
 
            //Build a string out of all of the active tiles
            for(var i = 0; i < me.currentWord.length; i++){
                guessedWord += me.currentWord[i].tileLetter;
                me.currentWord[i].isActive = false;
            }
 
            //Check to see if this word exists in our dictionary
            if(me.game.cache.getText('dictionary').indexOf(' ' + guessedWord + ' ') > -1 && guessedWord.length > 1){

				if(me.correctWords.indexOf(guessedWord) == -1){
				 
				    console.log("correct!");
				 
				    me.scoreBuffer += 10 * guessedWord.length;
				 
				    //Add this word to the already guessed word
				    me.correctWords.push(guessedWord);
				 
					}
 
                } 
 
            } 
            else {
                //console.log("incorrect!");
            }
 
            //Reset the current word
            me.currentWord = [];
 
        }

	 	if(me.scoreBuffer > 0){
	    me.incrementScore();
	    me.scoreBuffer--;
		}


		if(me.remainingTime < 1){
	    me.game.state.restart();
		} 

},

	gameOver: function(){
		this.game.state.start('GameOver');
	}

};
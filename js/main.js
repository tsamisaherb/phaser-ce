var game = new Phaser.Game(700, 700, Phaser.AUTO, '', { preload: preload, create: create, update: update });

//Declare assets that will be used as tiles
tileLetters = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k',
    'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
    'w', 'x', 'y', 'z'
];

//What colours will be used for our tiles?
tileColors = [
    '#ffffff'
];

selectedColor = '#0000ff';
// me.wordsForGame = [
// "rainbows", "panda", "unicorn", "huggers", "choice", "blanket", "city", "flowing"
// ];	
wordsForGame = [
	"bench", "three", "over", "reason", "marked", "every", "excited", "suplex", "computer", "email", "paintball"
];

var wordTexts;

var gridWidth = 12;
var gridHeight = 12;
//Set the width and height for the tiles
var tileWidth;
var tileHeight;

var tileGrid=[];

var boardWidth;
var boardHeight;

var leftBuffer;
var topBuffer;

var guessing = false;
var currentWord = [];
var correctWords = [];

var selectBuffer;
var score = 0;
var scoreBuffer = 0;
var tiles;

var lastSelectedTile;
function preload()
{
	game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

}

function create() 
{

	//Set the background colour of the game
	game.stage.backgroundColor = "34495f";
	//This will hold all of the tile sprites
	tiles = game.add.group();
	wordTexts = game.add.group();
	//instead lets initialize with gridwidth and gridlength

	//Initialise tile grid, this array will hold the positions of the tiles
	initWordTexts();
	initTileGridArray();
	//Keep a reference to the total grid width and height
	boardWidth = tileGrid[0].length * tileWidth;
	boardHeight = tileGrid.length  * tileHeight;

	//We want to keep a buffer on the left and top so that the grid
	//can be centered
	leftBuffer = (game.width - boardWidth) / 2;
	topBuffer = (game.height - boardHeight) / 2;

	//Set up some initial tiles and the score label
	initWordGrid();
	addRestOfLetters();	
	// //on click down
	// game.input.onDown.add(function(){onClickDown();}, this);
	// //on click up
	// game.input.onUp.add(function(){onClickUp();}, this);
	 
	//A buffer for how much of the tile activates a select
	selectBuffer = tileWidth / 8;
}

// function onClickDown()
// {
// 	console.log("CLICK DOWN");
// }

function initWordTexts()
{
	//console.log(wordsForGame.length);
	for(var i=0; i<wordsForGame.length; i++)
	{
		var textStyle = { 
			font: "24px Arial", fill: "#ffffff", wordWrap: true, align: "center"};
		var text = game.add.text(game.width - 90, 100+(i*50), wordsForGame[i], textStyle);
	}
}


function initTileGridArray()
{
	   //Loop through each column in the grid
    for(var i = 0; i < gridHeight; i++){
 		tileGrid[i] = [];

        //Loop through each position in a specific column, starting from the top
        for(var j = 0; j < gridWidth; j++){
 
           tileGrid[i][j]=0;
        }
    }
}



//add something here so that when it fails overlap, then fails regular fit, it tries random fit again instead of going back to overlap
function initWordGrid()
{
	//chose the first word
	tileWidth = (game.width - 100)/gridWidth;
	tileHeight = game.height/gridHeight;

	var i =0;
	var counter = 0;
	while(i < wordsForGame.length && counter<2500)
	{
		var word = wordsForGame[i];
		
		var success=false;
		while(!success && counter < 2500)
		{
			var startX;
			var startY;
			var direction
	
		//go through each letter to look for an overlap, then choose a direction, reverse engineer the start location, check for conflict and add it
			for(var a = 0; a<word.length; a++)
			{
				if(success)
				{
					break;
				}
				for(var b=0; b<tileGrid.length; b++)
				{
					if(success)
					{
						break;
					}	
					for(var c=0; c<tileGrid[b].length; c++)
					{
						if(success)
						{
							break;
						}			
						if(word[a] == tileGrid[b][c])
						{
							//try to fit at direction 1, then 0, then 2
							for(var d = 0; d<3; d++)
							{
								var startLoc = startPointFromOverlapPoint(a,d,b,c);
								startX = startLoc[0];
								startY = startLoc[1];
								//console.log("SL X: " + startLoc[0]);
								//console.log("SL Y: " + startLoc[1]);
								direction = d;
								if(doesWordFitInDirection(word,direction,startX,startY))
								{
									//console.log("found overlap fit " + word + " X: " + startX +" Y: " + startY);
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
				//console.log("COULD NOT FIND OVERLAP FOR: " + word);

				direction = game.rnd.integerInRange(0,2);
				//choose starting location randomly. see if any tiles conflict
				if(direction!=0)
				{
					startX = game.rnd.integerInRange(0,(tileGrid[0].length-word.length-1));
				}
				//else start anywhere on X
				else
				{
					startX = game.rnd.integerInRange(0, tileGrid[0].length-1);
				}
				//if you arent right start far enough up to fit the word
				if(direction!=2)
				{
					startY = game.rnd.integerInRange(0,(tileGrid.length-word.length-1));
				}
				//else start anywhere on Y
				else
				{
					startY = game.rnd.integerInRange(0, tileGrid.length-1);
				}
				
				if(doesWordFitInDirection(word,direction,startX,startY))
				{
					success=true;
				}
				else
				{
					counter++;
				}
			}
		}
		if(!success)
		{
			//console.log("no successful fit");
		}
		i++;
		addWordToTileGrid(word,direction,startX,startY);
	}
}
//where the word will start given it overlaps at a certain point
function startPointFromOverlapPoint(pointInWord, direction, overlapX, overlapY)
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

}
//does a word have conflicts in a certain direction
function doesWordFitInDirection(word, direction, startX, startY)
{
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
		if(hasConflict(word[w],posX,posY))
		{
			return false;
		}
	}
	return true;
}
//add the word
function addWordToTileGrid(word, direction, startX, startY)
{
	//console.log("ADDING WORD: " + word + " " + startX + " " +startY);
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
		tileGrid[posX][posY] = word[w];
		//addTile(posX,posY,word[w]);
	}
}
//check for a conflict of a certain letter in a certain point
function hasConflict(letter, x, y)
{
	if(x>=tileGrid.length || x<0)
	{
		//console.log("OFF GRID X");
		return true;
	}
	if(y>=tileGrid[0].length || y<0)
	{
		//console.log("OFF GRID Y");
		return true;
	}

	if(tileGrid[x][y]!=0 && tileGrid[x][y]!=letter)
	{
		//console.log("CONFLICT: " + "X: " + x + "Y: " + y);
		return true;
	}
	return false;
}

function addTile(x, y, letter){
 
 
    //Choose a random tile to add
    var tileLetter = letter;//me.tileLetters[me.random.integerInRange(0, me.tileLetters.length - 1)];
    var tileColor = tileColors[game.rnd.integerInRange(0, tileColors.length - 1)];
    var tileToAdd = createTile(tileLetter, tileColor);   
 	//console.log(tileToAdd.ctx.fillStyle);
    //Add the tile at the correct x position, but add it to the top of the game (so we can slide it in)
    var tile = tiles.create((x * tileWidth) + tileWidth / 2, (y*tileHeight)+tileHeight/2, tileToAdd);

 	tile.inputEnabled = true;
    //Animate the tile into the correct vertical position
   // game.add.tween(tile).to({y:topBuffer + (y*tileHeight+(tileHeight/2))}, 500, Phaser.Easing.Linear.In, true)
 
    //Set the tiles anchor point to the center
    tile.anchor.setTo(0.5, 0.5);
 
    //Keep track of the type of tile that was added
    tile.tileLetter = tileLetter;
 	tile.events.onInputDown.add(listener, this);
    return tile;
 
}

function listener(sprite, pointer)
{
	console.log("This Letter is: " + sprite.tileLetter)
}

function createTile(letter, color){
    var tile = game.add.bitmapData(tileWidth, tileHeight);
 	
 	tile.ctx.beginPath();
    tile.ctx.rect(5, 5, tileWidth - 5, tileHeight - 5);
    tile.ctx.fillStyle = '#ff0000';
    tile.ctx.fill();
 	
    tile.ctx.font = '30px Arial';
    tile.ctx.textAlign = 'center';
    tile.ctx.textBaseline = 'middle';
    tile.ctx.fillStyle = '#fff';
    tile.ctx.fillText(letter, tileWidth / 2, tileHeight / 2);
 	
    return tile;
 
}	

function addRestOfLetters()
{
	//Loop through each column in the grid
    for(var i = 0; i < gridHeight; i++){
 		

        //Loop through each position in a specific column, starting from the top
        for(var j = 0; j < gridWidth; j++){
 
           if(tileGrid[i][j] == 0)
           {
           	addRandomLetterAtPosition(i,j);
           }
           else
           {
           	addTile(i,j,tileGrid[i][j]);
           }
        }
    }
}

function addRandomLetterAtPosition(x,y)
{
	var letter = tileLetters[game.rnd.integerInRange(0, tileGrid.length-1)];
	addTile(x,y,letter);
}
var doOnce = false;
function update() 
{
	//if(!doOnce){
	for(var i = 0; i < gridHeight; i++)
	{
 		//Loop through each position in a specific column, starting from the top
        for(var j = 0; j < gridWidth; j++){

           tileUpdate(tileObjFromGrid(i,j));
        }
    }
//} doOnce=true;
}

function tileNumFromGrid(posX, posY)
{
	return posY*gridWidth+posX;
}
function tileObjFromGrid(posX,posY)
{
	return tiles.getAt(tileNumFromGrid(posX,posY));
}
function selectTile(sprite)
{
	//check if its different from last selected tile, if not, return
	if(sprite == lastSelectedTile)
	{
		console.log("Chose Last Tile Again");
		
	}
	else
	{
		lastSelectedTile = sprite;
		sprite.tint = '#0000ff';
		console.log('Selected tile: ' + sprite.tileLetter);
	}
	//compare it to the string

	//sprite.tint = '#0000ff'
	//add to working string

	//do a visual reaction
}

function tileUpdate(sprite)
{
	if (game.input.activePointer.isDown && sprite.input.checkPointerOver(game.input.activePointer)) 
	{
		//console.log(sprite.tileLetter);
		selectTile(sprite);
	}
}


function onClickUp()
{
	console.log("Click Up");
	endedSelection();
}

function endedSelection()
{
	//unselect letters
	//check against words in list
	//clear current word array
}
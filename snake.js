var foodPosition = [];
var snakePosition = [];
var isGamePaused = true;
var setIntervalId;
//the direction at the beginning is set to up by default
var direction = 'up';
var isGameOver = false;
var score = 0;
var isGameResuming = false;

// dynamically generating the board, and each cell has a id in the form of '0117' or '1218'
// the id is always 4 digits
function initBoard() {
    var board = getElement('gameBoard');
    for(var i = 0; i < 20; i++) {
        var rowDiv = document.createElement('div');
        rowDiv.className = 'row';
        for(var j = 0; j < 20; j++) {
            var div = document.createElement('div');
            div.id = (paddingZero(j) + paddingZero(i)).toString();
            div.className = 'cell';
            rowDiv.appendChild(div);
        }
        board.appendChild(rowDiv);
    }

    return true;
}

// paint the food
function paintFood() {
    // get the new food position
    do {
        foodPosition = [generatingRandomCoordinate(), generatingRandomCoordinate()];
    }
    while(isFoodPositionTaken()); // check if the new food position is already taken by the snake

    paintCell(foodPosition, 'red');

}

// init the snake
function initSnake() {
    var headPositionX = generatingRandomCoordinate();
    var headPositionY = generatingRandomCoordinate();

    // make sure the snake is not out of bound or to close to the upper bound which makes the snake dead at the beginning
    while(parseInt(headPositionY) > 17 || parseInt(headPositionY) === 0) {
        headPositionY = generatingRandomCoordinate();
    }

    // calculate the full position for the initial snake
    snakePosition = [[headPositionX, headPositionY], [headPositionX, stringNumAdd(headPositionY, 1)], [headPositionX, stringNumAdd(headPositionY, 2)]];
    paintSnake(snakePosition);
}


// check if the new food position is taken by the snake
function isFoodPositionTaken() {
    for(var i = 0; i < snakePosition.length; i++) {
        var p = snakePosition[i];
        if(p[1] === foodPosition[1] && p[0] === foodPosition[0]) {
            return true;
        }
    }

    return false;
}

// add a number with a string number 1 + '2' -> '3'
function stringNumAdd(str, num) {
    var tempNum = parseInt(str) + num;
    return paddingZero(tempNum);
}

// add padding 0's in front of the number if the number is single digit and convert it to string (2 -> '02', 11 -> '11')
function paddingZero(num) {
    if(num.toString().length < 2) {
        return '0' + num;
    }
    return num.toString();
}

// paint the whole snake
function paintSnake(position) {
    position.forEach(function (p) {
        paintCell(p, 'blue');
    });
}

// paint single cell to a particular color, blue for snake, red for food, and empty for deleting tail/food
function paintCell(cellPosition, color) {
    var cell = getElement(cellPosition[0] + cellPosition[1]);
    cell.style.backgroundColor = color;
}

// generates random number between and return their string format 1 -> '01', 15 -> '15'
function generatingRandomCoordinate() {
    var rt = Math.floor(Math.random() * 20);
    return paddingZero(rt);
}

// add a bunch of listeners
function addListener() {
    window.addEventListener('keydown', function (event) {
        switch(event.keyCode) {
            case 37:
                if(direction !== 'right') {
                    direction = 'left';
                }
                break;
            case 38:
                if(direction !== 'down') {
                    direction = 'up';
                }
                break;
            case 39:
                if(direction !== 'left') {
                    direction = 'right';
                }
                break;
            case 40:
                if(direction !== 'up') {
                    direction = 'down';
                }
                break;
            case 32: // press space to start, pause, resume or restart the game
                // when the game is not over, start, pause or resume the game
                if(!isGameOver) {
                    // if use keeps hitting space when the timer is counting down, it should be ignored
                    isGamePaused  = !isGameResuming && !isGamePaused;
                    if(isGamePaused) {
                        pauseGame();
                        window.clearInterval(setIntervalId);
                    }else if(!isGameResuming) { // if use keeps hitting space when the timer is counting down, it should be ignored
                        resumeGame();
                    }
                }else { // when the game is over, restart the game
                    restartGame();
                }
                break;
            default:
                break;
        }
    });
}

// init the game when page loads
function init() {
    initBoard();
    initSnake();
    paintFood();
    addListener();
}

function resetVariables() {
    // reset all global variables
    foodPosition = [];
    snakePosition = [];
    isGamePaused = true;
    direction = 'up';
    isGameOver = false;
    score = 0;
    isGameResuming = false;
}

function clearSnake() {
    snakePosition.forEach(function (position) {
        paintCell(position, '');
    });
}

function clearFood() {
    paintCell(foodPosition, '');
}


// handle game over situation
function endGame() {
    // stop the game by stopping the time interval
    window.clearInterval(setIntervalId);
    // show over lay to show user the game is over
    getElement('overLay').style.display = 'block';
    // set isGameOver to true
    isGameOver = true;
    // show your score on the overlay
    getElement('gameOverScore').innerHTML = score;
}

// check if the snake hits the wall
function isOutOfBoundary(headPosition) {
    if(headPosition[0] < 0 || headPosition[0] > 19 || headPosition[1] < 0 || headPosition[1] > 19) {
        endGame();
        return true;
    }
    return false;
}

// check if the new head will hit the snake body
function doesHitSnake(headPosition) {
    snakePosition.forEach(function(position) {
        if(headPosition[0] === position[0] && headPosition[1] === position[1]) {
            endGame();
            return true;
        }
    });

    return false;
}

// pause the game
function pauseGame () {
    // show the pause game over lay
    getElement('beforeGameOverlay').style.display = 'block';
    // reset the count down timer to 3
    getElement('countDown').innerHTML = 3;
    // hide the count down timer by default, it shows up when user press space in resumeGame()
    getElement('countDown').style.visibility = 'hidden';
    clearInterval(setIntervalId);
}

// clear the overlay before starting or resuming the game
function resumeGame() {
    isGameResuming = true;
    // show the count down
    getElement('countDown').style.visibility = 'visible';
    // set a timer to count down
    var intervalId = setInterval(function () {
        getElement('countDown').innerHTML = parseInt(getElement('countDown').innerHTML) - 1;
    }, 1000);

    // wait for the count down is over and resume the game again
    setTimeout(function () {
        getElement('beforeGameOverlay').style.display = 'none';
        // clear the setInterval just created
        clearInterval(intervalId);
        startGame();
    }, 3000);
}

function restartGame() {
    // clear game over overlay
    getElement('overLay').style.display = 'none';
    // clear snake, clear food
    clearSnake();
    clearFood();
    // reset global variables
    resetVariables();
    // repaint snake and food
    initSnake();
    paintFood();
    getElement('score').innerHTML = 0;
    // restart the game
    pauseGame();
    resumeGame();
}

//helper function to wrap dom function
function getElement(id) {
    return document.getElementById(id);
}

function startGame() {
    isGameResuming = false;
    isGamePaused = false;
    setIntervalId = setInterval(function () {

        var headPosition = snakePosition[0];

        // if head does not meet food, delete tail
        if(headPosition[0] !== foodPosition[0] || headPosition[1] !== foodPosition[1]) {
            //get rid of the last one;
            var tailPosition = snakePosition.pop();
            paintCell(tailPosition, '');
        }else {
            // if head meets food, keep the tail and paint a new food
            paintFood();
            // update score
            score += 5;
            getElement('score').innerHTML = score;
        }

        var newHeadPosition;

        switch(direction) {
            case 'up':
                newHeadPosition = [snakePosition[0][0], stringNumAdd(snakePosition[0][1], -1)];
                break;
            case 'down':
                newHeadPosition = [snakePosition[0][0], stringNumAdd(snakePosition[0][1], 1)];
                break;
            case 'left':
                newHeadPosition = [stringNumAdd(snakePosition[0][0], -1), snakePosition[0][1]];
                break;
            case 'right':
                newHeadPosition = [stringNumAdd(snakePosition[0][0], 1), snakePosition[0][1]];
                break;
            default:
                break;
        }
        // check if the new head will get out of boundary or bite itself
        if(!isOutOfBoundary(newHeadPosition) && !doesHitSnake(newHeadPosition)) {
            snakePosition.unshift(newHeadPosition);
            paintCell(newHeadPosition, 'blue');
        }
    }, 100);
}


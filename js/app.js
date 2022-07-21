"use strict";


var BOMB  = '💣'
var FLAG  = '🚩'
var LIVES = 3

var gBoardSize = {SIZE:4,BOMBS:2}
var gBoard     = []
var gBombs     = []

var gStartTime  = 1
var gMoveCount  = 0
var gGameInterval
var gTimeout

var gTotalMarkes = 0
var gGisplayTime = 0

function initGame(){

    LIVES = 3

    clearInterval (gGameInterval   )
    clearTimeout  (gTimeout        )
    restartTime   ()
    changeSmile   ()
    livesCounter  ()

    gGameInterval = null
    gMoveCount    = 0
    gBoard        = []
    gBombs        = []

    gBoard = buildBoard     ()
    gBoard = insertNeighbors()

    renderBoard             (gBoard)
}

function makePairs(){
    var pairs = []
    for(var i=0; i<gBoardSize.SIZE; i++ ){
        for(var j=0; j<gBoardSize.SIZE;j++) {
            pairs.push([i,j])
        }
    }
    return pairs
}


function getMines(numBombs){

    var pairs = makePairs()
    for (var i = 0; i< numBombs; i++){
        var rand = drawNum(pairs)
        gBombs.push(rand)
    }
}

function checkIfBomb(i,j){
    for (var n = 0; n < gBombs.length;n++){
        if ((gBombs[n][0] === i) && gBombs[n][1] === j){
            return true
        }
    }
    return false
}


function buildBoard() {

    var board = createMat(gBoardSize.SIZE, gBoardSize.SIZE)
    getMines(gBoardSize.BOMBS)

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var isMineRan = checkIfBomb(i,j)? true: false
            var cell = {isMine : isMineRan,isMarked:false, neig:0,isFlag:false};
            board[i][j] = cell;
        }
    }

    return board;
}


function onRightCellClicked(elCell,i,j){
    gBoard[i][j].isFlag = true
    elCell.innerHTML = FLAG
    return false
}


function openAll(){
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            gBoard[i][j].isMarked = true
        }
    }
}


function changeSmile(path = 'img/smile.jpg'){
    var smile = document.querySelector('.smile')
    smile.src = path
}


function onCellClicked(elCell,i,j){


    if (gBoard[i][j].isMine){
        if (LIVES === 1){
            gBoard[i][j].isMarked = true
            openAll      ()
            clearInterval(gGameInterval)
            renderBoard  (gBoard)
            alert        ('U lose')
            changeSmile  ('img/explodejpg.jpg')
            gTimeout = setTimeout(initGame,2000)
        } else {
            LIVES --
            livesCounter()
        }


    } else if(gBoard[i][j].isFlag) {
        gBoard[i][j].isFlag = !gBoard[i][j].isFlag
    } else {
        gBoard[i][j].isMarked = true
        if (gBoard[i][j].neig === 0) {
            // gTotalMarkes = countToalalMarked()
            findNextCells(i, j)}

    }
    gMoveCount ++
    if (gMoveCount === 1) startTimer()
    renderBoard(gBoard)

    if (countToalalMarked() === (gBoardSize.SIZE**2 - gBoardSize.BOMBS)){
        clearInterval(gGameInterval)
        alert        ('WON')
        openAll      ()
        changeSmile  ('img/wining.jpg')
        getBestScore (gGisplayTime)
        gTimeout = setTimeout(initGame,2000)
    }
}



function addDifficulties(elDiff){

    var diffMe = parseInt(elDiff.className)
    gBoardSize.SIZE = diffMe
    switch(gBoardSize.SIZE){
        case 4:
            gBoardSize.BOMBS = 2
            break
        case 8:
            gBoardSize.BOMBS = 12
            break
        case 12:
            gBoardSize.BOMBS = 30
            break
    }
    initGame() 
}



function findNextCells(cellI, cellJ) {
    
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= gBoard[i].length) continue;

            if ((!gBoard[i][j].isMine) && (!gBoard[i][j].isFlag) ){
                gBoard[i][j].isMarked = true
            }
        }
    }

}


function countToalalMarked(){

    var TotalMarkes = 0
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMarked) TotalMarkes++
        }
    }
    return TotalMarkes
}


function renderBoard(board) {

    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < board[0].length; j++) {

            var marked =  (!board[i][j].isMarked) ?'noMark' : 'isMarked';
            var neig   = board[i][j].neig ;

            var condIsmark = (board[i][j].isMarked && (!board[i][j].isFlag))
            var condIsBomb = (board[i][j].isMine && board[i][j].isMarked && !board[i][j].isFlag)
            var show       =  condIsBomb? BOMB: condIsmark ? neig : board[i][j].isFlag? FLAG:  condIsmark ? neig : ' '
            

            if ((show === 0) && (!board[i][j].isFlag)) show = ' '

            strHTML += `\t<td data-neig="${neig}" class="cell ${marked} " onclick="onCellClicked(this,${i}, ${j})" oncontextmenu="javascript:onRightCellClicked(this,${i}, ${j});return false;">${show}\n`;
            strHTML += '\t</td>\n';
        }
        strHTML += '</tr>\n';
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}


function insertNeighbors(){

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var count = countNeighbors(i, j, gBoard)
            gBoard[i][j].neig = count;
        }
    }
    return gBoard
}

var restartTime = () => document.querySelector('.timer span').innerHTML = '0.0'


function setTimer(){

    var diffTime = (Date.now() - gStartTime)/1000
    gGisplayTime = diffTime.toFixed(3)  
    document.querySelector('.timer span').innerHTML = gGisplayTime

}

function startTimer(){
    gStartTime    = Date.now()
    gGameInterval = setInterval(setTimer,10)
}


function livesCounter(){
    var live = document.querySelector('.lives span')
    live.innerHTML = LIVES
}


function getBestScore(ScoreNew){

    var elScore = document.querySelector('.bestscore span')

    if (!elScore.innerHTML) elScore.innerHTML = 9999

    if (+elScore.innerHTML > +ScoreNew) {
    localStorage.setItem("score", ScoreNew);
    var score = localStorage.getItem("score");
    elScore.innerHTML = score
    console.log(score)
    }
}

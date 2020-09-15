'use strict';

var gLevel = {
    level: 1,
    SIZE: 4,
    MINES: 2
}

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}


var FLAG = '🚩';
var MINE = '💣';
var LIFE = '❤️'
var HINT = '💡'
var START = '😀'
var END = '🥺'
var gStartTime;
var gHint = false;
var gHintCounter = 3;
var gLife = 3;
var gManually = false;
var gManuallyCounter = 2;
var gTrueMines = [];
var gSafeClick = 3;
var gBoard;


function initGame() {
    gBoard = buildBoard();
    renderBoard(gBoard);
    setGame();
    getLocalStorage();
    resetTime();
}

function setGame() {
    gLife = 3;
    gHintCounter = 3;
    lifeAndHint('life', LIFE, 3);
    lifeAndHint('hint', HINT, 3);
    updateScore(0);
    levelGame()
    gLife = 3;
    gHintCounter = 3;
    gSafeClick = 3;
    renderInnerText('.safe-click span', gSafeClick)
}

function startGame() {
    resetTime();
    if (gGame.isOn) {
        smileyFace(END);
        gGame.isOn = false;
        initGame()
        displayBtn('block')
    } else {
        if (gManually) return;
        smileyFace(START);
        gGame.isOn = true;
        displayBtn('none')
        initGame()
    }
}

function sizeGame(elBtn) {
    if (elBtn.innerText == 4) {
        gLevel.level = 1;
    }
    if (elBtn.innerText == 8) {
        gLevel.level = 2
    }
    if (elBtn.innerText == 12) {
        gLevel.level = 3
    }
    resetTime();
    displayBtn('block');
    levelGame();
    initGame();
}

function levelGame() {
    if (gLevel.level === 1) {
        gLevel.SIZE = 4;
        gLevel.MINES = 2;
        gManuallyCounter = gLevel.MINES;
        renderCell('.cell', 11.5)
        renderInnerText('.manually span', gManuallyCounter)
        renderInnerTextLevel('.modal-level span', gLevel.level)
    }
    if (gLevel.level === 2) {
        gLevel.SIZE = 8;
        gLevel.MINES = 12;
        gManuallyCounter = gLevel.MINES;
        renderCell('.cell', 11)
        renderInnerText('.manually span', gManuallyCounter)
        renderInnerTextLevel('.modal-level span', gLevel.level)
    }
    if (gLevel.level === 3) {
        gLevel.SIZE = 12;
        gLevel.MINES = 30;
        gManuallyCounter = gLevel.MINES;
        renderCell('.cell', 10)
        renderInnerText('.manually span', gManuallyCounter)
        renderInnerTextLevel('.modal-level span', gLevel.level)
    }
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gGame.secsPassed = 0;
    gManually = false;
    updateScore(0);
}

function buildBoard() {
    var board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            board[i][j] = cell;
            // if (i === 0 && j === 0 || i === 1 && j === 1) board[i][j].isMine = true
        }
    }
    findRandomCells(board);
    return board;
}

function renderBoard(board) {
    if (gManually && gManuallyCounter !== 0) return;
    var strHTML = '<tbody>';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j];
            var className = `cell cell${i}-${j}`;
            strHTML += `<td class="${className}" onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="cellMarked(this, ${i}, ${j})"></td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody>';
    var elContainer = document.querySelector('.board');
    elContainer.innerHTML = strHTML;
    if (gManually) manualaOn();
}

function SafeClick(gBoard) {
    if (!gGame.isOn) return;
    if (gSafeClick === 0) return;
    gSafeClick--
    renderInnerText('.safe-click span', gSafeClick)
    var randomCells = [];
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (!gBoard[i][j].isMine && !gBoard[i][j].isShown) {
                randomCells.push({ i: i, j: j })
            }
        }
    }
    var randomIJ = getRandomInt(0, randomCells.length);
    var currIdx = randomCells[randomIJ]
    gBoard[currIdx.i][currIdx.j]
    var elSafe = document.querySelector(`.cell${currIdx.i}-${currIdx.i}`)
    elSafe.style.backgroundColor = 'blue'
    setTimeout(() => {
        elSafe.style.backgroundColor = 'gray'
        elSafe.innerText = ''
    }, 3000);
}

function manualaOn() {
    gGame.isOn = true;
    smileyFace(START);
    renderInnerText('.manually span', gManuallyCounter);
    displayBtn('none');
}

function manuallyMines() {
    gManually = true;
    var elManually = document.querySelectorAll('.cell')
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            gBoard[i][j].isMine = false
            gBoard[i][j].isShown = false
        }
    }
    for (var i = 0; i < elManually.length; i++) {
        elManually[i].style.backgroundColor = 'white';
        elManually[i].innerText = '';
    }
}

function setForManual(elCell, cellI, cellJ) {
    gManually = true
    var currCell = gBoard[cellI][cellJ];
    console.log(gManuallyCounter);
    if (currCell.isMine) return;
    elCell.innerText = MINE;
    currCell.isMine = true;
    gManuallyCounter--;
    renderInnerText('.manually span', gManuallyCounter)
    if (gManuallyCounter === 0) {
        gLife = 3;
        gHintCounter = 3;
        lifeAndHint('life', LIFE, 3);
        lifeAndHint('hint', HINT, 3);
        updateScore(0);
        var elFirstTime = document.querySelector('.btn-on-4 span')
        elFirstTime.innerText = localStorage.getItem("Time");
        gLife = 3;
        gHintCounter = 3;
        gSafeClick = 3;
        renderInnerText('.safe-click span', gSafeClick)
    }
}



function hideAfterHint(corIJ) {
    for (var i = 0; i < corIJ.length; i++) {
        var currCellH = gBoard[corIJ[i].i][corIJ[i].j]
        var elCell = document.querySelector(`.cell${corIJ[i].i}-${corIJ[i].j}`)
        gGame.shownCount--;
        currCellH.minesAroundCount = 0;
        currCellH.isShown = false;
        elCell.innerText = '';
        elCell.style.backgroundColor = 'gray'
    }

}

function setForHint(elCell, cellI, cellJ) {
    var currCell = gBoard[cellI][cellJ];
    if (gHint && !currCell.isMine) {
        currCell.minesAroundCount = countNeighbors(cellI, cellJ, gBoard);
        elCell.innerText = currCell.minesAroundCount;
        if (currCell.minesAroundCount === '') {
            expandShown(gBoard, cellI, cellJ)
        }
        elCell.style.backgroundColor = 'white'
        setTimeout(() => {
            elCell.style.backgroundColor = 'gray'
            elCell.innerText = ''
            gHint = false
        }, 1000);
        currCell.isShown = false;
    } if (gHint && currCell.isMine) {
        displayMine(MINE, 'red', cellI, cellJ)
        setTimeout(() => {
            displayMine('', 'gray', cellI, cellJ)
            gHint = false;
        }, 1000);
        return true;
    }
    return false
}

function moveMineInFirstClick(elCell, cellI, cellJ) {
    if (!gGame.isOn || gManually) return;
    var currCell = gBoard[cellI][cellJ]
    if (!currCell.isMine) return;
    var newCellForMine = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (!gBoard[i][j].isMine) {
                newCellForMine.push({ i: i, j: j })
            }
        }
    }
    currCell.isMine = false;
    var newCell = gBoard[newCellForMine[0].i][newCellForMine[0].j];
    newCell.isMine = true;
    return;
}

function cellClicked(elCell, i, j) {
    var currCell = gBoard[i][j];
    if (gManually && gManuallyCounter !== 0) {
        setForManual(elCell, i, j);
    }
    if (gGame.shownCount === 0) {
        startTime();
        moveMineInFirstClick(elCell, i, j)
    }
    if (!gGame.isOn || currCell.isMarked || currCell.isShown) return;
    if (!currCell.isMine) {
        currCell.isShown = true;
        setForHint(elCell, i, j);
        currCell.minesAroundCount = countNeighbors(i, j, gBoard);
        elCell.innerText = currCell.minesAroundCount;
        elCell.style.backgroundColor = 'white'
        gGame.shownCount++
        if (currCell.minesAroundCount === '') {
            expandShown(gBoard, i, j)
        }
        playSound('nums');
        nextLevel()
    } else {
        if (setForHint(elCell, i, j)) return;
        gLife--
        checkGameOver(i, j)
    }
}

function checkGameOver(cellI, cellJ) {
    if (gLife !== 0) {
        lifeAndHint('life', LIFE, gLife);
        displayMine(MINE, 'red', cellI, cellJ)
        playSound('buzz')
        setTimeout(() => {
            displayMine('', 'gray', cellI, cellJ)
        }, 500);
    } else {
        gGame.isOn = false;
        gManually = false;
        playSound('game-over')
        lifeAndHint('life', LIFE, '');
        displayMines(gBoard, 'red', MINE)
        smileyFace(END);
        clearInterval(gGame.secsPassed);
        return true;
    }
}

function showHint() {
    if (!gGame.isOn) return;
    gHint = true;
    gHintCounter--;
    if (gHintCounter !== 0) {
        lifeAndHint('hint', HINT, gHintCounter)
    } else {
        lifeAndHint('hint', HINT, gHintCounter)
    }
}

function displayMine(value, color, i, j) {
    var elMine = document.querySelector(`.cell${i}-${j}`)
    elMine.innerText = value;
    elMine.style.backgroundColor = color;
}

function nextLevel() {
    if (gGame.markedCount === gLevel.MINES && gGame.shownCount === (gBoard.length * gBoard.length) - gLevel.MINES) {
        updateLocalStorage();
        getLocalStorage();
        resetTime();
        setTimeout(() => {
            gGame.shownCount = 0;
            gGame.markedCount = 0;
            gLevel.level++
            levelGame();
            initGame();
        }, 1000);
    } else {
        return;
    }

}

function expandShown(board, cellI, cellJ) {
    var cellsForHint = [];
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= board[i].length) continue;
            if (board[i][j].isMine || board[i][j].isMarked || board[i][j].isShown) {
                console.log(board[i][j].isShown);
                continue;
            } else {
                var elCell = document.querySelector(`.cell${i}-${j}`)
                var currCell = board[i][j]
                gGame.shownCount++
                currCell.minesAroundCount = countNeighbors(i, j, gBoard)
                currCell.isShown = true;
                elCell.innerText = currCell.minesAroundCount;
                elCell.style.backgroundColor = 'white'
                cellsForHint.push({ i: i, j: j })
            }
        }
    }
    if (gHint)
        setTimeout(() => {
            hideAfterHint(cellsForHint);
        }, 500);
}


function cellMarked(elCell, i, j) {
    document.addEventListener('contextmenu', function (hide) {
        hide.preventDefault()
    });
    var currCell = gBoard[i][j]
    if (!gGame.isOn || currCell.isShown) return;
    if (currCell.isMarked) {
        playSound('click');
        elCell.innerText = '';
        updateScore(-1);
        currCell.isMarked = false;
        nextLevel();
        return;
    } else {
        playSound('click');
        elCell.innerText = FLAG;
        currCell.isMarked = true;
        updateScore(1);
        nextLevel();
    }
}

function countNeighbors(cellI, cellJ, board) {
    var neighborsSum = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= board[i].length) continue;
            if (board[i][j].isMine === true)
                neighborsSum++;
        }
    }
    if (neighborsSum === 0) neighborsSum = '';
    return neighborsSum;
}

function smileyFace(face) {
    document.querySelector('.btn-on-2 span').innerText = face
}

function lifeAndHint(lifeOrHint, value, num) {
    var elLifeHint = document.querySelector(`.${lifeOrHint} span`)
    elLifeHint.innerText = value.repeat(num)
}


function findRandomCells(board) {
    var randomCells = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            randomCells.push({ i: i, j: j })
        }
    }
    for (var i = 0; i < gLevel.MINES; i++) {
        var randomIdx = getRandomInt(0, randomCells.length - 1);
        var currRandom = randomCells[randomIdx]
        if (board[currRandom.i][currRandom.j]) {
            board[currRandom.i][currRandom.j].isMine = true;
        }
        randomCells.splice(randomIdx, 1)
    }
    return randomCells[randomIdx]
}

function displayMines(board, color, value) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (board[i][j].isMine) {
                var elMines = document.querySelector(`.cell${i}-${j}`);
                elMines.style.backgroundColor = color;
                elMines.innerText = value;
            }
        }
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function renderCell(selector, value) {
    var elCell = document.querySelectorAll(selector);
    for (var i = 0; i < elCell.length; i++) {
        elCell[i].style.fontSize = value + 'px';
    }
}

function playSound(music) {
    var sound = new Audio(`sound/${music}.mp3`);
    sound.play();
}

function renderInnerText(selector, value) {
    var elInnerText = document.querySelector(selector)
    elInnerText.innerText = `(${value} Left)`
}

function renderInnerTextLevel(selector, value) {
    var elInnerText = document.querySelector(selector)
    elInnerText.innerText = value;
}


function updateScore(value) {
    var markedCount = document.querySelector('.btn-on-1 span')
    gGame.markedCount += value;
    markedCount.innerHTML = gGame.markedCount
}

function displayBtn(value) {
    var elBtn = document.querySelectorAll('.manually')
    elBtn[0].style.display = value
    elBtn[1].style.display = value
}

function startTime() {
    gStartTime = Math.floor(Date.now() / 1000);
    gGame.secsPassed = setInterval(setTimeCounter, 1000)
}

function setTimeCounter() {
    if (gGame.isOn) {
        var now = Math.floor(Date.now() / 1000);
        var diff = now - gStartTime;
        var m = Math.floor(diff / 60);
        var s = Math.floor(diff % 60);
        m = checkTime(m);
        s = checkTime(s);
        document.querySelector('.btn-on-3 span').innerHTML = m + ":" + s;
    } else {
        gStartTime = Math.floor(Date.now() / 1000);
    }
}

function checkTime(i) {
    if (i < 10) { i = '0' + i };
    return i;
}

function updateLocalStorage() {
    var gBestScore = Infinity
    var bestScoreMin = '';
    var bestScoreSec = '';
    var bestScore;
    var elTime = document.querySelector('.btn-on-3 span').innerText
    var elTimeSplit = elTime.split('')
    for (var i = 0; i < elTimeSplit.length; i++) {
        if (i === 1) {
            bestScoreMin += elTimeSplit[i];
        }
        if (i === 3 || i === 4) {
            bestScoreSec += elTimeSplit[i];
        }
    }
    var bestScoreMinToNum = parseInt(bestScoreMin)
    var bestScoreSecToNum = parseInt(bestScoreSec)
    bestScoreMinToNum *= 60;
    var bestScore = bestScoreMinToNum + bestScoreSecToNum;
    if (bestScore < gBestScore) {
        gBestScore = bestScore;
    } else {
        gBestScore = gBestScore;
    }
    document.querySelector('.btn-on-4 span').innerText
    localStorage.setItem('Time', gBestScore + 's');
}

function getLocalStorage() {
    var elTime = document.querySelector('.btn-on-4 span').innerText = localStorage.getItem("Time");
}

function resetTime() {
    clearInterval(gGame.secsPassed);
    document.querySelector('.btn-on-3 span').innerText = '00:00';
    gStartTime = Math.floor(Date.now() / 1000);
}


// gTrueMines.push({ i: cellI, j: cellJ })
// function renderManuallyMines() {
//     for (var i = 0; i < gTrueMines.length; i++) {
//         if (board[gTrueMines.i][gTrueMines.j]) {
//             board[gTrueMines.i][gTrueMines.j].isMine = true;
//         }
//         randomCells.splice(randomIdx, 1)
//     }
//     return gTrueMines
// }

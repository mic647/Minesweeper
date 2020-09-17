'use strict'

var gIsSettingMines = false;
var gMinesSetManualCount = 5;
var gTempBoard = [];
var gSafeMoveTimer;
var gAllmoves = {
    board: [],
    game: [],
    special: []
};
var gManualMines = [];

// gSpecial = {
//     isHintOn: false,
//     hints: 3,
//     isLifesOn: false,
//     lifes: 3,
//     safeClick: 3,
//     stepsMemory: [{},
//         []
//     ]
// }

// cell = {
//     minesAroundCount: 0,
//     isShown: false,
//     isMine: false,
//     isMarked: false
// }
function resetControlOptions() {
    //hint 
    document.querySelector('.hintButton').disabled = false;
    for (let i = 0; i < gSpecial.hints; i++) {
        document.querySelector(`.hint${i}`).style.visibility = 'visible';
    }
    //life
    document.getElementById('life').checked = false;
    document.getElementById('life').disabled = false;
    for (let i = 0; i < gSpecial.lifes; i++) {
        document.querySelector(`.life${i}`).style.visibility = 'visible';
    }
    //safe moves
    document.querySelector('.safeButton').disabled = false;
    for (let i = 0; i < gSpecial.safeClicks; i++) {
        document.querySelector(`.safe${i}`).style.visibility = 'visible';
    }
    //undo 
    document.querySelector('.undoButton').disabled = true;
    gAllmoves = {
        board: [],
        game: [],
        special: []
    };

}

function setLevel(elButton) {
    _cancelManualMinesStatus();
    switch (elButton.innerText) {
        case 'Beginner':
            gLevel.MINES = 2;
            gLevel.SIZE = 4;
            break;
        case 'Medium':
            gLevel.MINES = 12;
            gLevel.SIZE = 8;
            break;
        case 'Expert':
            gLevel.MINES = 30;
            gLevel.SIZE = 12;
            break;
        default:
            break;
    }
    init();
}

function setManualMines() {
    init()
    resetControlOptions();
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {
            document.querySelector(`#cell-${i}-${j}`).classList.add('minesmanual');
        }
    }
    document.querySelector('table').style.cursor = 'cell';
    document.querySelector('.count').innerText = gLevel.MINES - gManualMines.length;
    document.querySelector('.count').style.color = 'rgb(212, 154, 27)';
    gIsSettingMines = true;
}

function showHint(elButton) {
    //to do show 3 hints and change the symbole
    if (!gGame.isOn) return;
    if (gSpecial.isHintOn) return;
    gSpecial.isHintOn = true;
    var elSpan = document.querySelector(`.hint${3-gSpecial.hints}`);
    gSpecial.hints--;
    elSpan.style.visibility = 'hidden';
    saveNextMove();
    gTempBoard = copyMat(gBoard);

    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j];
            if (!cell.isShown) cell.isHinted = true;
        }
    }
    renderBoard();
    if (gSpecial.hints === 0) {
        document.querySelector('.hintButton').disabled = true;
    }

}

function useLife() {
    var elCheckBox = document.getElementById('life');
    gSpecial.isLifesOn = elCheckBox.checked;

}

function updateLife() {
    document.querySelector(`.life${3-gSpecial.lifes}`).style.visibility = 'hidden';
    gSpecial.lifes--;
    if (gSpecial.lifes === 0) {
        gSpecial.isLifesOn = false;
        var elCheckBox = document.getElementById('life');
        elCheckBox.checked = false;
        elCheckBox.disabled = true;
    }

}

function safeMove(elButton) {
    if (!gGame.isOn) return;
    var elSpan = document.querySelector(`.safe${3-gSpecial.safeClicks}`);
    gSpecial.safeClicks--;
    elSpan.style.visibility = 'hidden';
    var safeMoveCoords = getSafeMoveCoords();

    var elCell = document.querySelector(`#cell-${safeMoveCoords.i}-${safeMoveCoords.j}`);

    elCell.innerHTML = '<span>🧞‍♂️</span>'
    gSafeMoveTimer = setInterval(function() {
        elCell.innerHTML = '';
    }, 2000);

    if (gSpecial.safeClicks === 0) {
        document.querySelector('.safeButton').disabled = true;
    }
    saveNextMove();
}

function undoMove(elButton) {

    //data
    var len = gAllmoves.board.length;
    if (gAllmoves.board.length > 1) {
        console.log('/// BOARD ///');
        diffArrOrObj(gAllmoves.board[len - 1], gAllmoves.board[len - 2])
        console.log('/// BOARD ///');

    }

    // gBoard = copyMat(gAllmoves.board[(len - 1)]);
    // gGame = Object.assign({}, gAllmoves.game[(len - 1)]);
    // gSpecial = Object.assign({}, gAllmoves.special[(len - 1)]);
    gBoard = gAllmoves.board.pop();
    gGame = gAllmoves.game.pop();
    gSpecial = gAllmoves.special.pop();
    printTable(gBoard);
    renderBoard();


    if (gAllmoves.board.length === 0) {
        document.querySelector('.undoButton').disabled = true;
    }
    //control and help panel
    //mines count
    var updatedCount = (gLevel.MINES - gGame.markedCount);
    updatedCount = (updatedCount < 10) ? ('0' + updatedCount) : updatedCount;
    document.querySelector('.count').innerText = updatedCount;
    //Emojy and timer
    var elReset = document.querySelector('.reset');
    if (elReset.innerText === LOST) {
        document.querySelector('.reset').innerText = RESET;
        var elTimer = document.querySelector('.timer');
        var secStr = '';
        //timer isn"t working
        if (gGame.secsPassed < 100) secStr = (gGame.secsPassed < 10) ? '00' + gGame.secsPassed : '0' + gGame.secsPassed;
        elTimer.innerText = secStr;
        gTimer = setInterval(setTimer, 1000);

    }
    //hints
    for (let i = 0; i < gSpecial.hints; i++) {
        document.querySelector(`.hint${i}`).style.visibility = 'visible';
    }
    if (gSpecial.hints > 0) {
        document.querySelector('.hintButton').disabled = false;
    }
    //lifes - missing updating checkbox
    for (let i = 0; i < gSpecial.lifes; i++) {
        document.querySelector(`.life${i}`).style.visibility = 'visible';
    }
    if (gSpecial.lifes > 0) {
        var elCheckBox = document.querySelector(`#life`);
        elCheckBox.disabled = false;
        gSpecial.isLifesOn = elCheckBox.checked;
    }

    //safe moves
    for (let i = 0; i < gSpecial.safeClicks; i++) {
        document.querySelector(`.safe${i}`).style.visibility = 'visible';
    }
    if (gSpecial.safeMoves > 0) {
        document.querySelector('.safeButton').disabled = false;
    }

}

function getSafeMoveCoords() {
    var randomCell = {};
    var safeMoves = [];
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j];
            if (!cell.isShown && !cell.isMine) safeMoves.push({ i: i, j: j });
        }
    }
    randomCell = safeMoves[getIntNotInc(0, safeMoves.length)];

    return { i: randomCell.i, j: randomCell.j };
}

function saveNextMove() {
    var elButton = document.querySelector('.undoButton');
    if (elButton.disabled) {
        elButton.disabled = false;
    }
    console.log('/// after saving board///');
    gAllmoves.board.push(copyMat(gBoard));
    console.log(gAllmoves.board);
    gAllmoves.game.push(Object.assign({}, gGame));
    gAllmoves.special.push(Object.assign({}, gSpecial));

}

function setManualMine(elCell) {
    if (!gIsSettingMines) return;
    var coords = { i: +elCell.dataset.i, j: +elCell.dataset.j };
    var newMine = { i: coords.i, j: coords.j };
    for (let i = 0; i < gManualMines.length; i++) {
        if (gManualMines[i].i === newMine.i && gManualMines[i].j === newMine.j) return;
    }
    elCell.classList.remove('minesmanual');
    elCell.classList.add('mine');
    elCell.innerHTML += MINE_IMG;
    gManualMines.push(newMine);
    document.querySelector('.count').innerText = gLevel.MINES - gManualMines.length;
    if ((gManualMines.length) === gLevel.MINES) {
        buildBoard(gManualMines);
        renderBoard();
        _cancelManualMinesStatus();
        gGame.isOn = true;
        gTimeGameBegan = new Date;
        gTimer = setInterval(setTimer, 1000);
        saveNextMove();

    }
}

function _cancelManualMinesStatus() {
    //set after rendering
    gManualMines = [];
    gIsSettingMines = false;
    document.querySelector('.count').style.color = 'red';

    var updatedCount = gLevel.MINES;
    updatedCount = (updatedCount < 10) ? ('0' + updatedCount) : updatedCount;
    document.querySelector('.count').innerText = updatedCount;
    document.querySelector('table').style.cursor = 'auto';
}
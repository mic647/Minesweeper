'use strict'


function renderBoard() {
    console.log(gBoard);
    var strHtml = '';
    for (var i = 0; i < gBoard.length; i++) {
        var row = gBoard[i];
        strHtml += '<tr>';
        for (var j = 0; j < gBoard[0].length; j++) {
            strHtml += getNewHtmlForCell({ i: i, j: j });
        }
        strHtml += '</tr>';
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHtml;
}

function getNewHtmlForCell(coord) {
    var cell = gBoard[coord.i][coord.j];
    var strHtml = '';
    var cellText = '';

    var cellSpecialClassName = ''
    if (cell.isShown) {
        //for shown cells
        if (cell.isMine) {
            cellSpecialClassName = 'mine';
            cellText = MINE_IMG;
        } else {
            cellText = (cell.minesAroundCount > 0) ? cell.minesAroundCount : '';

        }
    } else {
        //for not shown cells
        cellSpecialClassName = 'hidden';
        if (cell.isMarked) cellText = FLAG_IMG;
        if (cell.isHinted) cellSpecialClassName += ' hinted';
    }
    var functions = 'onclick="cellClicked(this); setManualMine(this)" oncontextmenu = "rightClicked(this)" '
        //functions += ' onmousedown ="mouseDown(this)'
    strHtml += `<td id="cell-${coord.i}-${coord.j}" class="cell cell-${cell.minesAroundCount} ${cellSpecialClassName}" ${functions} data-i="${coord.i}" data-j="${coord.j}">
${cellText}</td>`;

    return strHtml;
}

function buildBoard(mines) {
    buildEmptyBoard();

    for (let count = 0; count < mines.length; count++) {
        var mineI = mines[count].i;
        var mineJ = mines[count].j;
        gBoard[mineI][mineJ].isMine = true;
        setMineNegsCount({ i: mineI, j: mineJ });
    }
}

function buildEmptyBoard() {
    gBoard = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        gBoard[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            gBoard[i][j] = getCell();
        }
    }
}

function getCell() {
    var cell = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
        isHinted: false
    }
    return cell;
}

function creatRandomMines(notMineCoord) {
    console.log('Mines are:');
    var mines = [];
    while (mines.length < gLevel.MINES) {
        var newMine = {};
        newMine.i = getIntNotInc(0, gLevel.SIZE);
        newMine.j = getIntNotInc(0, gLevel.SIZE);
        if ((notMineCoord.i !== newMine.i && notMineCoord.j !== newMine.j) && (checkIfMineLegit(mines, newMine))) {
            mines.push(newMine);
        }
    }

    return mines;
}

function checkIfMineLegit(mines, mineCoord) {
    for (let i = 0; i < mines.length; i++) {
        if (mines[i].i === mineCoord.i && mines[i].j === mineCoord.j)
            return false;
    }
    return true;
}

function setMineNegsCount(mineCoord) {
    for (let i = mineCoord.i - 1; i <= mineCoord.i + 1; i++) {
        for (let j = mineCoord.j - 1; j <= mineCoord.j + 1; j++) {
            if (i === mineCoord.i && j === mineCoord.j) continue;
            if (_checkIfOnBoard({ i: i, j: j })) {
                gBoard[i][j].minesAroundCount += 1;
            }
        }
    }
}

function _checkIfOnBoard(cellCoord) {
    return (cellCoord.i >= 0 && cellCoord.i < gBoard.length &&
        cellCoord.j >= 0 && cellCoord.j < gBoard[cellCoord.i].length);
}

function showAllMines() {

}
'use strict'

function setTimer() {
    var elTimer = document.querySelector('.timer');
    var timeNow = new Date;
    gGame.secsPassed = Math.floor((timeNow.getTime() - gTimeGameBegan.getTime()) / 1000);
    var secStr = '';
    if (gGame.secsPassed < 100) secStr = (gGame.secsPassed < 10) ? '00' + gGame.secsPassed : '0' + gGame.secsPassed;
    elTimer.innerText = secStr;
}


function getIntNotInc(min = 0, max = gLevel.SIZE) {
    return Math.floor(Math.random() * (max - min) + min);
}

function copyMat(sourceMat) {
    var newMat = [];
    for (var i = 0; i < sourceMat.length; i++) {
        var arr = []
        for (let j = 0; j < sourceMat[i].length; j++) {
            var sourceObj = sourceMat[i][j];
            var obj = Object.assign({}, sourceObj)
            arr.push(obj);
        }
        newMat.push(arr);
    }
    return newMat;
}

// function diffArrOrObj(arr1, arr2) {
//     console.log(arr1);
//     console.log(arr2);
//     for (let i = 0; i < arr1.length; i++) {
//         for (let j = 0; j < arr1[i].length; j++) {
//             for (var key in arr1[i][j])
//                 if (arr1[i][j][key] !== arr2[i][j][key])
//                     console.log(`${key} : ${arr1[i][j][key]} - ${arr2[i][j][key]}`);
//         }
//     }
// }

function diffArrOrObj(var1, var2) {
    if (var1.isArray) {
        for (let i = 0; i < var1.length; i++) {
            if (diffArrOrObj(var1[i], var2[2])) console.log(`${i}:${j}`);;
        }
    } else if (typeof var1 === 'object' && !var1.isArray) {
        for (var key in var1) {
            if (diffArrOrObj(var1[key], var2[key])) console.log(key);;
        }
    } else {
        if (var1 !== var2) {
            console.log(`${var1}/${var2}`);
            return true;
        }

    }
    return false;
}

function printTable(board) {
    var boardToprint = [];
    for (let i = 0; i < board.length; i++) {
        var row = [];
        for (let j = 0; j < board[i].length; j++) {
            var cell = board[i][j];
            if (cell.isMarked) {
                row.push('F')
            } else if (cell.isShown) {
                row.push(cell.minesAroundCount)
            } else row.push('');
        }
        boardToprint.push(row);
    }
    console.table(boardToprint);
}
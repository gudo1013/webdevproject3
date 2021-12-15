//Checks to see if the puzzle is completed, displays appropriate message
function checkPuzzle(){
    let solved = this.isSolved();
    if(solved){
        alert('Congrats!! You completed the puzzle!!');
    }
    else{
        alert('The puzzle is not completed');
    }
}

//Clear the board
function clearPuzzle(){
    for(let i = 0; i < 9; i++){
        for(let j = 0; j < 9; j++){
            document.getElementById(i + ',' + j).value = "";
        }
    }
}

//Fill in the worlds hardest puzzle
function fillIncompletePuzzle(){
    for(let i = 0; i < 9; i++){
        for(let j = 0; j < 9; j++){
            document.getElementById(i+','+j).value = "";
        }
    }

    document.getElementById("0,0").value = 8;
    document.getElementById("1,2").value = 3;
    document.getElementById("1,3").value = 6;
    document.getElementById("2,1").value = 7;
    document.getElementById("2,4").value = 9;
    document.getElementById("2,6").value = 2;
    document.getElementById("3,1").value = 5;
    document.getElementById("3,5").value = 7;
    document.getElementById("4,4").value = 4;
    document.getElementById("4,5").value = 5;
    document.getElementById("4,6").value = 7;
    document.getElementById("5,3").value = 1;
    document.getElementById("5,7").value = 3;
    document.getElementById("6,2").value = 1;
    document.getElementById("6,7").value = 6;
    document.getElementById("6,8").value = 8;
    document.getElementById("7,2").value = 8;
    document.getElementById("7,3").value = 5;
    document.getElementById("7,7").value = 1;
    document.getElementById("8,1").value = 9;
    document.getElementById("8,6").value = 4;
}

//Fill in a completed puzzle to demonstrate that it works
function fillCompletePuzzle(){
    document.getElementById("0,0").value = 1;
    document.getElementById("0,1").value = 2;
    document.getElementById("0,2").value = 3;
    document.getElementById("0,3").value = 4;
    document.getElementById("0,4").value = 5;
    document.getElementById("0,5").value = 6;
    document.getElementById("0,6").value = 7;
    document.getElementById("0,7").value = 8;
    document.getElementById("0,8").value = 9;
    document.getElementById("1,0").value = 4;
    document.getElementById("1,1").value = 5;
    document.getElementById("1,2").value = 6;
    document.getElementById("1,3").value = 7;
    document.getElementById("1,4").value = 8;
    document.getElementById("1,5").value = 9;
    document.getElementById("1,6").value = 1;
    document.getElementById("1,7").value = 2;
    document.getElementById("1,8").value = 3;
    document.getElementById("2,0").value = 7;
    document.getElementById("2,1").value = 8;
    document.getElementById("2,2").value = 9;
    document.getElementById("2,3").value = 1;
    document.getElementById("2,4").value = 2;
    document.getElementById("2,5").value = 3;
    document.getElementById("2,6").value = 4;
    document.getElementById("2,7").value = 5;
    document.getElementById("2,8").value = 6;
    document.getElementById("3,0").value = 2;
    document.getElementById("3,1").value = 3;
    document.getElementById("3,2").value = 1;
    document.getElementById("3,3").value = 5;
    document.getElementById("3,4").value = 6;
    document.getElementById("3,5").value = 4;
    document.getElementById("3,6").value = 8;
    document.getElementById("3,7").value = 9;
    document.getElementById("3,8").value = 7;
    document.getElementById("4,0").value = 5;
    document.getElementById("4,1").value = 6;
    document.getElementById("4,2").value = 4;
    document.getElementById("4,3").value = 8;
    document.getElementById("4,4").value = 9;
    document.getElementById("4,5").value = 7;
    document.getElementById("4,6").value = 2;
    document.getElementById("4,7").value = 3;
    document.getElementById("4,8").value = 1;
    document.getElementById("5,0").value = 8;
    document.getElementById("5,1").value = 9;
    document.getElementById("5,2").value = 7;
    document.getElementById("5,3").value = 2;
    document.getElementById("5,4").value = 3;
    document.getElementById("5,5").value = 1;
    document.getElementById("5,6").value = 5;
    document.getElementById("5,7").value = 6;
    document.getElementById("5,8").value = 4;
    document.getElementById("6,0").value = 3;
    document.getElementById("6,1").value = 1;
    document.getElementById("6,2").value = 2;
    document.getElementById("6,3").value = 6;
    document.getElementById("6,4").value = 4;
    document.getElementById("6,5").value = 5;
    document.getElementById("6,6").value = 9;
    document.getElementById("6,7").value = 7;
    document.getElementById("6,8").value = 8;
    document.getElementById("7,0").value = 6;
    document.getElementById("7,1").value = 4;
    document.getElementById("7,2").value = 5;
    document.getElementById("7,3").value = 9;
    document.getElementById("7,4").value = 7;
    document.getElementById("7,5").value = 8;
    document.getElementById("7,6").value = 3;
    document.getElementById("7,7").value = 1;
    document.getElementById("7,8").value = 2;
    document.getElementById("8,0").value = 9;
    document.getElementById("8,1").value = 7;
    document.getElementById("8,2").value = 8;
    document.getElementById("8,3").value = 3;
    document.getElementById("8,4").value = 1;
    document.getElementById("8,5").value = 2;
    document.getElementById("8,6").value = 6;
    document.getElementById("8,7").value = 4;
    document.getElementById("8,8").value = 5;
}

//Algorithm to determine if the puzzle is solved correctly
function isSolved(){
    let currVal;
    let currRowList = [];
    //Check all of the rows
    for(let i = 0; i < 9; i++){
        for(let j = 0; j < 9; j++){
            currVal = document.getElementById(i+','+j).value;
            if(currVal != "" && !currRowList.includes(currVal)){
                currRowList.push(currVal);
            }
        }
        if(currRowList.length != 9){
            return false;
        }
    }

    //Check all of the columns
    let currColList = [];
    for(i = 0; i < 9; i++){
        for(j = 0; j < 9; j++){
            currVal = document.getElementById(i+','+j).value;
            if(currVal != "" && !currColList.includes(currVal)){
                currColList.push(currVal);
            }
        }
        if(currColList.length != 9){
            return false;
        }
    }
    //Check each 3x3 grid
    let threeGrid;
    for(i = 0; i < 9; i++){
        threeGrid = [];
        let xOffset = i%3;
        let yOffset = Math.floor(i/3);
        for(j = 0; j < 3; j++){
            for(let k = 0; k < 3; k++){
                if(xOffset == 0 && yOffset == 0){
                    currVal = document.getElementById(j+','+k).value;
                    if(currVal != "" && !threeGrid.includes(currVal)){
                        threeGrid.push(currVal);
                    }
                }
                else if(xOffset == 0){
                    let kString = k+yOffset*3;
                    currVal = document.getElementById(j+','+kString).value;
                    if(currVal != "" && !threeGrid.includes(currVal)){
                        threeGrid.push(currVal);
                    }
                }
                else if(yOffset == 0){
                    let jString = j+xOffset*3;
                    currVal = document.getElementById(jString + ',' + k).value;
                    if(currVal != "" && !threeGrid.includes(currVal)){
                        threeGrid.push(currVal);
                    }
                }
                else{
                    let jString = j+xOffset*3;
                    let kString = k+yOffset*3;
                    currVal = document.getElementById(jString + ',' + kString).value;
                    if(currVal != "" && !threeGrid.includes(currVal)){
                        threeGrid.push(currVal);
                    }
                }
            }
        }
        if(threeGrid.length != 9){
            return false;
        }
    }

    return true;
}
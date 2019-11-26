// function to perform a get request
function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false); // false for synchronous request
    xmlHttp.send(null);
    return xmlHttp.responseText;
}

// function to get a random image
function getRandomImage() {
    // get the json from the server
    let json = httpGet('https://dog.ceo/api/breeds/image/random');

    // decode the json into an array
    let array = JSON.parse(json);


    // get the image url from the array
    let url = array.message;


    // get the image object
    let image = document.querySelector('#dogImage');

    // set the src of the image object
    image.src = url;
}

function contentTypeChanged() {
    let loadContentButton = document.querySelector('#LoadButton');
    let gameModeSelect = document.querySelector('#gameMode');

    if (gameModeSelect.selectedIndex == 2) {
        loadContentButton.innerHTML = "Load Breed Finder";
    }
    else {
        loadContentButton.innerHTML = "Load Game";
    }
}

function loadContent() {
    let contentDiv = document.querySelector('#content');

    let gameModeSelect = document.querySelector('#gameMode');

    if (gameModeSelect.selectedIndex == 2) {
        listAllBreeds();
    } else {
        loadGame(gameModeSelect.selectedIndex, 0, 0)
    }
}

function loadGame(difficultyID, round, points) {
    let difficulty = (difficultyID == 0 ? "Easy" : "Hard");
    let gameDisplayDiv = document.querySelector('#gameDisplay');
    gameDisplayDiv.innerHTML = "";

    let highscoreDisplay = document.createTextNode("Highscore [" + difficulty + "]: ");
    if (round == 10) {
        gameDisplayDiv.innerHTML = "Game Over<br>Points: " + points + "/10";
        let highscore = window.localStorage.getItem("highscore" + difficultyID);
        if (highscore == null || points > highscore) {
            window.localStorage.setItem("highscore" + difficultyID, points);
        }
        return;
    }

    let imagesInRound = (difficultyID == 0 ? 3 : 5);
    let correctImageID = Math.floor(Math.random() * imagesInRound);
    let correctDogBreed = getRandomDogBreed();

    
    let topDisplay = document.createTextNode("Difficulty: " + difficulty);
    let topDisplay2 = document.createTextNode((10 - round) + " round" + ((10 - round) == 1 ? "" : "s") + " left");
    let topDisplay3 = document.createTextNode("Points: " + points + "/10");
    let topDisplay4 = document.createTextNode("Click the " + correctDogBreed.replace('/', ' ') + ".");
    let gameInfoDiv = document.createElement("div");
    gameInfoDiv.appendChild(topDisplay);
    gameInfoDiv.appendChild(document.createElement("br"));
    gameInfoDiv.appendChild(topDisplay2);
    gameInfoDiv.appendChild(document.createElement("br"));
    gameInfoDiv.appendChild(topDisplay3);
    gameInfoDiv.appendChild(document.createElement("br"));
    gameInfoDiv.appendChild(topDisplay4);
    gameInfoDiv.appendChild(document.createElement("br"));
    gameInfoDiv.id = "gameInfo";
    gameDisplayDiv.appendChild(gameInfoDiv);

    for (let i = 0; i < imagesInRound; i++) {
        let randomDogBreed = undefined;

        if (correctImageID != i) {
            // to ensure their are no duplicate correct dog breeds
            do {
                randomDogBreed = getRandomDogBreed();
            } while (correctDogBreed == randomDogBreed)
        } else {
            randomDogBreed = correctDogBreed;
        }

        // build request
        let request = 'https://dog.ceo/api/breed/' + randomDogBreed + '/images';
        let imageSrc = "";
        let imageGrabAttempt = 0;
        do {
            // get the json from the server
            let json = httpGet(request);
            // decode the json into an array
            let array = JSON.parse(json);
            // get the image url from the array
            let url = array.message;

            let selectedImage = url[Math.round(Math.random() * url.length)];

            if (selectedImage == undefined) {
                console.log("Image not OK!");
                imageGrabAttempt += 1;
                console.log("Retrying, Attempt: " + imageGrabAttempt);
            }
            else {
                imageGrabAttempt = -1
                console.log("Image loaded - " + selectedImage);
                imageSrc = selectedImage;
            }
        } while (imageGrabAttempt != -1 && imageGrabAttempt <= 3);



        let dogImage = document.createElement("IMG");
        dogImage.className = "dogGameImage";
        dogImage.src = imageSrc;

        if (correctImageID == i) {
            dogImage.onclick = function () {
                loadGame(difficultyID, round + 1, points + 1)
            };
        } else {
            dogImage.onclick = function () {
                loadGame(difficultyID, round + 1, points)
            };
        }

        gameDisplayDiv.appendChild(dogImage);
    }



    //gameDisplayDiv.innerHTML = inner;
}

function getRandomDogBreed() {
    let json = httpGet('https://dog.ceo/api/breeds/list/all');
    let array = JSON.parse(json);
    let url = array.message;

    let breedID = Math.floor(Object.keys(url).length * Math.random());
    let breedName = Object.keys(url)[breedID];
    let subBreedID = 0;
    if (url[breedName].length > 0) {
        subBreedID = Math.floor(url[breedName].length * Math.random());
    }

    let subBreedName = url[breedName][subBreedID];
    if (subBreedName != undefined)
        return breedName + "/" + subBreedName;
    else
        return breedName;
}

function listAllBreeds() {
    let json = httpGet('https://dog.ceo/api/breeds/list/all');

    let array = JSON.parse(json);

    let url = array.message;

    let inner = "Breed: <select id= \"breedDropdown\" onchange=\"showSubBreedList()\">";

    for (let property in url) {
        if (url.hasOwnProperty(property)) {
            console.log(property + "");
            inner += "<option value=\"" + property + "\">" + property + "</option>";
        }
    }

    inner += "</select><br>"
    //I made this a div so that I could make both the label and dropdown box invisible and visible.
    inner += "<div id=\"subBreedDropdownWithLabel\" style=\"display: none\">Sub-breed: <select id= \"subBreedDropdown\"></select></div><br>"

    inner += "<button onClick=\"viewBreed(0)\">View Breed</button>"
    inner += "<br><img id=\"dogImage\" src=\"https://dog.ceo/img/dog-api-logo.svg\">"

    let gameDisplayDiv = document.querySelector('#gameDisplay');
    gameDisplayDiv.innerHTML = inner;

}

function showSubBreedList() {
    // get selected breed
    let breedSelect = document.querySelector('#breedDropdown');
    let breed = breedSelect.options[breedSelect.selectedIndex].value;

    // get list of breeds and sub breeds
    let json = httpGet('https://dog.ceo/api/breeds/list/all');
    let array = JSON.parse(json);
    let url = array.message;

    let subBreedSelect = document.querySelector('#subBreedDropdown');
    let subBreedDropdownWithLabel= document.querySelector('#subBreedDropdownWithLabel');
    // if it has sub breeds
    if (url[breed].length > 0) {

        let inner = "";
        for (let subBreed in url[breed]) {
            console.log(subBreed + "");
            inner += "<option value=\"" + url[breed][subBreed] + "\">" + url[breed][subBreed] + "</option>";
        }
        subBreedSelect.innerHTML = inner;
        subBreedDropdownWithLabel.style.display = "inline";
    }
    else
        subBreedDropdownWithLabel.style.display = "none";
}

function viewBreed(imageGrabAttempt) {
    // A do-while is put here to give the API 3 attepts of producing a random image that is not undefined
    do {
        let breedSelect = document.querySelector('#breedDropdown');

        let subBreed = '';
        let subBreedSelect = document.querySelector('#subBreedDropdown');
        if (subBreedSelect.style.display == "inline") {
            subBreed = '/' + subBreedSelect.options[subBreedSelect.selectedIndex].value
        }

        let request = 'https://dog.ceo/api/breed/' + breedSelect.options[breedSelect.selectedIndex].value + subBreed + '/images';

        // get the json from the server
        let json = httpGet(request);

        // decode the json into an array
        let array = JSON.parse(json);


        // get the image url from the array
        let url = array.message;

        // get the image object
        let image = document.querySelector('#dogImage');

        let selectedImage = url[Math.round(Math.random() * url.length)];

        if (selectedImage == undefined) {
            console.log("Image not OK!");
            imageGrabAttempt += 1;
            console.log("Retrying, Attempt: " + imageGrabAttempt);
        }
        else {
            imageGrabAttempt = -1
            console.log("Image loaded - " + selectedImage);
            image.src = selectedImage;
        }
    } while (imageGrabAttempt != -1 && imageGrabAttempt <= 3);

}
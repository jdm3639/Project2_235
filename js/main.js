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

// when the user selects a new item from the drop down
function contentTypeChanged() {
    let loadContentButton = document.querySelector('#LoadButton');
    let gameModeSelect = document.querySelector('#gameMode');

    // if the user selects the "Look a photos of a breed" then change the load button text to "Load Breed Finder"
    if (gameModeSelect.selectedIndex == 2) {
        loadContentButton.innerHTML = "Load Breed Finder";
    }
    // else if it is the game then chang ethe button to say "Load game"
    else {
        loadContentButton.innerHTML = "Load Game";
    }
}

// when the load button is pressed ["Guess the Breed" or "Look a photos of a breed" button]
function loadContent() {
    let contentDiv = document.querySelector('#content');

    let gameModeSelect = document.querySelector('#gameMode');

    // load the "Look a photos of a breed" content
    if (gameModeSelect.selectedIndex == 2) {
        listAllBreeds();
    }
    else
    // else load the game content with difficulty
    {
        loadGame(gameModeSelect.selectedIndex, 0, 0)
    }
}

// Loads a round of the game
//
// difficultyID: the id of it's difficulty [0 = Easy, 1 = Hard]
// round: the current round
// points: the current points
function loadGame(difficultyID, round, points) {
    // translate the difficultyID to a string ["Easy" or "Hard"]
    let difficulty = (difficultyID == 0 ? "Easy" : "Hard");
    // grab the game display
    let gameDisplayDiv = document.querySelector('#gameDisplay');
    // clear the game display (will clear the content from previous rounds in it)
    gameDisplayDiv.innerHTML = "";

    // get the highscore for localstorage, if no highscore is set in localstorage then it will be null
    let highscore = window.localStorage.getItem("highscore" + difficultyID);

    // if it is null then just set it to zero
    if (highscore == null)
        highscore = 0;

    // create the text node for the highscore display
    let highscoreDisplay = document.createTextNode("Highscore [" + difficulty + "]: " + highscore);

    // if the game is over
    if (round == 10) {
        // display the game result
        gameDisplayDiv.innerHTML = "Game Over<br>Points: " + points + "/10";
        // if the highscore has been broken then save the new highscore to localstorage
        if (points > highscore) {
            window.localStorage.setItem("highscore" + difficultyID, points);
        }
        // return here, no need to load the rest of the game
        return;
    }

    // grabs the number of images the game will spawn, depending on the difficulty
    let imagesInRound = (difficultyID == 0 ? 3 : 5);
    // selects a random image index out of the number of 'imagesInRound'
    let correctImageID = Math.floor(Math.random() * imagesInRound);
    // loads a random correct breed
    let correctDogBreed = getRandomDogBreed();

    // Builds the Game Info Div
    let topDisplay = document.createTextNode("Difficulty: " + difficulty);
    let topDisplay2 = document.createTextNode((10 - round) + " round" + ((10 - round) == 1 ? "" : "s") + " left ");
    let topDisplay3 = document.createTextNode("Points: " + points + "/10");
    let topDisplay4 = document.createTextNode("Click the " + correctDogBreed.replace('/', ' ') + ".");
    let gameInfoDiv = document.createElement("div");
    gameInfoDiv.appendChild(topDisplay);
    gameInfoDiv.appendChild(document.createElement("br"));
    gameInfoDiv.appendChild(topDisplay2);
    gameInfoDiv.appendChild(document.createElement("br"));
    gameInfoDiv.appendChild(topDisplay3);
    gameInfoDiv.appendChild(document.createElement("br"));
    gameInfoDiv.appendChild(highscoreDisplay);
    gameInfoDiv.id = "gameInfo";
    gameDisplayDiv.appendChild(gameInfoDiv);
    gameDisplayDiv.appendChild(document.createElement("br"));
    gameDisplayDiv.appendChild(topDisplay4);
    gameDisplayDiv.appendChild(document.createElement("br"));
    gameDisplayDiv.appendChild(document.createElement("br"));
    // End of Building the Game Info Div

    // For loop to create all imgs loaded from the API
    for (let i = 0; i < imagesInRound; i++) {
        let randomDogBreed = undefined;

        // if the correct dog breed index is not this iteration of the loop then grab a random dog breed that is NOT the same as the correct one
        if (correctImageID != i) {
            // to ensure their are no duplicate correct dog breeds
            do {
                randomDogBreed = getRandomDogBreed();
            } while (correctDogBreed == randomDogBreed)
        } else {
            // if the correct dog breed index is this iteration of the loop then set it to the correct dog breed
            randomDogBreed = correctDogBreed;
        }

        // build request
        let request = 'https://dog.ceo/api/breed/' + randomDogBreed + '/images';
        // get the json from the server
        let json = httpGet(request);
        // decode the json into an array
        let array = JSON.parse(json);
        // get the image url from the array
        let url = array.message;

        // grab an image src with 3 attempts, this is a fail safe for images broken in the API
        let imageSrc = urlImageGrabWithAttempts(url);

        // create an IMG for the dog image 
        let dogImage = document.createElement("IMG");
        // set it to the dogGameImage class
        dogImage.className = "dogGameImage";
        // set the src
        dogImage.src = imageSrc;

        // the event for an on click of the correct image
        if (correctImageID == i) {
            dogImage.onclick = function () {
                // load a new round[+1] with points[+1]
                loadGame(difficultyID, round + 1, points + 1)
            };
        } else
        // else if the wrong image was clicked
        {
            dogImage.onclick = function () {
                // load a new round[+1] with no points earned
                loadGame(difficultyID, round + 1, points)
            };
        }

        // add the image to the game display
        gameDisplayDiv.appendChild(dogImage);
    }

}

// grab an image src from a url returned request with 3 attempts, this is a fail safe for images broken in the API
function urlImageGrabWithAttempts(url) {
    let imageSrc = "";
    let imageGrabAttempt = 0;
    do {
        let selectedImage = url[Math.round(Math.random() * url.length)];

        // if the image is not avaliable or broken in the API, then attempt again
        if (selectedImage == undefined) {
            console.log("Image not OK!");
            imageGrabAttempt += 1;
            console.log("Retrying, Attempt: " + imageGrabAttempt);
        }
        else
        // if the image is good then we no longer need to loop the API request
        {
            imageGrabAttempt = -1
            console.log("Image loaded - " + selectedImage);
            // set the imageSrc to the image link from the API
            imageSrc = selectedImage;
        }
    } while (imageGrabAttempt != -1 && imageGrabAttempt <= 3);

    return imageSrc;
}

// get a random dog breed and possible sub breed
function getRandomDogBreed() 
{
    // get an object of all the breeds and sub breeds
    let json = httpGet('https://dog.ceo/api/breeds/list/all');
    let array = JSON.parse(json);
    let url = array.message;

    // get an random breed id from the object
    let breedID = Math.floor(Object.keys(url).length * Math.random());
    // get that breed name
    let breedName = Object.keys(url)[breedID];
    let subBreedID = 0;
    // if this breed has any sub breeds
    if (url[breedName].length > 0) {
        // if so get a random sub breed id from that list
        subBreedID = Math.floor(url[breedName].length * Math.random());
    }

    // get that sub breed name
    let subBreedName = url[breedName][subBreedID];
    // if a sub breed exist then return with it
    if (subBreedName != undefined)
        return breedName + "/" + subBreedName;
    else
        return breedName;
}

// sets up the drop downs for selecteing breeds
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

    inner += "<button onClick=\"viewBreed()\">View Breed</button>"
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
    let subBreedDropdownWithLabel = document.querySelector('#subBreedDropdownWithLabel');
    // if it has sub breeds, then create a sub breed dropdown and set it to be visible
    if (url[breed].length > 0) {

        let inner = "";
        for (let subBreed in url[breed]) {
            console.log(subBreed + "");
            inner += "<option value=\"" + url[breed][subBreed] + "\">" + url[breed][subBreed] + "</option>";
        }
        subBreedSelect.innerHTML = inner;
        subBreedDropdownWithLabel.style.display = "inline";
    }
    else // if there are no sub breeds hide this select
        subBreedDropdownWithLabel.style.display = "none";
}

// view a breed from the dropdown selects
function viewBreed() {
    // get the selected breed dropdown
    let breedSelect = document.querySelector('#breedDropdown');

    let subBreed = '';
    // get the selected sub breed dropdown
    let subBreedSelect = document.querySelector('#subBreedDropdown');
    if (subBreedSelect.style.display == "inline") {
        // save the sub breed to the let
        subBreed = '/' + subBreedSelect.options[subBreedSelect.selectedIndex].value
    }

    // build the request with the breed and possible sub breed
    let request = 'https://dog.ceo/api/breed/' + breedSelect.options[breedSelect.selectedIndex].value + subBreed + '/images';

    // get the json from the server
    let json = httpGet(request);

    // decode the json into an array
    let array = JSON.parse(json);

    // get the image url from the array
    let url = array.message;

    // get the image object
    let image = document.querySelector('#dogImage');

    // grab an image src with 3 attempts, this is a fail safe for images broken in the API
    // set that src to the image.src
    image.src = urlImageGrabWithAttempts(url);

}
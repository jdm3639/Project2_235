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
    let image = document.getElementById('dogImage');

    // set the src of the image object
    image.src = url;
}

function loadGame() {
    let contentDiv = document.getElementById('content');

    let gameModeSelect = document.getElementById('gameMode');

    if (gameModeSelect.selectedIndex == 2) {
        listAllBreeds();
    } else {
        let gameDisplayDiv = document.getElementById('gameDisplay');
        gameDisplayDiv.innerHTML = "The game is still being prototyped<br>Try the \"Look at Photos of a Breed\" option to view by breed!";
    }
}

function listAllBreeds() {
    let json = httpGet('https://dog.ceo/api/breeds/list/all');

    let array = JSON.parse(json);

    let url = array.message;

    let inner = "<select id= \"breedDropdown\">";

    for (let property in url) {
        if (url.hasOwnProperty(property)) {
            console.log(property + "");
            inner += "<option value=\"" + property + "\">" + property + "</option>";
        }
    }

    inner += "</select>"

    inner += "<button onClick=\"viewBreed()\">View Breed</button>"
    inner += "<br><img id=\"dogImage\" src=\"https://dog.ceo/img/dog-api-logo.svg\">"

    let gameDisplayDiv = document.getElementById('gameDisplay');
    gameDisplayDiv.innerHTML = inner;

}

function viewBreed() {
    let breedSelect = document.getElementById('breedDropdown');

    let request = 'https://dog.ceo/api/breed/' + breedSelect.options[breedSelect.selectedIndex].value + '/images';

    // get the json from the server
    let json = httpGet(request);

    // decode the json into an array
    let array = JSON.parse(json);


    // get the image url from the array
    let url = array.message;

    // get the image object
    let image = document.getElementById('dogImage');

    let selectedImage = url[Math.round(Math.random() * url.length)];

    // set the src of the image object
    image.src = selectedImage;
}
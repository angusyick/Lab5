// script.js

const img = new Image(); // used to load image from <input> and draw to canvas

//initialize canvas
const canvas = document.getElementById('user-image');
const ctx = canvas.getContext('2d');

//initialize buttons
var submit = document.querySelector("[type='submit']");
var clear = document.querySelector("[type='reset']");
var readText = document.querySelector("[type='button']");
var voiceSel = document.getElementById('voice-selection');

//find path of img source
const input = document.querySelector('#image-input');
const log = document.getElementById('values');
input.addEventListener('input', updateValue);
function updateValue(e) {
  var file = document.getElementById("#image-input");
  img.src = URL.createObjectURL(this.files[0]);
}

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {

  //clear form
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  //fill canvas with black
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //gets parameters for meme image
  var imgObj = getDimensions(canvas.width, canvas.height, img.width, img.height);

  //displays meme image
  ctx.drawImage(img, imgObj.startX, imgObj.startY, imgObj.width, imgObj.height);

  //toggle buttons
  submit.disabled = false;
  clear.disabled = true;
  readText.disabled = true;
  voiceSel.disabled = true;
});

var topText;
var botText;

//when generate is clicked:
submit.addEventListener('click', () => {

  //initialize text
  topText = document.getElementById('text-top').value;
  botText = document.getElementById('text-bottom').value;

  //prevent page refreshing
  event.preventDefault();

  //format and place text
  ctx.textAlign = 'center';
  ctx.fillStyle = 'white';
  ctx.font = '40px Impact';
  ctx.fillText(topText, canvas.width/2, 40);
  ctx.fillText(botText, canvas.width/2, canvas.height - 5);
  ctx.strokeText(topText, canvas.width/2, 40);
  ctx.strokeText(botText, canvas.width/2, canvas.height - 5);

  //toggle buttons
  submit.disabled = true;
  clear.disabled = false;
  readText.disabled = false;
  voiceSel.disabled = false;
});

//when clear is clicked:
clear.addEventListener('click', () => {

  //clears canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  //toggles buttons
  submit.disabled = false;
  clear.disabled = true;
  readText.disabled = true;
  voiceSel.disabled = true;

  //resets image
  input.value = "";
});

var allVoices;

//populate the voice list
if(typeof speechSynthesis !== 'undefined') {
  function populateVoiceList() {

    //initializes the voice list
    allVoices = speechSynthesis.getVoices();

    //creates the voice options
    for(var i = 0; i < allVoices.length; i++) {
      var option = document.createElement('option');
      option.textContent = allVoices[i].name + ' (' + allVoices[i].lang + ')';

      if(allVoices[i].default) {
        option.textContent += ' -- DEFAULT';
      }

      option.setAttribute('data-lang', allVoices[i].lang);
      option.setAttribute('data-name', allVoices[i].name);
      voiceSel.appendChild(option);
    }

    //removes the none option
    voiceSel.remove(0);
  }

  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
  }
}

//when read text is clicked:
readText.addEventListener('click', () => {

  //initializes the utterance and selection
  var utterance = new SpeechSynthesisUtterance(topText + " " + botText);
  var selectedOption = voiceSel.selectedOptions[0].getAttribute('data-name');

  //search for selection
  for(var i = 0; i < allVoices.length ; i++) {
    if(allVoices[i].name === selectedOption) {
      utterance.voice = allVoices[i];
    }
  }

  utterance.volume = volumeSetting;

  //say words
  speechSynthesis.speak(utterance);
});

var volumeSetting = 1;
var volumeChoice = document.querySelector("[type='range']");
var volumeIcon = document.querySelector("[src = 'icons/volume-level-3.svg']");

volumeChoice.addEventListener('input', () => {
    volumeSetting = volumeChoice.value / 100;

    if(volumeChoice.value == 0){
      volumeIcon.src="icons/volume-level-0.svg";
    }
    else if(volumeChoice.value >=1 && volumeChoice.value <= 33){
      volumeIcon.src="icons/volume-level-1.svg";
    }
    else if(volumeChoice.value >=34 && volumeChoice.value <= 66 ){
      volumeIcon.src="icons/volume-level-2.svg";
    }
    else if(volumeChoice.value >=67 && volumeChoice.value <= 100){
      volumeIcon.src="icons/volume-level-3.svg";
    }
});

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}

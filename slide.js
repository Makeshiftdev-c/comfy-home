const holder = document.querySelector(".hero");

let i = 0;
let images = [];
let time = 5000;

images[0] = "url('./images/hero1.jpg')";
images[1] = "url('./images/hero2.jpg')";
images[2] = "url('./images/hero3.jpg')";
images[3] = "url('./images/hero4.jpg')";

function changeImage() {
  holder.style.backgroundImage = images[i];

  if (i < images.length - 1) i++;
  else i = 0;

  setTimeout("changeImage()", time);
}

window.onload = changeImage;

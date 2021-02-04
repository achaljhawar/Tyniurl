let qrcode = document.querySelector("img");
let qrtext = document.querySelector("input");
var qrbtn = document.getElementById("qrcodegen");
var textWrapper = document.querySelector('.ml10 .letters');

textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='letter'>$&</span>");

anime.timeline({loop: false})
  .add({
    targets: '.ml10 .letter',
    rotateY: [-90, 0],
    duration: 1300,
    delay: (el, i) => 45 * i
  }).add({
    targets: '.ml10',
    duration: 400,
    easing: "easeOutExpo",
    delay: 1000
 });

function generateQR() {
  let size = "1000x1000";
  let data = qrtext.value;
  let baseURL = "http://api.qrserver.com/v1/create-qr-code/";

  let url = `${baseURL}?data=${data}&size=${size}`;

  qrcode.src = url;
  downloadBtn.href = url;
  qrtext.value = "";
}

function lightmode(){
	document.querySelector('body').style.backgroundColor = "#ffffff"
	document.querySelectorAll('.switch').forEach(el => el.style.color = "")
}

function darkmode(){
	document.querySelector('body').style.backgroundColor = "#000000"
	document.querySelectorAll('.switch').forEach(el => el.style.color = "#ffffff")
}

window.onload = ()=>{
	url = unescape(document.location.search.slice(1, document.location.search.length))
	if(isJson(url)){
		url = JSON.parse(url)
		if("url" in url && "short" in url){
			document.querySelector("h5").innerHTML = `<a href="${url.url}">${url.url}</a>, Shortened at 👉 <a id="p1" href="https://tyni.achaljhawar.repl.co/${url.short}">https://tyni.achaljhawar.repl.co/${url.short}</a>         <button onclick="copyToClipboard('#p1')" class="btn btn-success">Copy Short Url</button>`
			document.getElementById('fullUrl').value = url.url
			document.getElementById('successalert').innerHTML = `<div id="success" class="alert alert-success fade show"><strong>✅ Success!</strong> Your url has been generated<button id="close" type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`
			document.getElementById('close').onclick = close;
		}else if("error" in url){
			document.getElementById('successalert').innerHTML = `<div id="success" class="alert alert-danger fade show"><strong>❗ ERROR </strong> ${url.error}<button id="close" type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`
		}
	}
}

function close(){
		document.getElementById('successalert').innerHTML = ''
}

function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function showurl(){
}

function copyToClipboard(element) {
  var $temp = $("<input>");
  $("body").append($temp);
  $temp.val($(element).text()).select();
  document.execCommand("copy");
  $temp.remove();
}

$(function() {
      $(".loader").fadeOut(10000, function() {
  });
});

qrbtn.addEventListener("click", generateQR);
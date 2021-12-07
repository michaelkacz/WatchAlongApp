'use strict'

// Prepare the Multipeer Namespace
function prepareNamespace(hash, set_location) {
  // remove # from the hash
  let ns = hash.replace(/^#/, '');
  if (/^[a-z]{3}-[a-z]{3}-[a-z]{3}$/.test(ns)) {
    console.log(`Checked existing namespace '${ns}'`);
    return ns;
  }
  ns = generateRandomAlphaString('-', 3, 3, 3);
  console.log(`Created new namespace '${ns}'`);
  if (set_location) window.location.hash = ns;
  return ns;
}

function generateRandomAlphaString(separator, ...groups) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  let ns = [];
  for (let group of groups) {
    let str = '';
    for (let i = 0; i < group; i++) {
      str += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    ns.push(str);
  }
  return ns.join(separator);
}

/**
David start
*/



/**
David end
*/



/**
Michael start
*/
const inputusername = document.getElementById('your-username');
const createbutton = document.getElementById('CreateFormButton');
if (createbutton) {
  createbutton.onclick = function createURL() {
    location.href = '../party-room';
    sessionStorage.setItem('name', inputusername.value);
    console.log('Username: ', inputusername.value);
  }}

const joinusername = document.getElementById('your-join-username');
const joininput = document.getElementById('RoomID');
const joinparty = document.getElementById('JoinFormButton');
if (joinparty) {
  joinparty.onclick = function joinURL(e) {
    e.preventDefault();
    location.href = '../party-room/#' + joininput.value;
    sessionStorage.setItem('name', joinusername.value);
    console.log('Username: ', joinusername.value);
  }}

//function to close chat
const closechat = document.getElementById('closechat');
if (closechat) {
closechat.onclick = function (){
  const form = document.getElementById('chatform');
  const title = document.getElementById('chat-head');
  const open = document.getElementById('openchat');
  const article = document.getElementById('data');
  const dark = document.getElementById('dark');
  const light = document.getElementById('light');
    if (form.style.display === "block" && title.style.display === "block") {
        article.style.background = "none";
        article.style.border = "0px";
        form.style.display = "none";
        title.style.display = "none";
        closechat.style.display = "none";
        dark.style.display = "none";
        light.style.display = "none";
        open.style.display = "block";
        console.log('Chat Closed!');
    }
    else {
            form.style.display = "block";
            title.style.display = "block";
            closechat.style.display = "block";
            open.style.display = "none";
    }}};

//function to open chat
const openchat = document.getElementById('openchat');
if (openchat) {
openchat.onclick = function() {
  const form = document.getElementById('chatform');
  const title = document.getElementById('chat-head');
  const open = document.getElementById('openchat');
  const article = document.getElementById('data');
  const dark = document.getElementById('dark');
  const light = document.getElementById('light');
    if (form.style.display === "none" && title.style.display === "none") {
         article.style.background = "#FF8040";
         article.style.border = "4px solid #000000";
         form.style.display = "block";
         title.style.display = "block";
         closechat.style.display = "block";
         dark.style.display = "block";
         light.style.display = "block";
         open.style.display = "none";
         console.log('Chat Opened!');
    }
    else {
            form.style.display = "none";
            title.style.display = "none";
            closechat.style.display = "none";
            open.style.display = "block";
    }}};

//dark mode function
const dark = document.getElementById('dark');
if (dark) {
  dark.onclick = function() {
    const article = document.getElementById('data');
    const title = document.getElementById('chat-head');
        title.style.color = "#FFFFFF"
        title.style.borderBottom = "4px solid #1E3F66";
        article.style.background = "#000000";
        article.style.border = "4px solid #1E3F66";
  }}

//light mode function
const light = document.getElementById('light');
if (light) {
  light.onclick = function() {
    const article = document.getElementById('data');
    const title = document.getElementById('chat-head');
        title.style.color = "#000000";
        title.style.borderBottom = "4px solid #FAC898";
        article.style.background = "#FF8040";
        article.style.border = "4px solid #000000";
  }}

/**
Michael end
*/



/**
Chiachi start
*/


/**
Chiachi end
*/


const history = []

let personas = []
let voice = 'main'
let type = ''
let audio = 0
const vid = document.getElementById('virtual')


let isTTS = 1//= //document.querySelector('#MAIN input[name=m_tts]:checked').value
/*
var deferredPrompt;

window.addEventListener('beforeinstallprompt', function(e) {
  //alert('beforeinstallprompt Event fired');
  e.preventDefault();

  // Stash the event so it can be triggered later.
  deferredPrompt = e;

  return false;
})
*/

//function login(){

  //$.tts('안녕 나는 데이빗이라고 해 만나서 반가워!')
  //document.body.requestFullscreen()
//  $.load('BOT')
//}


const urlParams = new URLSearchParams(window.location.search);
const mode = urlParams.get('mode')
if(mode){
  $.mode = mode

}

async function create(){
  remove()
  //type = build('main')

}

async function init(){
  const list = []
  let param = `&service=ios`
  const resp = await fetch(`/v1/medias?${param}`)
  const items = await resp.json()

  console.log( items.length)

  for(const item of items){ // add filter for iphone
    //if(urlParams.get('service') == 'ios' && ["porn","hentai","sexy"].indexOf(item.nsfw) > -1 && item.conf > 0.4)
    //  continue
    console.log(item)

    //if(item.type == 'mp4')
    // list.push(`<div class='item'><video controlsList="nodownload" controls id='_${item.fileId}' preload='auto' class='square' src='/v1/media/${item.fileId}?type=mp4&length=${item.length}'></video></div>`) // <p class='black'>${item.prompt}</p>
    //else
      list.push(`<img class='item' src='/v1/media/${item.fileId}'></img>`)

  }

  //for(const item of list)
    document.querySelector('section[name=works]').innerHTML = list.join('')

}


async function init2(){
  const list = []
  let param = `&service=ios&userId=rippertnt`
  const resp = await fetch(`/v1/medias?${param}`)
  const items = await resp.json()

  console.log( items.length)

  for(const item of items){ // add filter for iphone
    //if(urlParams.get('service') == 'ios' && ["porn","hentai","sexy"].indexOf(item.nsfw) > -1 && item.conf > 0.4)
    //  continue
    console.log(item)

    if(item.type == 'mp4')
      list.push(`<div class='item'><video controlsList="nodownload" controls id='_${item.fileId}' preload='auto' class='square' src='/v1/media/${item.fileId}?type=mp4&length=${item.length}'></video></div>`) // <p class='black'>${item.prompt}</p>
    else
      list.push(`<img class='item' src='/v1/media/${item.fileId}'></img>`)

  }

  //for(const item of list)
    document.querySelector('section[name=me]').innerHTML = list.join('')

}

//init()
//init2()

function home(){
  document.getElementById("LOGIN").style.display = 'none'
  document.getElementById("SIGNIN").style.display = 'none'

  if(_.id == 'MAIN')
    return

  const oldId = _.id
  document.getElementById(_.id).className = `animate__animated animate__fadeOut`
  document.getElementById("MAIN").style.display = 'block'
  document.getElementById("MAIN").className = `animate__animated animate__fadeIn`

  setTimeout(()=>{
    document.getElementById(oldId).style.display = 'none'
    //_.id = 'MAIN' 
  },1000)
  
  _.id = 'MAIN'
}


async function account(){
  if(_.userId != 'guest'){
    
    const isLogout = confirm(`Logout - ${_.userId}?`)

    if(isLogout){
      _.userId = 'guest'
      localStorage.setItem('email','')
      localStorage.setItem('userId','')
      document.querySelector('span[name=user]').innerText = 'guest'
    }

    return
  } else { // guest 이면 로그인 정보를 받아옴
    document.getElementById("LOGIN").style.display = 'block'
    return
  }
}

async function login(){

  if(_.userId != 'guest'){
    
    const isLogout = confirm(`Logout - ${_.userId}?`)

    if(isLogout){
      _.userId = 'guest'
      localStorage.setItem('email','')
      localStorage.setItem('userId','')
      document.querySelector('span[name=user]').innerText = 'guest'
    }

    return
  } 
  
  const userId = document.querySelector('#LOGIN input[name=id]').value
  const pass = document.querySelector('#LOGIN input[name=pass]').value
  //
  const email = userId
  const user = email.split('@')[0]

  const resp = await fetch(`/v1/account?email=${email}&userId=${userId}&pass=${pass}`)
  const ret = await resp.json()
  console.log(ret.data)
  switch(ret.data){
    case 0: // fail
      alert('Wrong email or password. Check again!')
      break;
    case 1: // pass

      localStorage.setItem('email',email)
      localStorage.setItem('userId',user)

      _.userId = userId
      document.querySelector('span[name=user]').innerText = user
      //document.querySelector('span[name=id]').innerText = userId
      document.getElementById('LOGIN').style.display = 'none'
      break;
    case 2: // new
      admission(userId,pass)
  }
  
}

async function admission(userId, pass){
  document.getElementById("LOGIN").style.display = 'none'
  document.getElementById("SIGNIN").style.display = 'block'

  if(userId)
    document.querySelector('#SIGNIN input[name=id]').value = userId

  if(pass)
    document.querySelector('#SIGNIN input[name=pass]').value = pass
}

async function siginin(){
  const id = document.querySelector('#SIGNIN input[name=id]').value
  const pass = document.querySelector('#SIGNIN input[name=pass]').value
  const pass2 = document.querySelector('#SIGNIN input[name=confirm]').value

  const token = id.split('@')
  const userId = token[0]
  const email = id

  let resp = await fetch(`/v1/account?email=${email}&userId=${userId}&pass=${pass}`)
  let ret = await resp.json()

  if(pass != pass2){
    alert('Password and confirmation is not equal!')
    return
  }
  
  resp = await fetch(`/v1/signup?email=${email}&userId=${userId}&pass=${pass}`)
  ret = await resp.json()

  localStorage.setItem('email',email)
  localStorage.setItem('userId',userId)

  _.userId = userId
  document.querySelector('span[name=user]').innerText = userId
  //document.querySelector('span[name=id]').innerText = user
  //document.querySelector('div[name=login]').style.display = 'none'
  //document.querySelector('div[name=logout]').style.display = 'block'


  document.getElementById("SIGNIN").style.display = 'none'
}





const email = localStorage.getItem('email')

if(email && email != null && email !=''){
  const user = email.split('@')[0]
  _.userId = user
  //document.querySelector('span[name=user]').innerText = user

  if($.getLanguage() == 'ko')
    document.querySelector('#MAIN .chat').innerText = `${user}님, 다시 만나서 반가워요!`
  else
    document.querySelector('#MAIN .chat').innerText = `Welcome back, ${user}!`
  /*
  document.querySelector('span[name=user]').innerText = user
  document.querySelector('span[name=id]').innerText = user
  //document.querySelector('input[name=email]').value = email

  document.querySelector('div[name=login]').style.display = 'none'
  document.querySelector('div[name=logout]').style.display = 'block'
  */
}

function logout(){

  localStorage.setItem('email','')
  localStorage.setItem('userId','')
  _.userId = 'guest'
  document.querySelector('span[name=user]').innerText = _.userId

  document.querySelector('div[name=login]').style.display = 'block'
  document.querySelector('div[name=logout]').style.display = 'none'
}

function keypress(evt){
  console.log('main_key')
  if(evt.which == 13 && !evt.shiftKey)
    search()

  
}

let upload = 0
let isVideo = 0

async function camera(evt){
  console.log('main_c')
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia ){
      // Navigator mediaDevices not supported
      alert("Media Device not supported")
      return;
  }

  alert(1)
  
  const devices = await navigator.mediaDevices.enumerateDevices()

  let deviceId = 0

  for (const dev of devices){
    if(dev.label.startsWith('USB Camera')){
      console.log(dev)
      deviceId = dev.deviceId
    }
  }


    // {exact : "66c6bec973440fbff0723856af75ae302bdf61a8e05fbd7f7ee144a7d0df7c47"}
    /*
    deviceId: "66c6bec973440fbff0723856af75ae302bdf61a8e05fbd7f7ee144a7d0df7c47"
groupId: "080b5c57513542a035ee703fa4d2e74ef0f0fe4702f4e37cd16e52f028ccf3a2"
kind:  "videoinput" 
label :  "USB Camera (0c45:6366)"
    */


    //console.log(data)
    //alert(JSON.stringify(data))
  //})
    

// {video: {width: {exact: 512}, height: {exact: 512}}
  navigator.mediaDevices.getUserMedia({video: {width: {exact: 1024}, height: {exact: 512}, deviceId: {
    exact: deviceId,
  }}}).then(stream=>{
    alert(2)
    //document.getElementById("capture").style.display = 'none'
    document.getElementById("cam").style.display = 'block'
    const cam = document.getElementById("cam")
    cam.srcObject = stream
    alert(3)
    console.log(cam.height, cam.width)
    //cam.play()
    isVideo = true
  }).catch(err=>{
    alert("Permission faield :", err)
  });

}

function image(evt){
  isVideo = 0
  console.log('main_i')
  document.getElementById("capture").style.display = 'block'
  document.getElementById("cam").style.display = 'none'
  const gallary = document.getElementById('gallary')
  gallary.click()
}

function remove(evt){
  //document.getElementById("capture").style.display = 'block'
  //document.getElementById("cam").style.display = 'none'

  isVideo = false

  //const canvas = document.getElementById('capture')
  //context.clearRect(0, 0, canvas.width, canvas.height)
  
  var img = new Image()
  img.src = '/image/import.gif'
  img.onload = function() {
    canvas = document.getElementById('capture')
    ctx = canvas.getContext("2d")
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img,0,0)
  }
    
  upload = 0
}

function setImage(url){
  var img = new Image()
  img.crossOrigin = 'Anonymous';
  img.src = url
  //img.crossOrigin = 'Anonymous';
  img.onload = function(){
    canvas = document.getElementById('capture')
    ctx = canvas.getContext("2d")
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img,0,0)

    canvas.toBlob(function(blob) {
      const form = new FormData();
      form.append('file', blob, Date.now());
      upload = form
    })

  }
}

function listen(){

  //$.listen()
  if(vid)
    vid.pause()  

  if(!isRecord){
    
    (new Audio("./sound/ye.mp3")).play()

    console.log("Recording started")
    isRecord = true
    $.query('[name=prompt]').className = 'listen'
    navigator.mediaDevices.getUserMedia({audio: true, video: false}).then(function(stream) {
      console.log("getUserMedia() success, stream created, initializing Recorder.js ...");

      audioContext = new AudioContext({sampleRate: 16000});

      // assign to gumStream for later use
      gumStream = stream;

      // use the stream
      input = audioContext.createMediaStreamSource(stream);

      // Create the Recorder object and configure to record mono sound (1 channel) Recording 2 channels will double the file size
      rec = new Recorder(input, {numChannels: 1})

      const options = {
        source: input,
        voice_stop: ()=> {
          console.log('voice_stop')
          isRecord = false
          console.log('record end')
          rec.stop(); //stop microphone access
          gumStream.getAudioTracks()[0].stop()
          rec.exportWAV(stt)
          (new Audio("./sound/face.mp3")).play()
        }, 
        voice_start: function() {console.log('voice_start');}
       }; 
       
       // Create VAD
       //const vad = new VAD(options);      

      //start the recording process
      rec.record()

    }).catch(function(err) {
        //enable the record button if getUserMedia() fails
        console.log(err)
        isRecord = false
        $.query('[name=prompt]').className = ''
        (new Audio("./sound/face.mp3")).play()
    });

  } else {

    isRecord = false
    console.log('record end')
    rec.stop(); //stop microphone access
    gumStream.getAudioTracks()[0].stop()
    rec.exportWAV(stt)
    (new Audio("./sound/face.mp3")).play()
  }
}

function stt(blob){
  var fd = new FormData();
  fd.append("file", blob, 'voice.wav')

  fetch(`/v1/stt`,{ //?prompt=${query}&temp=${temp}&lang=en
    method: 'POST',
    body: fd
  }).then(async res=>{
    const result = await res.json()
    console.log('end---',result)
    $.query('[name=prompt]').value = result.data.text
    if($.query('[name=prompt]').value.length > 0)
      search()    
  })

}

async function processImage(event){

  //document.querySelector('aside[name=generate]').style.visibility = 'visible'
  //document.querySelector('aside[name=generate] input').value = ''
  //document.querySelector('aside[name=generate] input').focus()
  console.log('process image')
  const files = event.target.files;

  const reader = new FileReader()
  reader.readAsDataURL(files[0]);  
  reader.onload = function(e){
    var img = new Image()
    img.src = e.target.result
    img.onload = function(){
      canvas = document.getElementById('capture')
      ctx = canvas.getContext("2d")
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img,0,0)
      //const cam = document.getElementById("cam")
      //cam.poster = img
    }
  }
 
  form = new FormData()
  form.append('file', files[0])
  upload = form

  /*
  EXIF.getData(files[0], function() {
    var allMetaData = EXIF.getAllTags(this)
    console.log('exif',allMetaData)
  })
  */  
}


function getType(){
  if(voice == 'woman1')
    return 'counselor'
  else if (voice == 'man1' )
    return 'teacher'
  else 
    return 'assist'
}

function persona(v){
  voice = $.query('select[name=persona]').value
  console.log('persona',voice)
  //type = build(voice)

  document.getElementById('virtual').poster = `/image/${voice}.gif`
  

  const elem = document.querySelector('#MAIN ul[name=chats]')

  const bot = document.createElement('li')
  bot.className = 'chat user'
  bot.innerHTML = type.replace('Your','My')

  elem.appendChild(bot)
  elem.scroll({ top: elem.scrollHeight }) //, behavior: "smooth"})
}

function human(){
  if(isTTS){
    document.querySelector("#INDEX video.output").classList.add('gray')
    isTTS = 0
  } else {
    document.querySelector("#INDEX video.output").classList.remove('gray')
    isTTS = 1
  }
}

const bots =  [
  'news',    'trend',
  'weather', 'dust',
  'music',   'letter',
  'book', 'movie', 'image'
]

function checkBot(cmd){
  console.log(`checkbot [${cmd}]`)
  for(const bot of bots){
    if(cmd.indexOf(bot) > -1)
      return bot
  }

  

  return false
}


async function search(isSkip=false){
  let pos = 0
  let lang = 'en'
  
  let prompt = document.querySelector('#MAIN [name=prompt]').value + ""

  if(prompt.length < 1) // too short
    return

  let query = prompt
  let org = prompt

  const temp =  0.5 //= //document.querySelector('#MAIN input[name=m_temp]:checked').value
  //const isTTS = 1//= //document.querySelector('#MAIN input[name=m_tts]:checked').value

  document.querySelector('#MAIN [name=prompt]').value = ''

  const user = document.createElement('li')
  user.className = 'chat bot'
  user.innerHTML = prompt.replace(/\n/gi, "</br>")

  const elem = document.querySelector('#MAIN ul[name=chats]')
  elem.appendChild(user)

  const bot = document.createElement('span')
  bot.className = 'chat user'
  bot.textContent = '...'
  elem.appendChild(bot)
  elem.scroll({ top: elem.scrollHeight })//, behavior: "smooth"})

  const td = new TextDecoder() // lang auto

  const form = new FormData()
  form.append('prompt',prompt.replace(/\n/gi, ""))

  isVideo = 0
   
  if(query.toLowerCase().startsWith('draw') || query.toLowerCase().startsWith('paint') ){
    bot.textContent = 'Drawing the image...'
    setImage(`${lb.getGen()}/v1/txt2photo?sentence=${query}&w=512&h=512`)
  } else if(upload == 0 && isVideo == 0){
    console.log('------------------------ chat....--------------')

    bot.textContent = 'waiting answer...'
    fetch(`/v1/txt2chat`,{
      method : "POST",
      headers : {
        "Content-Type" : 'application/json'
      }, // prompt=${query}&temp=${temp}&lang=en`
      body : JSON.stringify({
        prompt : query.replace(/\n/gi, ""),
        history : [],//history.slice(-2),
        type,
        pos,
        org, 
        temp : temp,
        //lang : 'en'
      })

    }).then(async resp=>{
      const reader = resp.body.getReader()
      const chunks = []
  
      let done, value, result
      while(!done) {
        ({value, done} = await reader.read())
        if(done){
          console.log('finish2', bot.innerHTML.replace(/\n/gi, "</br>"))
          chunks.push(td.decode(value))
          bot.innerHTML = chunks.join('') //.replace(/\n/gi, "</br>") //.replace(/\n/gi, "</br>")
          (new Audio(`/v1/tts?text=${bot.innerHTML}&voice=10`)).play()
          elem.scroll({ top: elem.scrollHeight}) // , behavior: "smooth"})


          vid.onended = ()=>{
            vid.src = ''
          }

          vid.oncanplaythrough = ()=>{
            
          }

  
          elem.scroll({ top: elem.scrollHeight })//, behavior: "smooth"})
  
          break
        }
        chunks.push(td.decode(value))
        //console.log(value,td.decode(value))
        //console.log(value.indexOf('\n') > -1, td.decode(value).indexOf('\n') > -1)
        bot.innerHTML = chunks.join('').replace(/\n/gi, "</br>") //.replace(/\n/gi, "</br>")
        elem.scroll({ top :9999999, behavior:"smooth"})
      }
      
    }).catch(e=>{
      console.error(e)
      return
    })

   } else {
    bot.textContent = 'waiting answer...'

    if(isVideo){
      const cam = document.getElementById("cam")
      const canvas = document.getElementById('capture')
      ctx = canvas.getContext("2d")
      //canvas.width = cam.width;
      //canvas.height = cam.height;
      console.log(cam, cam.width)
      
      ctx.drawImage(cam,0,0,512,512)

      const blob = await new Promise(resolve => canvas.toBlob(resolve))
      console.log(blob)
      const form = new FormData();
      form.append('file', blob, Date.now())
      upload = form 
    }

    //upload.append('prompt',query)
    //upload.append('temp',temp)
    //upload.append('lang','en')

    fetch(`/v1/img2chat?prompt=${query}&temp=${temp}`,{
      method: 'POST',
      body: upload
    }).then(async resp=>{
      const reader = resp.body.getReader()
      const chunks = []
  
      let done, value, result
      while(!done) {
        ({value, done} = await reader.read())

        if(done){
            
          if(done){
            const vt = bot.innerHTML.replace(/\n/gi, "</br>")
            console.log('finish2', vt)
            const audio = new Audio(`/v1/tts?text=${vt}&voice=10`)
            
            //chunks.push(td.decode(value))
            //bot.innerHTML = chunks.join('') //.replace(/\n/gi, "</br>") //.replace(/\n/gi, "</br>")
            audio.play()
            elem.scroll({ top: elem.scrollHeight}) // , behavior: "smooth"})
            
          }
          elem.scroll({ top: elem.scrollHeight })//, behavior: "smooth"})
        }

        chunks.push(td.decode(value))
        console.log('chunk',td.decode(value))
        bot.innerHTML = chunks.join('').replace(/\n/gi, "</br>")
        elem.scroll({ top :9999999, behavior:"smooth"})
      }
    }).catch(e=>{
      console.error(e)
      return
    })    
   }

  setTimeout(function() {
    document.querySelector('#MAIN [name=prompt]').focus();
  }, 100);
}

setTimeout(function() {
  document.querySelector('#MAIN [name=prompt]').focus();
}, 100);

function full(){
  if (document.documentElement.requestFullscreen) {
    alert('full page')
    document.documentElement.requestFullscreen()
 } else [
    alert('not allowed')
 ]
}

function listen(){
  //document.documentElement.requestFullscreen()
  $.listen()
  $.query('[name=prompt]').className = 'listen'
}

function dragOverHandler(ev) {
  console.log("File(s) in drop zone");

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
}

async function dropHandler(ev) {
  ev.preventDefault()
  console.log("File(s) dropped",ev.dataTransfer.items);

  
  const file =  ev.dataTransfer.files[0]
  console.log(file)

  var img = new Image()
  img.src = URL.createObjectURL(file)
  //img.crossOrigin = 'Anonymous';
  img.onload = function(){
    canvas = document.getElementById('capture')
    ctx = canvas.getContext("2d")
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img,0,0)

    canvas.toBlob(function(blob) {
      const form = new FormData();
      form.append('file', blob, Date.now());
      upload = form
    })

  }


}

_.script['MAIN'] = {
  listening : text=>{
    $.query('[name=prompt]').value = text
  },
  listened : ()=>{
    $.query('[name=prompt]').className = ''

    if($.query('[name=prompt]').value.length > 0)
      search()
  }
}

if($.getLanguage() == 'ko')
  $.templete('/js/index.json','INDEX')

create()

document.querySelectorAll('nav button').forEach(elem=>{
  elem.addEventListener("click", ev=>{
    if(document.querySelector('nav button.clicked'))
      document.querySelector('nav button.clicked').classList.remove('clicked')
    elem.classList.add('clicked')
  })
})


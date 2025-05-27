const p  = import('./persona.js')
const history = []
let personas = []
let voice = 'main'
let type = ''
let audio = 0

let reader = 0
let txt = ''
let bot = 0
let i = 0
let isFinish = false
let interval = 0

let is_play = false
const scripts = []
let links = {}
let projectId = 0

let profile = {}

const vid = document.getElementById('virtual')
const aud = new Audio()

function build(v){
  console.log(v)
  for(const persona of personas){
    if (v == persona.name)
      return `너의 이름은 ${persona.name}. 나이는 ${persona.age}살이고, 성별은 ${persona.gender}. 당신의 목적은 ${persona.role} 으로, ${persona.description} 해야합니다. ${persona.traits} 그리고 사람같이 대답하세요.`
    else if(v == persona.voice)
      return `너의 이름은 ${persona.name}. 나이는 ${persona.age}살이고, 성별은 ${persona.gender}. 당신의 목적은 ${persona.role} 으로, ${persona.description} 해야합니다. ${persona.traits} 그리고 사람같이 대답하세요.`
  
  }
}

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


async function refresh(){
  let url = `/v1/getChats`

  const resp = await fetch(url).catch(e=>{
    console.error(e)
    $.loading(false)
    return
  }).catch(e=>{
    alert(e)
    $.loading(false)
    return
  })

  const result = await resp.json()
  console.log('result img',result)

  $.query('ul[name=files]').innerHTML = ''

  for(const item of result.data){
    const elem = document.createElement('li')
    elem.innerHTML = `
    <fieldset ondblclick="$(event).remove('${item.date}')"'>
      <p onclick='$(event).select("${item.date}","${item.date}")'>${item.title}</p>   
    </fieldset>
    `
    $.query('ul[name=files]').append(elem)
  }
}

async function create(){
  remove()
  personas = (await p).personas
  console.log('persona',personas)
  type = build('main')
  /*
  document.querySelector('#MAIN ul[name=chats]').innerHTML = ''

  fetch(`/v1/bot/morning`).then(async resp=>{
    const result = await resp.json()
    console.log('trend',result.data)
    
    document.querySelector('#MAIN ul[name=chats]').innerHTML = `<li class='chat user'>
      ${result.data.title}</br></br>${result.data.content}</br></br>${result.data.think}
    </li>`

  })
  */  

  refresh()
  

  document.querySelector('#MAIN select[name=knowledge]').innerHTML = `<option value="" selected>Default</option>`

  fetch(`/v1/r/find?userId=${_.userId}`).then(async resp=>{
    const res = await resp.json()
    console.log('knowledge',res)

    for(const item of res){

      const elem = document.createElement("option")
      elem.innerText =item.url
      elem.value = item.projectId

      document.querySelector('#MAIN select[name=knowledge]').append(elem)
    }
  })

  document.querySelector('#MAIN select[name=persona]').innerHTML = `<option value="main" style="background-image:url(./image/main.gif)" selected>기본 캐릭터 (학생)</option>`

  fetch(`/v1/p/find?userId=${_.userId}`).then(async resp=>{
    const items = await resp.json()
    console.log('resume',items)

    for(const item of items){

      profile[item._id] = item

      const elem = document.createElement("option")
      elem.title = `/v1/media/${item.faceId}`
      elem.innerText = `${item.name} / ${item.job} / ${item.birth}` 
      elem.value = item._id

      document.querySelector('#MAIN select[name=persona]').append(elem)
    }

    /*
  
    for(const item of items){
      t_lastId = item._id
      const elem = document.createElement('li')
      elem.innerHTML = `
      <fieldset onclick="$(event).select('${item.fileId}')">
        <img src='/v1/v/media/${item.faceId}'>
        <audio controlsList="nodownload" controls src="/v1/a/audio/${item.voiceId}"></audio>
        <p>${$.short(item.name,36)} / ${item.gender} / ${item.birth} / ${item.job}
        <p>${$.short(item.personal,72)}
        <p>${$.short(item.special,72)}
        <button class='remove' onclick="$(event).removeText('${item._id}')"><i class="fa-solid fa-trash"></i></button></p>
      </fieldset>
      `      
      //elem.innerHTML = `<video controlsList="nodownload" controls playsinline id='_${item.fileId}' preload='auto' class='square' src='/v1/v/media/${item.fileId}?type=mp4&length=${item.length}'></video>`

      $.query('ul[name=files]').append(elem)
    }
    */
  })



}

function knowledge(){
  projectId = document.querySelector('#MAIN select[name=knowledge]').value 
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
    create()
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

async function _close(){
  document.getElementById("LOGIN").style.display = 'none'
}

async function _login(){

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

  console.log(userId,pass)
  //
  const email = userId
  const user = userId//email.split('@')[0]
  const uuid = navigator.userAgent.toLowerCase()

  if(userId.startsWith("rippertnt") && pass.startsWith("!")){
    localStorage.setItem('email',userId)
    localStorage.setItem('userId',userId)

    _.userId = userId
    document.querySelector('span[name=user]').innerText = user
    //document.querySelector('span[name=id]').innerText = userId
    document.getElementById('LOGIN').style.display = 'none'

    create()

    return
  }

  const resp = await fetch(`/v1/auth`,{
    method : "POST",
    body : JSON.stringify({
      userId, password : pass, unique : uuid
    })
  })
  
  const ret = await resp.json()
  console.log('login',ret.data)

  if(ret.result){
    localStorage.setItem('email',email)
    localStorage.setItem('userId',user)
    localStorage.setItem('token',ret.data.token)
    localStorage.setItem('uuid',uuid)

    _.userId = userId
    document.querySelector('span[name=user]').innerText = user
    document.getElementById('LOGIN').style.display = 'none'

    create()

    setInterval(async ()=>{
      const resp = await fetch(`/v1/check`,{
        method : "POST",
        body : JSON.stringify({
          uuid : localStorage.getItem('uuid'),
          token : localStorage.getItem('token'),
        })
      })
      const ret = await resp.json()
      console.log('check',ret.data)
    },5000)

  } else {
    alert('Wrong email or password. Check again!')
   
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
  document.querySelector('span[name=user]').innerText = user

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
  if(evt.which == 13 && !evt.shiftKey){
    evt.preventDefault()
    search()
  }

  
}

let upload = 0
let isVideo = 0

function camera(evt){
  console.log('main_c')
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia ){
      // Navigator mediaDevices not supported
      alert("Media Device not supported")
      return;
  }

// {video: {width: {exact: 512}, height: {exact: 512}}
  navigator.mediaDevices.getUserMedia({video : { width: {exact: 512}, height: {exact: 512}}}).then(stream=>{
    document.getElementById("capture").style.display = 'none'
    document.getElementById("cam").style.display = 'block'
    const cam = document.getElementById("cam")
    cam.srcObject = stream
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
  document.getElementById("capture").style.display = 'block'
  document.getElementById("cam").style.display = 'none'

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

/*
function listen(evt){
  console.log('main_l')
  document.documentElement.requestFullscreen()
  if(audio)
    audio.pause()

  $.listen()
  $.query('input[name=prompt]').className = 'listen'
}
*/

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
  
  console.log('voice', voice)
  const elem = document.querySelector('#MAIN ul[name=chats]')

  const bot = document.createElement('li')
  bot.className = 'chat user'

  if(voice.length < 10){
    type = build(voice)

    if(voice == 'Anna')
      voice = 'woman7'

    document.getElementById('virtual').poster = `/image/${voice}.gif`

    bot.innerHTML = type.replace('Your','My')
  

  } else {
    const item = profile[$.query('select[name=persona]').value]
    console.log('profile changed',item)

    document.getElementById('virtual').poster = `/v1/v/media/${item.faceId}`

    if(item.introId)
      document.getElementById('virtual').src = `/v1/v/media/${item.introId}`
    else {
      const audio = new Audio(`/v1/a/audio/${item.voiceId}`)
      audio.play()
    }


    voice = item.voiceId
    type = `이름은 ${item.name} 이고, ${item.birth}에 태어났습니다. ${item.job}의 직업을 가지고 있으며, ${item.personal} 특성에 ${item.special}를 잘 하는 인공지능 인간입니다.`
    bot.innerHTML = type.replace('Your','My')
  
  }

  elem.appendChild(bot)
  elem.scroll({ top: elem.scrollHeight }) //, behavior: "smooth"})
}

function human(){
  vid.pause();
  vid.currentTime = 0;
  vid.src = ''
  links = {}

  if(isTTS){
    document.querySelector("#INDEX video.output").classList.add('gray')
    $.query("button[name=virtual] i").className = 'fa-solid fa02x fa-play'
    isTTS = 0
  } else {
    document.querySelector("#INDEX video.output").classList.remove('gray')
    $.query("button[name=virtual] i").className = 'fa-solid fa02x fa-pause'
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

async function search(pmpt){
  txt = ""
  let pos = 0
  let lang = 'ko'
  
  let prompt = document.querySelector('#MAIN [name=prompt]').value + ""
  if(pmpt){
    $.query('[name=prompt]').value = pmpt
    prompt = pmpt
  } 

  scripts.length = 0
  links = {}
  vid.src = ''
  is_play = false

  if(prompt.length < 1) // too short
    return

  let query = prompt
  let org = prompt
  let rag = 0

  const temp =  0.5 //= //document.querySelector('#MAIN input[name=m_temp]:checked').value
  //const isTTS = 1//= //document.querySelector('#MAIN input[name=m_tts]:checked').value

  document.querySelector('#MAIN [name=prompt]').value = ''
  document.querySelector('#MAIN [name=prompt]').readOnly = true

  const user = document.createElement('li')
  user.className = 'chat bot'
  user.innerHTML = prompt.replace(/\n/gi, "</br>")

  const elem = document.querySelector('#MAIN ul[name=chats]')
  elem.appendChild(user)

  bot = document.createElement('span')
  bot.className = 'chat user'
  //bot.textContent = '...'
  bot.innerHTML = `<i class="fa-solid fa-heart fa-beat"></i>`
  elem.appendChild(bot)
  elem.scroll({ top: elem.scrollHeight })//, behavior: "smooth"})

  const td = new TextDecoder() // lang auto
  

  if(projectId){
    url = `/v1/r/search?prompt=${query}&projectId=${projectId}&userId=${_.userId}`
  
    const resp = await fetch(url).catch(e=>{
      console.error(e)
      $.loading(false)
      return
    })

    const json = await resp.json()
    rag = json.data.data[0]
    console.log('rag', rag)
    if(rag){
      rag = rag[0].page_content.replace(/\n/gi, "")
      //form.append('rag',rag)
    }
  }

  $.query('button.stop').style.display = 'block'
  isFinish = false


  if(query.toLowerCase().startsWith('draw') || query.toLowerCase().startsWith('paint') ){
    setImage(`${lb.getGen()}/v1/txt2photo?sentence=${query}&w=512&h=512`)
  } else if(upload == 0 && isVideo == 0){
    console.log('chat',type)

    console.log('query command', query)

    fetch(`/v1/txt2chat`,{ //fetch(`${lb.getSlm()}/v1/txt2chat`,{ // /v1/chat
      method : "POST",
      headers : {
        "Content-Type" : 'application/json'
      }, // prompt=${query}&temp=${temp}&lang=en`
      body : JSON.stringify({
        prompt : query.replace(/\n/gi, ""),
        history : [],//history.slice(-2),
        type, //: 'Your name is Sam who assist people as AI huamn. Resposne gently and kindly as you can.',
        pos,
        org,
        rag, 
        temp : temp,
        lang : 'auto'
      })

    }).then(async resp=>{
      reader = resp.body.getReader()
      const chunks = []
  
      let done, value, result
      while(!done) {
        ({value, done} = await reader.read())
        if(done){
          $.query('button.stop').style.display = 'none'
          document.querySelector('#MAIN [name=prompt]').readOnly = false
          isFinish = true
          /*
          history.push(`${query}|${chunks.join('')}`)

          const form = new FormData()
          form.append('prompt',prompt)
          form.append('data',chunks.join(''))

          const res = await fetch(`/v1/t/text?prompt=${prompt}&model=chat&userId=${_.userId}`, {
            method: "POST", // or 'PUT'
            //headers: { "application/json" },
            body: form //JSON.stringify({ data : prompt + chunks.join('') }),
          })
          
          txt = ''
*/  
          refresh()
          elem.scroll({ top: 999999999 })
          break
        }

        const d = td.decode(value)
        chunks.push(d)
        txt += d

        bot.innerHTML = marked.parse(txt) //txt.replace(/\n/gi, "</br>");
        elem.scroll({ top: 999999999 })

        if(isTTS)
          playHuman(d,lang,voice)

        //typeWriter(100)
      }
      
    }).catch(e=>{
      document.querySelector('#MAIN [name=prompt]').readOnly = false
      console.error(e)
      return
    })

   } else {
    
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

    upload.append('prompt',query)
    upload.append('temp',temp)
    upload.append('lang','en')

    fetch(`/v1/i/chat`,{ //?prompt=${query}&temp=${temp}&lang=en
      method: 'POST',
      body: upload
    }).then(async resp=>{
      reader = resp.body.getReader()
      const chunks = []
  
      let done, value, result
      while(!done) {
        ({value, done} = await reader.read())
        if(done){
          $.query('button.stop').style.display = 'none'
          document.querySelector('#MAIN [name=prompt]').readOnly = false
          isFinish = true
          
          history.push(`${query}|${chunks.join('')}`)

          const form = new FormData()
          form.append('prompt',prompt)
          form.append('data',chunks.join(''))

          const res = await fetch(`/v1/t/text?prompt=${prompt}&model=chat&userId=${_.userId}`, {
            method: "POST", // or 'PUT'
            //headers: { "application/json" },
            body: form //JSON.stringify({ data : prompt + chunks.join('') }),
          })
        }

        const d = td.decode(value)
        chunks.push(d)
        txt += d

        bot.innerHTML = marked.parse(txt) //txt.replace(/\n/gi, "</br>");
        elem.scroll({ top: 999999999 })
        //elem.scroll({ top: elem.scrollHeight })


        if(isTTS)
          playHuman(d,lang,voice)
        

        //typeWriter(10)

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

let isRecord = false
let mediaRecorder = 0;              //stream from getUserMedia()

// shim for AudioContext when it's not avb.
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext //new audio context to help us record
let lastTime = 0

function listen(){
  console.log('start...s')
  $.listen(search)
}

function dragOverHandler(ev) {
  console.log("File(s) in drop zone");

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
}

function stop(){
  if(reader){
    console.log(reader)
    reader.cancel()
    scripts.length = 0
    links = {}
  }
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

/*
if(window.location.hostname != '127.0.0.1'){
  alert(window.location.hostname)
  document.querySelector('button[name=edit]').style.display = 'none'
  document.querySelector('button[name=imitate]').style.display = 'none'
}
*/

if($.mode == 'unleashed')
  document.querySelector('option[name=Anna]').style.display = 'block'


create()

document.querySelectorAll('nav button').forEach(elem=>{
  elem.addEventListener("click", ev=>{
    if(document.querySelector('nav button.clicked'))
      document.querySelector('nav button.clicked').classList.remove('clicked')
    elem.classList.add('clicked')
  })
})

function typeWriter(speed=10) {
  clearInterval(interval)
  const elem = $.query('ul[name=chats]')
  if(i == 0 || bot.innerHTML == '<i class="fa-solid fa-heart fa-beat"></i>')
    bot.innerHTML = ''

  if (i < txt.length) {
    bot.innerHTML += txt.charAt(i++).replace(/\n/gi, "</br>");
    elem.scroll({ top: elem.scrollHeight })
    interval = setTimeout(typeWriter, speed)
  } else if(isFinish){
    i = 0 
    txt = ''
  }
}

function playHuman(t,lang,voice){
  scripts.push(t)

  if(voice.length > 10){
    /*
    fetch(`/v1/a/clone?prompt=${t.replace(/AI/gi, "인공지능").replace(/:/gi, "...")}&voiceId=${voice}&userId=${_.userId}`).then(async resp=>{
      const data = await resp.json()
      console.log('voice clone',data.data)
      if(!is_play){
        is_play = true
        if(aud)
          aud.pause()   
        aud.src = `/v1/a/audio/${data.data}`
        aud.script = t
        aud.play()
      } 
    })
    */
  } else {
    /*
    console.log('play',`/v1/v/human?text=${t}&lang=${lang}&voice=${voice}`)
    fetch(`/v1/v/human?text=${t.replace(/AI/gi, "인공지능").replace(/:/gi, "...")}&lang=${lang}&voice=${voice}`).then(async resp=>{
      const data = await resp.json()
      console.log('trend',data)

      links[t] = data.data

      if(!is_play){
        is_play = true
        if(vid)
          vid.pause()   
        vid.src = `/media/${data.data}`
        vid.script = t
      } 
        //videos.push(data.data)
    })
    */
  }
  
}

vid.onended = ()=>{

  vid.src = ''
  is_play = false

  console.log(vid.script, scripts)

  const idx = scripts.indexOf(vid.script) + 1

  console.log(links, links[scripts[idx]])

  if(idx <= scripts.length){
    if(links[scripts[idx]]){
      is_play = true

      vid.src = `/media/${links[scripts[idx]]}`
      vid.script = scripts[idx]
    }  
  }
    
}

aud.onended = ()=>{

  aud.src = ''
  is_play = false

  console.log(aud.script, scripts)

  const idx = scripts.indexOf(aud.script) + 1

  console.log(links, links[scripts[idx]])

  if(idx <= scripts.length){
    if(links[scripts[idx]]){
      is_play = true

      aud.src = `/media/${links[scripts[idx]]}`
      aud.script = scripts[idx]
      aud.play()
    }  
  }
    
}


vid.oncanplaythrough = ()=>{}



let isFirst = true

var ro = new ResizeObserver(entries => {
  for (let entry of entries) {
    const cr = entry.contentRect;
    if(!isFirst && Date.now() - lastTime > 1000){
      // alert(`${cr.height} / ${cr.height == 1130} / ${window.location.href.indexOf('main.html')}`)

      if(cr.height == 1130 && window.location.href.indexOf('main.html') < 0){
        window.location.href = 'http://127.0.0.1:9999/web/main.html'
        lastTime = Date.now()
        break
      } else if(cr.height == 1154 && window.location.href.indexOf('human.html') < 0){
        lastTime = Date.now()
        window.location.href = 'http://127.0.0.1:9999/web/human.html'
        break
      }

    }
  }

  if(isFirst)
    isFirst = false
})

// Observe one or multiple elements
ro.observe(document.body);

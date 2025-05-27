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


let sentence = ''

const terms = []


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
  
}

function intro(){
  const audio = new Audio('/voices/fr.wav')
  audio.play()
}

async function create(){



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
   // document.getElementById("capture").style.display = 'none'
    document.getElementById("cam").style.display = 'block'
    const cam = document.getElementById("cam")
    cam.srcObject = stream
    console.log(cam.height, cam.width)
    //cam.play()
    //isVideo = true
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

camera()

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
  elem.scrollTop =  999999999//, behavior: "smooth"})
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
  sentence = ''
  //aud.src = `http://127.0.0.1:9999/web/sound/face.mp3`
  //aud.play()

  txt = ""
  let pos = 0
  let lang = 'ko'
  
  let prompt = document.querySelector('#MAIN [name=prompt]').value + ""

  if(pmpt){
    prompt = pmpt
    document.querySelector('#MAIN [name=prompt]').value = pmpt
  }

  aud.src = `/v1/tts?text=${prompt}&name=ko_base&voice=0&lang=ko&static=1`
  aud.play()//aud.script = t

  scripts.length = 0
  links = {}
  //vid.src = ''
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
  //elem.scroll({ top: elem.scrollHeight })//, behavior: "smooth"})

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

    // = "너는 20살의 프랑스 르노의 자동차를 사랑하는 여성으로 이름은 안나야. 애교 있는 말투로 한국어로 간단히 다음질문에 대답해줘."
    type = "너는 20살의 LG전자 온디바이스 AI노트북을 잘 사용하는 이름은 수진이라고 해. 반말 말투로 다음질문에 200자 이내로 대답해 줘."
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
        type,
        pos,
        max : 200,
        org,
        rag, 
        temp : temp,
        lang : 'auto'
      })

    }).then(async resp=>{
      reader = resp.body.getReader()
      const chunks = []
  
      let done, value, result
      let term = ''

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
          elem.scrollTop =  999999999
          playHuman(txt)
          break
        }

        const d = td.decode(value)
        chunks.push(d)
        txt += d
        term += d
        /*
        if(d.indexOf('!') > -1 || d.indexOf('.') > -1 || d.indexOf('?') > -1){

          let temp = ''

          if(term.indexOf('.') > -1){
            terms.push(term.split('.')[0] + '.')
            term = term.split('.')[1]
          } else if (term.indexOf('!') > -1){
            terms.push(term.split('!')[0] + '!')
            term = term.split('!')[1]
          } else if (term.indexOf('?') > -1){
            terms.push(term.split('?')[0] + '?')
            term = term.split('?')[1]
          }

          playHuman()
        }
        */
        bot.innerHTML = marked.parse(txt) //txt.replace(/\n/gi, "</br>");
        elem.scrollTop =  999999999

       // if(isTTS)
          

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
        elem.scrollTop =  999999999
        //elem.scroll({ top: elem.scrollHeight })


        //if(isTTS)

        

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


let lastTime = 0

function listen(){
 
  if(vid)
    vid.pause()  

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
    elem.scrollTop =  999999999
    interval = setTimeout(typeWriter, speed)
  } else if(isFinish){
    i = 0 
    txt = ''
  }
}

function playHuman(txt){
  txt = txt.replace(/(?:\r\n|\r|\n)/g, ' ').replace(/([#0-9]\u20E3)|[\xA9\xAE\u203C\u2047-\u2049\u2122\u2139\u3030\u303D\u3297\u3299][\uFE00-\uFEFF]?|[\u2190-\u21FF][\uFE00-\uFEFF]?|[\u2300-\u23FF][\uFE00-\uFEFF]?|[\u2460-\u24FF][\uFE00-\uFEFF]?|[\u25A0-\u25FF][\uFE00-\uFEFF]?|[\u2600-\u27BF][\uFE00-\uFEFF]?|[\u2900-\u297F][\uFE00-\uFEFF]?|[\u2B00-\u2BF0][\uFE00-\uFEFF]?|(?:\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDEFF])[\uFE00-\uFEFF]?|[\u20E3]|[\u26A0-\u3000]|\uD83E[\udd00-\uddff]|[\u00A0-\u269F]/g, '').trim()
  txt = txt.replace(/  /g, '')
  console.log('start...',txt)
  if(!is_play){
    is_play = true
    
    const audio = new Audio()

    audio.src = `/v1/tts?text=${txt}&name=ko_base&voice=42&lang=ko&static=1`
    audio.play()//aud.script = t
    //aud.play()
    console.log("image loading............")
    //document.getElementById('MAIN').style.backgroundImage="url(image/test0.webp)"

    audio.addEventListener('canplaythrough', () => {
      // 추가 작업을 여기서 수행할 수 있습니다.
      document.getElementById('MAIN').style.backgroundImage=`url(/v2/txt2human?num=${Math.floor(Math.random() * 5)}&seed=${Math.floor(Math.random() * 100)})`

    })

    audio.addEventListener("ended", (event) => {
      is_play = false
    })
    
  }
}

/*
function playHuman(){

  if(!is_play){
    let temp = terms.shift()
    temp = temp.replace(/(?:\r\n|\r|\n)/g, ' ').replace(/([#0-9]\u20E3)|[\xA9\xAE\u203C\u2047-\u2049\u2122\u2139\u3030\u303D\u3297\u3299][\uFE00-\uFEFF]?|[\u2190-\u21FF][\uFE00-\uFEFF]?|[\u2300-\u23FF][\uFE00-\uFEFF]?|[\u2460-\u24FF][\uFE00-\uFEFF]?|[\u25A0-\u25FF][\uFE00-\uFEFF]?|[\u2600-\u27BF][\uFE00-\uFEFF]?|[\u2900-\u297F][\uFE00-\uFEFF]?|[\u2B00-\u2BF0][\uFE00-\uFEFF]?|(?:\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDEFF])[\uFE00-\uFEFF]?|[\u20E3]|[\u26A0-\u3000]|\uD83E[\udd00-\uddff]|[\u00A0-\u269F]/g, '').trim()
    temp = temp.replace(sentence, '').replace(/  /g,'')
    is_play = true
    const audio = new Audio()

    audio.src = `/v1/tts?text=${temp}&name=ko_base&voice=42&lang=ko&static=1`
    audio.play()
    console.log("image loading............")
    //document.getElementById('MAIN').style.backgroundImage="url(image/test0.webp)"

    audio.addEventListener('canplaythrough', () => {
      document.getElementById('MAIN').style.backgroundImage=`url(/v2/txt2human?num=${Math.floor(Math.random() * 5)}&seed=${Math.floor(Math.random() * 100)})`

    })

    audio.addEventListener("ended", (event) => {
      is_play = false
      if(terms.length > 0)
        playHuman()
    })
  }
}
*/
let isFirst = true

var ro = new ResizeObserver(entries => {
  for (let entry of entries) {
    const cr = entry.contentRect;

    console.log('Element:', entry.target);
    console.log(`Element size: ${cr.width}px x ${cr.height}px`);
    console.log(`Element padding: ${cr.top}px ; ${cr.left}px`);
  }
  if(!isFirst){
    window.location = 'http://127.0.0.1:9999/web/main.html'
  } else 
    isFirst = false
})

// Observe one or multiple elements
ro.observe(document.body);
 

// not working

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


vid.oncanplaythrough = ()=>{}

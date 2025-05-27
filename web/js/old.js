
let isTTS = 1//= //document.querySelector('#MAIN input[name=m_tts]:checked').value
const history = []
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
  //const user = email.split('@')[0]
  const email = userId

  const resp = await fetch(`/v1/account?email=${email}&userId=${userId}&pass=${pass}`)
  const ret = await resp.json()
  console.log(ret.data)
  switch(ret.data){
    case 0: // fail
      alert('Wrong email or password. Check again!')
      break;
    case 1: // pass

      localStorage.setItem('email',email)
      localStorage.setItem('userId',userId)

      _.userId = userId
      document.querySelector('span[name=user]').innerText = userId
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
  if(evt.which == 13 && !evt.shiftKey)
    search()

  
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
  navigator.mediaDevices.getUserMedia({video: {width: {exact: 512}, height: {exact: 512}}}).then(stream=>{
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

  const canvas = document.getElementById('capture')
  context.clearRect(0, 0, canvas.width, canvas.height) 
    
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

let audio = 0

function listen(evt){
  console.log('main_l')

  if(audio)
    audio.pause()

  $.listen()
  $.query('input[name=prompt]').className = 'listen'
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


const bots =  [
  'news',    'trend',
  'weather', 'dust',
  'music',   'letter',
  'book', 'movie', 'image'
]

function checkBot(cmd){

  for(const bot of bots){
    if(cmd.indexOf(bot) > -1)
      return bot
  }
  return false
}


async function search(isSkip=false){


  const vid = document.getElementById('virtual')
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
 
   const bot = document.createElement('li')
   bot.className = 'chat user'
   bot.textContent = '...'
   //const pre = document.createElement('pre')
   //bot.appendChild(pre)
   //pre.textContent = 'waiting answer...'
 

   elem.appendChild(bot)
   elem.scroll({ top: 999999 })//, behavior: "smooth"})
 
   const td = new TextDecoder() // lang auto
 
   const form = new FormData()
   form.append('prompt',prompt.replace(/\n/gi, ""))
 
   if(!isSkip){
    const resp = await fetch(`/v1/t/lang`, {
      method: "POST",
      body: form
    })
    const result = await resp.json()
    lang = result.data.lang
    pos = result.data.pos

    console.log('language',result.data)
  
    let model = 'en2ko'
  
    if(lang == 'ko'){
      const resp = await fetch(`/v1/t/trans2?model=ko2en&userId=${_.userId}&skip=1`, {
        method: "POST",
        body: form
      })
      const result = await resp.text()
      console.log(result)     
      query = result//result.data
    }

  }
   
  if(query.toLowerCase().startsWith('draw') || query.toLowerCase().startsWith('paint') ){
    bot.textContent = 'Drawing the image...'
    setImage(`${lb.getGen()}/v1/txt2photo?sentence=${query}&w=512&h=512`)
  } else if(upload == 0 && isVideo == 0){
    console.log('------------------------ chat....--------------')

    bot.textContent = 'waiting answer...'
    fetch(`/v1/chat`,{
      method : "POST",
      headers : {
        "Content-Type" : 'application/json'
      }, // prompt=${query}&temp=${temp}&lang=en`
      body : JSON.stringify({
        prompt : query.replace(/\n/gi, ""),
        history : [],//history.slice(-2),
        pos,
        org, 
        temp : temp,
        lang : 'en'
      })

    }).then(async resp=>{
      const reader = resp.body.getReader()
      const chunks = []
  
      let done, value, result
      while(!done) {
        ({value, done} = await reader.read())
        if(done){
          console.log('finish2', bot.innerHTML.replace(/\n/gi, "</br>"))
          console.log(query,checkBot(query))
          if(lang == 'ko' && !checkBot(query)){
            console.log('trans',chunks.join(''))
            const form = new FormData()
            form.append('prompt',chunks.join(''))

            // set history
            history.push(`${query}|${chunks.join('')}`)

            fetch(`/v1/t/trans2?model=en2ko&userId=${_.userId}&skip=1`, {
              method: "POST",
              body: form
            }).then(async resp=>{
              const reader = resp.body.getReader()
              const chunks2 = []
          
              let done, value, result
              while(!done) {
                ({value, done} = await reader.read())
                if(done){              
                  bot.innerHTML = chunks2.join('').trim()


                  const form = new FormData()
                  form.append('prompt',prompt)
                  form.append('data',chunks2.join(''))
  
                  const res = await fetch(`/v1/t/text?prompt=${prompt}&model=chat&userId=${_.userId}`, {
                    method: "POST", // or 'PUT'
                    //headers: { "application/json" },
                    body: form //JSON.stringify({ data : prompt + chunks.join('') }),
                  })

                }
                
                chunks2.push(td.decode(value))
                bot.innerHTML = chunks2.join('').trim() //.replace(/\n/gi, "</br>") //.replace(/\n/gi, "</br>")
                elem.scroll({ top: 999999}) // , behavior: "smooth"})
                //console.log(value,td.decode(value))

                if(isTTS == 1){
                  if(audio)
                    audio.pause()
                  //audio = new Audio(`${lb.getSlm()}/v1/tts?text=${bot.innerHTML}&lang=${lang}&voice=main`)
                  //audio.play()       
                  //vid.src = `${lb.getGen()}/v1/txt2human?text=${bot.innerHTML.replace(/<\/br>/gi, "")}&lang=${lang}&voice=main`    
                }

              }

            })

          } else {
            bot.innerHTML = chunks.join('') //.replace(/\n/gi, "</br>")
            history.push(`${query}|${chunks.join('')}`)

            const form = new FormData()
            form.append('prompt',prompt)
            form.append('data',chunks.join(''))

            const res = await fetch(`/v1/t/text?prompt=${prompt}&model=chat&userId=${_.userId}`, {
              method: "POST", // or 'PUT'
              //headers: { "application/json" },
              body: form //JSON.stringify({ data : prompt + chunks.join('') }),
            })

            if(isTTS == 1){
              if(audio)
                audio.pause()   
              //vid.src = `${lb.getGen()}/v1/txt2human?text=${bot.innerHTML.replace(/<\/br>/gi, "")}&lang=${lang}&voice=main`    
            }

          }

          /*
          vid.onended = ()=>{
            vid.src = ''
          }

          vid.oncanplaythrough = ()=>{
            
          }
          */

          //document.getElementById('virtual').src = `/v1/v/human?prompt=${bot.innerHTML.replace(/<\/br>/gi, "")}&lang=${lang}`
  
          /*
          bot.onclick = ()=>{
            if(audio)
              audio.pause()
            audio = new Audio(`${lb.getSlm()}/v1/tts?text=${bot.innerHTML}&lang=${lang}&voice=main`)
            audio.play()
          } 
          */
  
          elem.scroll({ top: 999999 })//, behavior: "smooth"})
  
          break
        }
        chunks.push(td.decode(value))
        //console.log(value,td.decode(value))
        //console.log(value.indexOf('\n') > -1, td.decode(value).indexOf('\n') > -1)
        bot.innerHTML = chunks.join('').trim().replace(/\n/gi, "</br>") //.replace(/\n/gi, "</br>")
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

    upload.append('prompt',query)
    upload.append('temp',temp)
    upload.append('lang','en')

    fetch(`/v1/i/chat`,{ //?prompt=${query}&temp=${temp}&lang=en
      method: 'POST',
      body: upload
    }).then(async resp=>{
      const reader = resp.body.getReader()
      const chunks = []
  
      let done, value, result
      while(!done) {
        ({value, done} = await reader.read())

        if(done){
          console.log('trans',lang)
          if(lang == 'ko'){
            const form = new FormData()
            form.append('prompt',bot.innerHTML)
            const resp = await fetch(`/v1/t/trans?model=en2ko&userId=${_.userId}&skip=1`, {
              method: "POST",
              body: form
            })
            const result = await resp.json()
            console.log(result)     
            bot.innerHTML = result.data.trim().replace(/\n/gi, "</br>")
          } else {
            bot.innerHTML = chunks.join('').trim().replace(/\n/gi, "<br>")
          }

          bot.onclick = ()=>{
            if(audio)
              audio.pause()
            audio = new Audio(`${lb.getSlm()}/v1/tts?text=${bot.innerHTML}&lang=${lang}&voice=main`)
            audio.play()
          } 
  
          if(isTTS == 1){
            if(audio)
              audio.pause()
            //document.getElementById('virtual').src = `${lb.getGen()}/v1/txt2human?text=${bot.innerHTML.replace(/<\/br>/gi, "")}&lang=${lang}&voice=main` 

            //audio = new Audio(`${lb.getSlm()}/v1/tts?text=${bot.innerHTML}&lang=${lang}&voice=main`)
            //audio.play()          
          }
  
          elem.scroll({ top: 999999 })//, behavior: "smooth"})

          break
        }
        chunks.push(td.decode(value))
        console.log('chunk',td.decode(value))
        bot.innerHTML = chunks.join('').replace(/\n/gi, "</br>")
        elem.scroll({ top :9999999 })//, behavior:"smooth"})
      }
    }).catch(e=>{
      console.error(e)
      return
    })    
   }

  
  fetch(`/v1/youtube?prompt=${prompt}`).then(async resp=>{
    const result = await resp.json()
    console.log('youtube',result)
    
    //result[0].title
    //result[0].thumbnail.thumbnails[0].url

    document.querySelector('ul[name=video]').innerHTML = `
    <li>
      <p class='title'><a href='https://www.youtube.com/watch?v=${result[0].id}' target="_blank">${result[0].title}</a></p> 
      <p class='url'><img src='${result[0].thumbnail.thumbnails[0].url}'></img></p>
    </li>
    <li>
      <p class='title'><a href='https://www.youtube.com/watch?v=${result[1].id}' target="_blank">${result[1].title}</a></p>
      <p class='url'><img src='${result[1].thumbnail.thumbnails[0].url}'></img></p>
    </li>
    <li>
      <p class='title'><a href='https://www.youtube.com/watch?v=${result[2].id}' target="_blank">${result[2].title}</a></p>
      <p class='url'><img src='${result[2].thumbnail.thumbnails[0].url}'></img></p>
    </li>            
    <li>
      <p class='title'><a href='https://www.youtube.com/watch?v=${result[3].id}' target="_blank">${result[3].title}</a></p>
      <p class='url'><img src='${result[3].thumbnail.thumbnails[0].url}'></img></p>
    </li>            
    <li>
      <p class='title'><a href='https://www.youtube.com/watch?v=${result[4].id}' target="_blank">${result[4].title}</a></p>
      <p class='url'><img src='${result[4].thumbnail.thumbnails[0].url}'></img></p>
    </li>  
    <li>
      <p class='title'><a href='https://www.youtube.com/watch?v=${result[5].id}' target="_blank">${result[5].title}</a></p> 
      <p class='url'><img src='${result[5].thumbnail.thumbnails[0].url}'></img></p>
    </li>
    <li>
      <p class='title'><a href='https://www.youtube.com/watch?v=${result[6].id}' target="_blank">${result[6].title}</a></p>
      <p class='url'><img src='${result[6].thumbnail.thumbnails[0].url}'></img></p>
    </li>
    <li>
      <p class='title'><a href='https://www.youtube.com/watch?v=${result[7].id}' target="_blank">${result[7].title}</a></p>
      <p class='url'><img src='${result[7].thumbnail.thumbnails[0].url}'></img></p>
    </li>            
    <li>
      <p class='title'><a href='https://www.youtube.com/watch?v=${result[8].id}' target="_blank">${result[8].title}</a></p>
      <p class='url'><img src='${result[8].thumbnail.thumbnails[0].url}'></img></p>
    </li>            
    <li>
      <p class='title'><a href='https://www.youtube.com/watch?v=${result[9].id}' target="_blank">${result[9].title}</a></p>
      <p class='url'><img src='${result[9].thumbnail.thumbnails[0].url}'></img></p>
    </li>                                       
  `
  })


  fetch(`/v1/search?prompt=${prompt}&lang=${lang}`).then(async resp=>{
    const result = await resp.json()
    console.log('response',result)
  
    const data = result.data
  
    const items = []

    for(let i = 0 ;  i < 10 ; i++){
      items.push(
      `<li>
        <p class='title'><a href='${data[i].url}' target="_blank">${data[i].title}</a></p>
        <p class='desc'>${data[i].description}</p>
      </li>`
      )
    }



    document.querySelector('ul[name=search]').innerHTML = items.join('\n')  
  })   

  setTimeout(function() {
    document.querySelector('#MAIN [name=prompt]').focus();
  }, 100);
}

setTimeout(function() {
  document.querySelector('#MAIN [name=prompt]').focus();
}, 100);

function listen(){
  $.listen()
  $.query('[name=prompt]').className = 'listen'
}

function dragOverHandler(ev) {
  console.log("File(s) in drop zone");

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
}

async function dropHandler(ev) {
  console.log("File(s) dropped",ev.dataTransfer.items);

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault()

  if (ev.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    [...ev.dataTransfer.items].forEach(async (item, i) => {
      // If dropped items aren't files, reject them
      if (item.kind === "file") {
        const file = item.getAsFile();
        console.log(`… file[${i}].name = ${file.name}`,file)

        const form = new FormData()
        form.append("file",file,file.name)


        const resp = await fetch(`/v1/upload`, {
          method: "POST",
          body: form
        })

        const result = await resp.json()

        console.log('uploaded!',result.data)

        document.querySelector('#MAIN input[name=prompt]').value = `summurize this, ${result.data}`
        search(true)

      }
    });
  } else {
    // Use DataTransfer interface to access the file(s)
    [...ev.dataTransfer.files].forEach((file, i) => {
      console.log(`… file[${i}].name = ${file.name}`);
    });
  }
}

function full(){
  if (document.documentElement.requestFullscreen) {
    alert('full page')
    document.documentElement.requestFullscreen()
 } else [
    alert('not allowed')
 ]
}

function init(){
  fetch(`/v1/bot/trend`).then(async resp=>{
    const result = await resp.json()
    console.log('trend',result)
    
    const list = []

    for(const item of result.data){
      list.push(`<li>
        <p class='title'>${item.related_article[0]}</a></p> 
        <p class='url'><img src='${item.image}'></img></p>
      </li>`)
    }

    document.querySelector('#MAIN ul[name=video]').innerHTML = list.join('')
  })

  fetch(`/v1/bot/morning`).then(async resp=>{
    const result = await resp.json()
    console.log('trend',result.data)
    
    document.querySelector('#MAIN ul[name=chats]').innerHTML = `<li class='chat user'>
      ${result.data.title}</br></br>${result.data.content}</br></br>${result.data.think}
    </li>`

  })  
}


init()

function showVideo(){
  document.querySelector('#MAIN ul[name=video]').style.display = 'block'
  document.querySelector('#MAIN ul[name=search]').style.display = 'none'
}

function showSearch(){
  document.querySelector('#MAIN ul[name=video]').style.display = 'none'
  document.querySelector('#MAIN ul[name=search]').style.display = 'block'
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

const urlParams = new URLSearchParams(window.location.search);
const mode = urlParams.get('mode')
if(mode)
  $.mode = mode

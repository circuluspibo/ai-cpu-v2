
_ = {
  id : "MAIN",
  userId : 'guest',
  script : {} // id and code
}

function $(ev){
  console.log('Target', _.id)
  $.event = ev
  const script = _.script[_.id]
  return script
}

/*
document.getElementById('#home').addEventListener('mouseover',elem=>{
  if(navigator.vibrate)
    navigator.vibrate([200, 100, 200]);
})

/*
var hammertime = new Hammer(document.body);
hammertime.on('swipeleft', function(ev) {
  document.getElementById('home').className = 'animate__animated animate__fadeIn'
  document.getElementById('test').className = 'animate__animated animate__zoomOut'
});

hammertime.on('swiperight', function(ev) {
  //document.getElementById('home').className = 'animate__animated animate__fadeOut'
  document.getElementById('test2').style.display = 'block'
  document.getElementById('test2').className = 'animate__animated animate__slideInRight'
})

hammertime.on('swipeup', function(ev) {
	alert('up')
})

hammertime.on('swipedown', function(ev) {
	alert('down')
})
*/

_.interval = 0

$.mode = 'default'
$.isRecord = false

$.getLanguage = ()=>{
  const lang = navigator.language.split('-')[0]
  //return lang
  return 'en'
}

$.templete = (path, id)=>{
  fetch(path).then(async resp=>{
    const data = await resp.json()
    console.log('read json',data)

    for(const key in data){
      console.log(key, data[key])
      const items = document.querySelectorAll(`#${id} span[name=${key}], #${id} option[value=${key}]`)
      for(const item of items){
        if(item)
          item.innerHTML = data[key]
      }
    }

    /*
    const items = document.querySelectorAll(`#${id} input, #${id} textarea`)
    for(const item of items){
      console.log(item.placeholder,item)
      if(item.placeholder)
        item.placeholder = '여기에 프롬프트를 입력해 주세요!'
    }
    */

  }).catch(err=>{
    console.error(path,err)
  })
}



$.getFace = async blob=>{
  const form = new FormData()
  form.append('file',blob,`${Date.now()}.jpg`)

  const resp = await fetch('v1/i/getFace', {
    method: 'POST',
    body: form
  })

  const res = await resp.json()
  console.log('getface',res)
  return res.result
}


$.load = async (bot, data , type='slide', text=bot)=>{
  //$.tts(text)

  /*
  if(_.userId == 'guest'){
    clearInterval(_.interval)
    document.getElementById('LOGIN').style.display = 'BLOCK'
    //document.querySelector('footer').innerText = 'You need to entrance this service!'
    //document.querySelector('.login').className = 'login here'
    //document.querySelector('footer').style.visibility = 'visible'
    //_.interval = setTimeout(()=>{
    //  document.querySelector('.login').className = 'login'
    //  document.querySelector('footer').style.visibility = 'hidden'
    //},3000)
    
    return
  }*/

  if(bot == _.id)
    return

  if(navigator.vibrate)
    navigator.vibrate([200, 100, 200]);

  //pibo.mode('avatar',{ value : true})

  console.log('loading',bot)
  // css load

  if(!_.script[bot]){
    const css = document.createElement("link")
    css.setAttribute("rel", "stylesheet")
    css.setAttribute("type", "text/css")
    css.setAttribute("href", `app/${bot}/css/index.css`)
    document.getElementsByTagName("head")[0].appendChild(css)  
    

    // html load
    const data = await fetch(`app/${bot}/index.html`)
    const html = await data.text()
    //const body = html.split('<body>')[1].split('</body>')[0]
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const article = document.createElement("article")
    article.id = bot
    //article.innerHTML = doc.querySelector('main').children
    article.appendChild(doc.querySelector('main > *'))

    document.querySelector('main').appendChild(article)

    if($.getLanguage() == 'ko')
      $.templete(`app/${bot}/index.json`,bot)

    if(type =='slide'){
      document.getElementById(_.id).className = `animate__animated animate__fadeOut`
      //document.getElementById('test').style.display = 'block'
      article.className = `animate__animated animate__fadeIn`
    } else {
      document.getElementById(_.id).className = `animate__animated animate__fadeOut`
      article.className = `animate__animated animate__zoomIn`
    }
  } else {
    if(type =='slide'){
      document.getElementById(_.id).className = `animate__animated animate__fadeOut`
      document.getElementById(bot).style.display = 'block'
      document.getElementById(bot).className = `animate__animated animate__fadeIn`
    } else {
      document.getElementById(_.id).className = `animate__animated animate__fadeOut`
      document.getElementById(bot).style.display = 'block'
      document.getElementById(bot).className = `animate__animated animate__zoomIn`
    }   
  }

  const oldId = _.id

  setTimeout(()=>{
    document.getElementById(oldId).style.display = 'none'
    //_.id = 'MAIN' 
  },1000)

  // script load
  if(_.script[_.id] && _.script[_.id].destroy)
    _.script[_.id].destroy(data)

  _.id = bot

  if(!_.script[bot]){
    const script = await import(`/web/app/${bot}/js/index.js`)
    _.script[bot] = script
    $[bot] = script
    console.log('>',$)

    if(_.script[bot].init){
      const resp = _.script[bot].init(data)
      if(resp instanceof Promise)
        await resp
    }
  } 

  if(_.script[bot].create)
    _.script[bot].create(data)

  if(_.script[bot].event)
    _.script[bot].event(data)
}

let _SPEAK = 0
let isSpeak = false
let _AUDIO = 0
let isPlay = false

$.tts = (text, lang='ko')=>{
  if(isSpeak)
    _SPEAK.pause()
  isSpeak = true
  //if(isPlay)
  //  _AUDIO.pause()
  _SPEAK = new Audio(`https://o-tapi.circul.us/tts?text=${text}&lang=${lang}&voice=man1`)
  _SPEAK.play()
  _SPEAK.addEventListener('ended',e=>{
    isSpeak = false

    if (isPlay)
      fadeOut()
  })
}

$.exit = (text = '홈 화면으로 돌아갈께.')=>{
  $.tts(text)
  if(_.script[_.id] && _.script[_.id].destroy)
    _.script[_.id].destroy()

  //pibo.mode('avatar',{ value : false})

  document.getElementById('MAIN').className = 'animate__animated animate__fadeIn'
  document.getElementById(_.id).className = 'animate__animated animate__zoomOut'
  document.getElementById('MAIN').style.display = 'block'
  setTimeout(()=>{
    document.getElementById(_.id).style.display = 'none'
    _.id = 'MAIN' 
  },1000)
}


$.play = (url)=>{  
  //if(isPlay)
  //  _AUDIO.stop()
  isPlay = true
  _AUDIO = new Audio(url)
  _AUDIO.volume = 0.5
  _AUDIO.play()

  _AUDIO.addEventListener('ended',e=>{
    isPlay = false
  })
}

$.fade = 0

$.stop = ()=>{
  if(_AUDIO)
    _AUDIO.pause()
}

window.oncontextmenu = ev=>{
  //ev.preventDefault()
  console.log(ev)
  if(_.script[_.id].oncontextmenu){
    //ev.stopPropagation()
    $.event = ev
    _.script[_.id].oncontextmenu(ev)
  }
}


$.query = path =>{
  //console.log(_.id, path)
  //console.log(document.querySelector(`#${_.id} ${path}`))
  return document.querySelector(`#${_.id} ${path}`)
}

$.queryAll = path =>{
  return document.querySelectorAll(`#${_.id} ${path}`)
}


// https://developer.mozilla.org/ko/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
$.getType = fileName=> {
  if(fileName.indexOf('.') <0)
    return 'application/octet-stream'
  else {
    const ext = fileName.split('.')[1]
    //https://www.feedforall.com/mime-types.htm
    switch(ext){
      case 'avi':
        return 'video/x-msvideo'
      case 'jpeg':
      case 'jpg':
        return 'image/jpeg'
      case 'css':
        return 'text/css'
      case 'gif':
        return 'image/gif' 
      case 'htm':
      case 'html':        
        return 'text/html' 
      case 'js':
        return 'text/javascript' 
      case 'json':
        return 'application/json' 
      case 'mid':        
      case 'midi':
        return 'audio/midi' 
      case 'mpeg':
        return 'video/mpeg' 
      case 'mp3':
        return 'audio/mpeg'   
      case 'mp4':
        return 'video/mp4'     
      case 'pdf':
        return 'application/pdf'        
      case 'wav':
        return 'audio/x-wav' 
      case 'xml':
        return 'application/xml' 
      case 'zip':
        return 'application/zip'   
      case 'png':
        return 'image/png'                         
      default:
        return 'application/octet-stream'               
    }
  }
}

$.isBlob = fileName=> {
  if(fileName.indexOf('.') <0)
    return 'application/octet-stream'
  else {
    const ext = fileName.split('.')[1]
    //https://www.feedforall.com/mime-types.htm
    switch(ext){
      case 'avi':
      case 'jpeg':
      case 'jpg':
      case 'gif':
      case 'mpeg':
      case 'mp3':
      case 'mp4':
      case 'pdf':
      case 'wav':
      case 'zip':
      case 'png':
        return true                         
      default:
        return false               
    }

  }

}

$.loading = on=>{
  if(!document.getElementById('loading'))
    return
  if(on)
    document.getElementById('loading').style.visibility = 'visible'
  else
    document.getElementById('loading').style.visibility = 'hidden'
}

// https://thewebdev.info/2021/10/14/how-to-playback-html-audio-with-fade-in-and-fade-out-with-javascript/
function fadeOut(){
  clearInterval($.fade)
  $.fade = setInterval(() => {
    if (_AUDIO.volume > 0.1) 
      _AUDIO.volume -= 0.1
  
    if (_AUDIO.volume < 0.1) {
      _AUDIO.volume = 0
      _AUDIO.pause()
      clearInterval($.fade)
    }
  }, 100);
}

/*
document.addEventListener('keydown',e=>{
  e.preventDefault()
  console.log(e)
  if (e.keyCode == 36)
    e.preventDefault()
  
})
*/

$.download = async (url, filename)=> {
  try {
    // Fetch the file
    const response = await fetch(url);
    
    // Check if the request was successful
    if (response.status !== 200) {
      throw new Error(`Unable to download file. HTTP status: ${response.status}`);
    }

    // Get the Blob data
    const blob = await response.blob();

    // Create a download link
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = filename;

    // Trigger the download
    document.body.appendChild(downloadLink);
    downloadLink.click();

    // Clean up
    setTimeout(() => {
      URL.revokeObjectURL(downloadLink.href);
      document.body.removeChild(downloadLink);
    }, 100);
  } catch (error) {
    console.error('Error downloading the file:', error.message);
  }
}

/*
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const recognition = new SpeechRecognition()

recognition.interimResults = true
// 값이 없으면 HTML의 <html lang="en">을 참고합니다. ko-KR, en-US
//recognition.lang = "ko-KR";
// true means continuous, and false means not continuous (single result each time.)
// true면 음성 인식이 안 끝나고 계속 됩니다.
recognition.continuous = false
// 숫자가 작을수록 발음대로 적고, 크면 문장의 적합도에 따라 알맞은 단어로 대체합니다.
// maxAlternatives가 크면 이상한 단어도 문장에 적합하게 알아서 수정합니다.
recognition.maxAlternatives = 1000

let speechToText = ""

recognition.onresult = e => {
  let interimTranscript = ""
  for (let i = e.resultIndex, len = e.results.length; i < len; i++) {
    let transcript = e.results[i][0].transcript
    console.log(transcript)

    if (e.results[i].isFinal)
      speechToText += transcript;
    else
      interimTranscript += transcript;
    
  }

  if(_.script[_.id].listening)
    _.script[_.id].listening(speechToText + interimTranscript)
  //document.querySelector('#CHAT input[type=text]').value = speechToText + interimTranscript
  //document.querySelector(".para").innerHTML = speechToText + interimTranscript;
}

recognition.onend = ()=>{
  console.log('end!!!!!')
  if(_.script[_.id].listened)
    _.script[_.id].listened()
}


$.listen = (lang='ko-KR')=>{
  speechToText = ""
  recognition.lang = lang
  recognition.start()
}

*/


$.listen = cb=>{
  let chunks = []

  if(!$.isRecord){

    console.log("Recording started")
    $.isRecord = true
    $.query('[name=prompt]').className = 'listen'
    navigator.mediaDevices.getUserMedia({audio: true, video: false}).then(stream=> {

      mediaRecorder = new MediaRecorder(stream, {audioBitsPerSecond: 16000 }) // mimeType :"audio/ogg"

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data)
      }

      mediaRecorder.onstop = (e) => {
        console.log("recorder stopped");
        const fd = new FormData();
        fd.append("file", new Blob(chunks, { type: 'audio/ogg;codecs=opus' }), 'voice.ogg')
      
        fetch(`/v1/stt`,{
          method: 'POST',
          body: fd
        }).then(async res=>{
          const result = await res.json()
          console.log('speech end---',result)
          if(cb)
            cb(result.data)
        })
      }

      mediaRecorder.start()

      $.query(".mic").classList.add('listen')

    }).catch(function(err) {
        console.log(err)
        $.isRecord = false
        mediaRecorder.stop()
        $.query(".mic").classList.remove('listen')
        $.query('[name=prompt]').className = ''
        (new Audio("./sound/face.mp3")).play()
    })

  } else {

    $.isRecord = false
    mediaRecorder.stop()
    $.query(".mic").classList.remove('listen')
    $.query('[name=prompt]').className = ''

  }

}

$.short = (str, num=20)=>{
  if(str.length < num)
    return str
  return str.substr(0, num) + "..."
}

$.close = ()=>{
  document.getElementById("VIEW").style.display = 'none'
}
let mode = 'txt'

let isPaint = false

let lastId = 0
let isLoad = false
let list = []

let width = 512
let height = 512

let form = 0

let isVideo = false
let isImage = false


let a_lastId = 0
let a_list = []
let a_isLoad = false

let i_lastId = 0
let i_list = []
let i_isLoad = false

let v_lastId = 0
let v_list = []
let v_isLoad = false

let t_lastId = 0
let t_list = []
let t_isLoad = false

let image_id = 0
let audio_id = 0

$.query('ul[name=files]').addEventListener("scroll", (event) => {
  if(!isLoad && list.indexOf(lastId) < 0){
    if( event.target.scrollTop / event.target.scrollHeight > 0.5){
      isLoad = true
      create(lastId)
    }
  }
});


export async function init(){

}

export async function create(_id){

  $.query('ul[name=files]').innerHTML = 'Loading...'
  $.query('ul[name=images]').innerHTML = 'Loading...'
  $.query('ul[name=audios]').innerHTML = 'Loading...'

  loadResume()
  loadImage()
  loadAudio()
}

function loadResume(_id){
  fetch(`/v1/p/find?userId=${_.userId}`).then(async resp=>{
    const items = await resp.json()
    console.log('result txt',items)
  
    if(!_id){
      $.query('ul[name=files]').innerHTML = ''
      t_list = items
    } else 
      t_list.push(...items)
  
    t_isLoad = false
  
    for(const item of items){
      t_lastId = item._id
      const elem = document.createElement('li')
      // <img src='/v1/v/media/${item.faceId}'>
      // <audio controlsList="nodownload" controls src="/v1/a/audio/${item.voiceId}"></audio>
      elem.innerHTML = `
      <fieldset onclick="$(event).select('${item.fileId}')">
        <video width="100%" controls poster='/v1/v/media/${item.faceId}' src='/v1/v/media/${item.introId}'></video>
        <p>${$.short(item.name,36)} / ${item.gender} / ${item.birth} / ${item.job}
        <p>${$.short(item.personal,72)}
        <p>${$.short(item.special,72)}
        <button class='remove' onclick="$(event).removeResume('${item._id}')"><i class="fa-solid fa-trash"></i></button></p>
        <button class='publish' onclick="$(event).publish('${item.userId}','${item.name}','${item.job}','${item.prompt}','${item.voiceId}','${item.faceId}','${item.introId}')"><i class="fa-solid fa-upload"></i> huggingface 배포하기</button>
      </fieldset>
      `      
      //elem.innerHTML = `<video controlsList="nodownload" controls playsinline id='_${item.fileId}' preload='auto' class='square' src='/v1/v/media/${item.fileId}?type=mp4&length=${item.length}'></video>`

      $.query('ul[name=files]').append(elem)
    }
  })
}

function loadImage(_id){
  fetch(`/v1/v/medias?userId=${_.userId}&model=profile`).then(async resp=>{
    const items = await resp.json()
    console.log('result img',items)

    if(!_id){
      $.query('ul[name=images]').innerHTML = ''
      i_list = items
    } else 
      i_list.push(...items)
  
    i_isLoad = false
  
    for(const item of items){
      i_lastId = item._id
      const elem = document.createElement('li')
      elem.innerHTML = `<img id='__${item.fileId}' src='/v1/v/media/${item.fileId}' onclick='$(event).selectImage("${item.fileId}")'>
      <button class='remove' onclick="$(event).removeImage('${item._id}')"><i class="fa-solid fa-trash"></i></button>`
      $.query('ul[name=images]').append(elem)
    }
  })  
}

function loadAudio(_id){
  fetch(`/v1/a/audios?userId=${_.userId}&type=wav&model=profile`).then(async resp=>{
    const items = await resp.json()
    console.log('result img',items)
  
    if(!_id){
      $.query('ul[name=audios]').innerHTML = ''
      a_list = items
    } else 
      a_list.push(...items)
  
    a_isLoad = false
  
    for(const item of items){
      a_lastId = item._id
      const elem = document.createElement('li') /* class delete*/
      elem.innerHTML = `
      <fieldset id='__${item.fileId}' onclick='$(event).selectAudio("${item.fileId}","${item.prompt}")'>
        <p>${item.prompt}
        <button class='delete' onclick="$(event).removeAudio('${item._id}')"><i class="fa-solid fa-trash"></i></button>
        </p>   
        <audio controlsList="nodownload"  id='_${item.fileId}' controls src="/v1/a/audio/${item.fileId}"></audio>
     </fieldset>
      `
      $.query('ul[name=audios]').append(elem)

      //new Plyr(`#_${item.fileId}`);
    } 
  }) 
}

export async function publish(userId, name, job, prompt,voiceId, faceId, introId){


  
  const form = new FormData()
  form.append('userId',userId)
  form.append('name',name)
  form.append('job',job)
  form.append('prompt',prompt)
  form.append('voiceId',voiceId)
  form.append('faceId',faceId)
  form.append('introId',introId)

  const  resp = await fetch(`/v1/s/share`, { //prompt=${encodeURI('남자가 서 있다')}
    method: 'POST',
    body: form
  }).catch(e=>{
    console.error(e)
    $.loading(false)
    return
  })


  const json = await resp.json()

  $.loading(false)
  console.log('result >>>',json.data)

  window.open(`https://huggingface.co/spaces/newsac/${userId}_${introId}`)
}

export async function selectImage(fileId, isVid=false){
  const target = document.querySelector(`#__${fileId}`)

  image_id = fileId

  $.queryAll(`img.clicked`).forEach(item=>{
    item.className = ''
  })

  target.className = 'clicked'
}

export function selectAudio(fileId,text){

  const target = document.querySelector(`#__${fileId}`)

  audio_id = fileId
 
  $.queryAll(`fieldset.clicked`).forEach(item=>{
    item.className = ''
  })

  target.className = 'clicked'
}

/*
export function oncontextmenu(ev){
  console.log('oncontextment',ev)
}
*/

export async function remove(fileId){
  //$.event.target.className = 'selected'

  setTimeout(async ()=>{
    const isDelete = confirm('Do you wanna remove it?')
    //console.log($.event)
  
    if(isDelete){
      const url =  `/v1/v/delete?_id=${fileId}`
  
      const resp = await fetch(url)
      const json = await resp.json()
      console.log('result img',json.data)
      
      create()
    } //else 
    //  $.event.target.className = ''
  },50)
}

export function close(){
  $.query('aside').className = `animate__animated animate__fadeOut`
  //$.query('aside').style.visibility = 'hidden'
}


export function popup(){
  $.query('aside').className = `animate__animated animate__fadeIn`
  $.query('aside').style.visibility = 'visible'
}


export async function generate(p='', m=''){

  const name = $.query('input[name=p_name]').value
  const gender = $.query('input[name=p_gender]:checked').value
  const date = $.query('input[name=p_date]').value
  const job = $.query('input[name=p_job]').value
  const personal = $.query('textarea[name=p_personal]').value
  const special = $.query('textarea[name=p_special]').value

  if(personal.length < 5){
    alert('입력 프롬프트가 너무 짧습니다. 올바른 생성을 위해 보다 길게 입력해 주세요.')
    return
  } else if(personal.length > 512){
    alert('입력 프롬프트가 너무 깁니다. 올바른 생성을 위해 보다 짧게 입력해 주세요.')
    return
  }

  if(!audio_id){
    alert('음성 프로필이 선택되지 않았습니다. 음성 샘플을 선택해 주세요.')
    return
  }

  if(!image_id){
    alert('얼굴 프로필이 선택되지 않았습니다. 얼굴 샘플을 선택해 주세요.')
    return
  }
 
  $.loading(true)



  //name=${name}&gender=${gender}&date=${date}&job=${job}&personal=${personal}&special=${special}&voiceId=${audio_id}&faceId=${image_id}&_.userId=${_.userId}`
  
  const form = new FormData()
  form.append('name',name)
  form.append('gender',gender)
  form.append('birth',date)
  form.append('job',job)
  form.append('personal',personal)
  form.append('special',special)
  form.append('voiceId',audio_id)
  form.append('faceId',image_id)
  form.append('userId',_.userId)
  

  const  resp = await fetch(`/v1/p/insert`, { //prompt=${encodeURI('남자가 서 있다')}
    method: 'POST',
    body: form
  }).catch(e=>{
    console.error(e)
    $.loading(false)
    return
  })


  const json = await resp.json()

  $.loading(false)
  console.log('result >>>',json.data)

  create()
}

/*
export function oncontextmenu(ev){
  console.log('context> ',ev)
  console.log(ev.clientX,ev.clientY)
}
*/

export function listen(){
  // 음성 인식 시작
  $.listen()
  $.query('textarea[name=pos_prompt]').className = 'listen'
}

export function listening(text){
  $.query('textarea[name=pos_prompt]').textContent = text
}

export function listened(){
  $.query('textarea[name=pos_prompt]').className = ''
  if($.query('textarea[name=pos_prompt]').textContent.length > 0)
    generate()
}

export function camera(){
  $.queryAll('.img').forEach(elm => elm.style.display = 'none')
  const elem = document.getElementById('i_img')
  elem.style.display = 'block'
  isVideo = true

  stop()

  console.log('main_c')
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia ){
      // Navigator mediaDevices not supported
      alert("Media Device not supported")
      return;
  }
// {video: {width: {exact: 512}, height: {exact: 512}}
  navigator.mediaDevices.getUserMedia({video: {width , height }}).then(stream=>{
    document.getElementById("i_img").style.display = 'none'
    document.getElementById("i_camera").style.display = 'block'
    const cam = document.getElementById("i_camera")
    cam.srcObject = stream
    $.stream = stream
  }).catch(err=>{
    alert("Permission faield :", err)
  });

}

export function image(){
  $.queryAll('.img').forEach(elm => elm.style.display = 'none')
  const elem = document.getElementById('i_img')
  elem.style.display = 'block'

  isVideo = false
  console.log('main_i')
  //document.getElementById("i_capture").style.display = 'block'
  document.getElementById("i_camera").style.display = 'none'
  const gallary = document.getElementById('i_gallary')
  gallary.value = ''
  gallary.click()
}

// https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API/Taking_still_photos

export function process(){

  //document.querySelector('aside[name=generate]').style.visibility = 'visible'
  //document.querySelector('aside[name=generate] input').value = ''
  //document.querySelector('aside[name=generate] input').focus()
  console.log('process image')
  const files = $.event.target.files;

  const reader = new FileReader()
  reader.readAsDataURL(files[0]);  
  reader.onload = function(e){
    var img = new Image()
    img.src = e.target.result
    img.onload = function(){

      isImage = true


      $.queryAll('.img').forEach(elm => elm.style.display = 'none')
      const elem = document.getElementById('i_img')    
      elem.style.display = 'block'        
      
      const canvas = document.createElement('canvas') //document.getElementById('i_capture')
      const ctx = canvas.getContext("2d")
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img,0,0)

      document.getElementById("i_img").style.display = 'block'
      document.getElementById("i_camera").style.display = 'none'

      document.getElementById('i_img').src = canvas.toDataURL();
      //const cam = document.getElementById("i_camera")
      //console.log(cam)
      //cam.poster = canvas.toDataURL()
      //cam.poster = img
    }
  }
 
  form = new FormData()
  form.append('file', files[0])

  /*
  EXIF.getData(files[0], function() {
    var allMetaData = EXIF.getAllTags(this)
    console.log('exif',allMetaData)
  })
  */  
}

export function dropHandler(ev){ // https://www.smashingmagazine.com/2018/01/drag-drop-file-uploader-vanilla-js/
  ev.preventDefault()

  document.getElementById("i_img").style.display = 'block'
  document.getElementById("i_camera").style.display = 'none'
  //this.style.backgroundColor = '';
  console.log('drop',$.event.dataTransfer) // https://dev-gorany.tistory.com/254
  

  const file =  ev.dataTransfer.files[0]
  console.log(file)

  form = new FormData()
  form.append('file', file)

  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onloadend = ()=> {
    $.queryAll('.img').forEach(elm => elm.style.display = 'none')
    const elem = document.getElementById('i_img')
    elem.style.display = 'block'
    elem.src =  reader.result
    isImage = true
  }
  
}

export function dragOverHandler(ev){
  ev.preventDefault()

 // this.style.backgroundColor = 'pupple';
}

export async function clear(){
  $.queryAll('.img').forEach(elm => elm.style.display = 'none')
  const elem = document.getElementById('i_img')
  elem.style.display = 'block'

  stop()
  isVideo = false
  isImage = false
  document.getElementById("i_img").style.display = 'block'
  document.getElementById("i_camera").style.display = 'none'
  $.query('.output img').src = '/image/import.gif'
}

export function resolution(w, h){
  width = w
  height = h

  if(isVideo)
    camera()
}

function stop(){
  if($.stream)
    $.stream.getTracks().forEach( track => { track.stop() })
}

export async function removeResume(fileId){
  //$.event.target.className = 'selected'

  setTimeout(async ()=>{
    const isDelete = confirm('Do you wanna remove it?')
    //console.log($.event)
  
    if(isDelete){
      const url =  `/v1/p/delete?_id=${fileId}`
  
      const resp = await fetch(url).catch(e=>{
        console.error(e)
        $.loading(false)
        return
      })
      const json = await resp.json()
      console.log('result img',json.data)
      
      create()
    } //else 
    //  $.event.target.className = ''
  },50)
}

export async function removeAudio(fileId){
  //$.event.target.className = 'selected'

  setTimeout(async ()=>{
    const isDelete = confirm('Do you wanna remove it?')
    //console.log($.event)
  
    if(isDelete){
      const url =  `/v1/a/delete?_id=${fileId}`
  
      const resp = await fetch(url).catch(e=>{
        console.error(e)
        $.loading(false)
        return
      })
      const json = await resp.json()
      console.log('result img',json.data)
      
      create()
    } //else 
    //  $.event.target.className = ''
  },50)
}

export async function removeImage(fileId){
  //$.event.target.className = 'selected'

  setTimeout(async ()=>{
    const isDelete = confirm('Do you wanna remove it?')
    //console.log($.event)
  
    if(isDelete){
      const url =  `/v1/v/delete?_id=${fileId}`
  
      const resp = await fetch(url)
      const json = await resp.json()
      console.log('result img',json.data)
      
      create()
    } //else 
    //  $.event.target.className = ''
  },50)
}
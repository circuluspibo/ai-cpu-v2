let mode = 'txt'
let isPaint = false

let width = 512
let height = 512

let form = 0

let lastId = 0
let list = []

let isVideo = false
let isImage = false
let isFace = false

let image_id = 0
let image_type = 0

$.query('ul[name=files]').addEventListener("scroll", (event) => {
  console.log(event.target.scrollTop / event.target.scrollHeight, event)
  if(!isLoad && list.indexOf(lastId) < 0){
    if( event.target.scrollTop / event.target.scrollHeight > 0.4){
      isLoad = true
      create(lastId)
    }
  }
});

export async function init(){

}

export function popup(){
  $.query('aside').className = `animate__animated animate__fadeIn`
  $.query('aside').style.visibility = 'visible'
}

export async function create(_id){
  $.loading(false)

  fetch(`/v1/v/medias?userId=${_.userId}&type=webp&model=clip`).then(async resp=>{
    const items = await resp.json()
    console.log('result img',items)

    let isOdd = true

    if(!_id){
      $.query('ul[name=files] div[name=col1]').innerHTML = ''
      $.query('ul[name=files] div[name=col2]').innerHTML = ''
      list = items
    } else 
      list.push(...items)

    for(const item of items){
      lastId = item._id
      const elem = document.createElement('li')
      /*
      elem.innerHTML = `<video controlsList="nodownload" controls playsinline id='_${item.fileId}' preload='auto' class='square' src='/v1/v/media/${item.fileId}?type=mp4&length=${item.length}'></video>
      <button class='remove' onclick="$(event).remove('${item._id}')"><i class="fa-solid fa-trash"></i></button>`
      */
      elem.innerHTML = `<img src='/v1/v/media/${item.fileId}' onclick='$(event).selectImage("${item.fileId}")'>
      <button class='remove' onclick="$(event).remove('${item._id}')"><i class="fa-solid fa-trash"></i></button>
      <button class='down' onclick="$.download('/v1/i/gif?fileId=${item.fileId}','${item.fileId}.gif')"><i class="fa-solid fa-download"></i></button>`

      if(isOdd)
        $.query('ul[name=files] div[name=col1]').append(elem)
      else
        $.query('ul[name=files] div[name=col2]').append(elem)

      isOdd = !isOdd
    }
  })
}

export async function download(_id){
  alert('download')
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

export function close(){
  $.query('aside').className = `animate__animated animate__fadeOut`
  //$.query('aside').style.visibility = 'hidden'
}

export function changeLength(){
  console.log('changed')
  document.querySelector('#VIDEO span[name=length]').textContent = document.querySelector('#VIDEO input[name=length]').value
}

export async function generate(p='', m=''){

  document.getElementById("v_img").style.display = 'block'
  document.getElementById("v_camera").style.display = 'none'

  let prompt = document.querySelector('#VIDEO textarea[name=pos_prompt]').value
  let model = document.querySelector('#VIDEO input[name=v_model]:checked').value

  if(p){
    document.querySelector('#VIDEO textarea[name=pos_prompt]').value = p
    prompt = p
  }

  if(m){
    console.log(m)
    model = m
    document.getElementById(`v_${model}`).checked = true
  }

  let style = document.querySelector('#VIDEO input[name=v_style]:checked').value
  const negative = document.querySelector('#VIDEO textarea[name=neg_prompt]').value
  const frames = 8
  const upscale = document.querySelector('#VIDEO input[name=v_upscale]:checked').value
  const filter = document.querySelector('#VIDEO input[name=v_filter]:checked').value
  
  //document.querySelector('#VIDEO .workflow video').poster = '/image/loading.webp'
  document.querySelector('#v_img').src = '/image/loading.webp'

  if(prompt.length < 5){
    alert('입력 프롬프트가 너무 짧습니다. 올바른 생성을 위해 보다 길게 입력해 주세요.')
    return
  } else if(prompt.length > 100){
    alert('입력 프롬프트가 너무 깁니다. 올바른 생성을 위해 보다 짧게 입력해 주세요.')
    return
  }

  if(isVideo){

    const video =  document.getElementById("v_camera")
    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")
    ctx.translate(video.videoWidth, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video,0,0,video.videoWidth, video.videoHeight)

    const blob = await new Promise(resolve => canvas.toBlob(resolve))
    console.log('blob',blob)
    //canvas.toBlob() = blob=>{
    $.query('.output img').src = URL.createObjectURL(blob)
    //}
    
    /*
    if(!await $.getFace(blob)){
      alert('얼굴을 찾을수 없습니다. 이미지에 얼굴이 포함되어 있는지 다시 확인하세요.')
      clear()
      return
    }
    */

    form = new FormData()
    form.append('file',blob, Date.now())

    $.stream.getTracks().forEach( track => { track.stop() })
  
  } 

  $.loading(true)


  console.log(frames,filter)

  console.log(negative,prompt)

  // 576 

  if(model == 'v2'){
    if(style == '576|320')
      style = '896|512'
    else if(style == '320|576')
      style = '512|896'
    else
      style = '512|512'
  }

  style = style.split('|')

  let resp = 0
  let url = 0

  if(isImage || isVideo){
    if(negative)
      url = `/v1/v/generate?prompt=${prompt}&negative=${negative}&model=${model}&width=${style[0]}&height=${style[1]}&_.userId=${_.userId}&filter=${filter}&upscale=${upscale}`
    else
      url = `/v1/v/generate?prompt=${prompt}&model=${model}&width=${style[0]}&height=${style[1]}&userId=${_.userId}&filter=${filter}&upscale=${upscale}`
     
    resp = await fetch(url, { //prompt=${encodeURI('남자가 서 있다')}
      method: 'POST',
      body: form
    }).catch(e=>{
      alert(e)
      $.loading(false)
      return
    })

  } else {

    if(negative)
      url = `/v1/v/generate?prompt=${prompt}&negative=${negative}&model=${model}&width=${style[0]}&height=${style[1]}&_.userId=${_.userId}&filter=${filter}&upscale=${upscale}`
    else
      url = `/v1/v/generate?prompt=${prompt}&model=${model}&width=${style[0]}&height=${style[1]}&userId=${_.userId}&filter=${filter}&upscale=${upscale}`
    
    resp = await fetch(url).catch(e=>{
      alert(e)
      $.loading(false)
      return
    })
  }

  const json = await resp.json()
  console.log('result img',json.data.fileId)
  document.querySelector('#v_img').src = `/v1/v/media/${json.data.fileId}`

  isImage = false
  isVideo = false

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
  
  const elem = document.getElementById('v_img')
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
    document.getElementById("v_img").style.display = 'none'
    document.getElementById("v_camera").style.display = 'block'
    const cam = document.getElementById("v_camera")
    cam.srcObject = stream
    $.stream = stream
  }).catch(err=>{
    alert("Permission faield :", err)
  });

}

export function image(){
  
  const elem = document.getElementById('v_img')
  elem.style.display = 'block'

  isVideo = false
  console.log('main_i')
  //document.getElementById("i_capture").style.display = 'block'
  document.getElementById("v_camera").style.display = 'none'
  const gallary = document.getElementById('v_gallary')
  gallary.value = ''
  gallary.click()
}

// https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API/Taking_still_photos

export async function process(){

  //document.querySelector('aside[name=generate]').style.visibility = 'visible'
  //document.querySelector('aside[name=generate] input').value = ''
  //document.querySelector('aside[name=generate] input').focus()
  console.log('process image')
  const files = $.event.target.files;


  if(!await $.getFace(files[0])){
    alert('얼굴을 찾을수 없습니다. 이미지에 얼굴이 포함되어 있는지 다시 확인하세요.')
    clear()
    return
  }

  const reader = new FileReader()
  reader.readAsDataURL(files[0]);  
  reader.onload = function(e){
    var img = new Image()
    img.src = e.target.result
    img.onload = function(){

      isImage = true


      
      const elem = document.getElementById('v_img')    
      elem.style.display = 'block'        
      
      const canvas = document.createElement('canvas') //document.getElementById('i_capture')
      const ctx = canvas.getContext("2d")
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img,0,0)

      document.getElementById("v_img").style.display = 'block'
      document.getElementById("v_camera").style.display = 'none'

      document.getElementById('v_img').src = canvas.toDataURL();
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

export async function dropHandler(ev){ // https://www.smashingmagazine.com/2018/01/drag-drop-file-uploader-vanilla-js/
  ev.preventDefault()

  document.getElementById("v_img").style.display = 'block'
  document.getElementById("v_camera").style.display = 'none'
  //this.style.backgroundColor = '';
  console.log('drop',$.event.dataTransfer) // https://dev-gorany.tistory.com/254
  

  const file =  ev.dataTransfer.files[0]
  console.log(file)


  if(!await $.getFace(file)){
    alert('얼굴을 찾을수 없습니다. 이미지에 얼굴이 포함되어 있는지 다시 확인하세요.')
    clear()
    return
  }


  form = new FormData()
  form.append('file', file)

  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onloadend = ()=> {
    
    const elem = document.getElementById('v_img')
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
  
  const elem = document.getElementById('v_img')
  elem.style.display = 'block'

  stop()
  isVideo = false
  isImage = false
  document.getElementById("v_img").style.display = 'block'
  document.getElementById("v_camera").style.display = 'none'
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
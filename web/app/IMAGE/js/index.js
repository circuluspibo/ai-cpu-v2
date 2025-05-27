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
let isFace = false

let image_id = 0
let image_type = 0

$.query('ul[name=files]').addEventListener("scroll", (event) => {
  if(!isLoad && list.indexOf(lastId) < 0){
    if( event.target.scrollTop / (event.target.scrollHeight ) > 0.4){
      console.log('scolll')
      isLoad = true
      create(lastId)
    }
  }
});


export async function init(){

}

export async function create(_id){
  $.loading(false)


  let url = `/v1/getImages`

  if(_id)
    url += `&_id=${_id}`

  const resp = await fetch(url).catch(e=>{
    console.error(e)
    $.loading(false)
    return
  }).catch(e=>{
    alert(e)
    $.loading(false)
    return
  })
  const items = await resp.json()
  console.log('result img',items)

  if(!_id){
    $.query('ul[name=files] div[name=col1]').innerHTML = ''
    $.query('ul[name=files] div[name=col2]').innerHTML = ''
    list = items
    
  } else 
      list.push(...items)
  
  let isOdd = true

  for(const item of items){

    const elem = document.createElement('li')
    elem.innerHTML = `<img id='__${item}' src='/images/${item}' onclick='$(event).selectImage("${item}","")'>
    <button class='remove' onclick="$(event).remove('${item}')"><i class="fa-solid fa-trash"></i></button>
    <button class='down' onclick="$.download('/images/${item}','${item}')"><i class="fa-solid fa-download"></i></button>
    `

    
    if(isOdd)
      $.query('ul[name=files] div[name=col1]').append(elem)
    else
      $.query('ul[name=files] div[name=col2]').append(elem)

    isOdd = !isOdd

  }  

  if($.mode == 'junior'){
    $.query('div[name=option]').style.display = 'none'

    const elems = $.queryAll('textarea')
    for(const elem of elems)
      elem.style.height = '28%'
    $.query('button.gen').style.height = 'calc(44% - 310px)'
  }

  isLoad = false
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

export function change(m){
  mode = m

  $.query('div[name=o_text]').style.display = 'none'
  $.query('div[name=o_image]').style.display = 'none'
  $.query('div[name=o_draw]').style.display = 'none'

  switch(mode){
    case 'img':
      $.query('div[name=o_image]').style.display = 'block'
      break;
    case 'draw':
      $.query('div[name=o_draw]').style.display = 'block'
      if(!isPaint){
        isPaint = true
        Painterro({
          id : 'paint',
          hiddenTools : ['close'],
         // colorScheme: {
         //   main: '#fdf6b8', // make panels light-yellow
         //   control: '#FECF67' // change controls color
         // }
          saveHandler: async (image, done)=>{
            // you can also pass suggested filename 
            // formData.append('image', image.asBlob(), image.suggestedFileName());
      
            const txt = prompt('Driving input text>')
            const form = new FormData()
            const model = 'ani'
            const userId = 'test'
            form.append('file', image.asBlob(), image.suggestedFileName())
      
            let url = `/v1/draft?model=${model}&userId=${userId}&prompt=${encodeURI(txt)}`
            // old is media just img2img
      
            //if(isPhoto)
            //  url =`/v1/photo?&userId=${userId}`
      
            const resp = await fetch(url, { //prompt=${encodeURI('남자가 서 있다')}
              method: 'POST',
              body: form
            })
      
            const r = await resp.json()
            console.log('result',r.data)
            document.querySelector('img').src= `https://eva.circul.us/v1/media/${r.data.fileId}`
            done(false)
          }
        }).show()
      }
      break;
    default:
      $.query('div[name=o_text]').style.display = 'block'
  }
}

export function popup(){
  $.query('aside').className = `animate__animated animate__fadeIn`
  $.query('aside').style.visibility = 'visible'
}

export async function selectImage(fileId, type){
  const target = document.querySelector(`#__${fileId}`)

  image_type = type
  image_id = fileId

  $.queryAll(`img.clicked`).forEach(item=>{
    item.className = ''
  })

  target.className = 'clicked'

  document.querySelector('#i_img').src = `/v1/v/media/${image_id}`

}

export async function selectMenu(ev){

  const resp = await fetch(`/v1/v/media/${image_id}`)
  const type = resp.headers.get('Content-Type')
  const blob = await resp.blob()
  isFace = await $.getFace(blob)


  if(!isFace){
    alert('사람이 있는 이미지만 배경 제거가 가능합니다.')
    return
  }

  const isClear = confirm("배경을 제거 하시겠습니까?")
  $.loading(true)

  if(isClear){

    const res = await fetch(`/v1/i/removebg?userId=${_.userId}&image=${image_id}`).catch(e=>{
      alert(e)
      $.loading(false)
      return
    })

    const result = await res.json()

    document.querySelector('#i_img').src =  `/v1/v/media/${result.data}`
    create()
  }
}

const audio = new Audio()

export async function generate(p='', m=''){
  $.queryAll('.img').forEach(elm => elm.style.display = 'none')
  const elem = document.getElementById('i_img')
  elem.style.display = 'block'

  let prompt = document.querySelector('#image textarea[name=prompt]').value
  let model = document.querySelector('#image input[name=i_model]:checked').value

  if(p){
    document.querySelector('#image textarea[name=prompt]').value = p
    prompt = p
  }


  audio.src = `/v1/tts?text=${prompt}&name=ko_base&voice=0&lang=ko&static=1`
  audio.play()//aud.script = t

  if(m){
    console.log(m)
    model = m
    document.getElementById(`i_${model}`).checked = true
  }

  document.getElementById("i_img").style.display = 'block'
  document.getElementById("i_camera").style.display = 'none'

  if(isVideo){

    const video =  document.getElementById("i_camera")
    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")
    ctx.translate(video.videoWidth, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video,0,0,video.videoWidth, video.videoHeight)

    const blob = await new Promise(resolve => canvas.toBlob(resolve))
    console.log('blob',blob)
    $.query('.output img').src = URL.createObjectURL(blob)

    form = new FormData()
    form.append('file',blob, Date.now())

    $.stream.getTracks().forEach( track => { track.stop() })
    isFace = await $.getFace(blob)


  } else if (image_id){ // 이미지 업로드
    const resp = await fetch(`/v1/v/media/${image_id}`)
    const type = resp.headers.get('Content-Type')
    const blob = await resp.blob()
    isFace = await $.getFace(blob)

    form = new FormData()
    form.append('file',blob, Date.now())
  }

  const style = document.querySelector('#image input[name=i_style]:checked').value.split('|')
  const negative = document.querySelector('#image textarea[name=neg_prompt]').value
  const upscale = document.querySelector('#image input[name=i_upscale]:checked').value
  const filter = document.querySelector('#image input[name=i_filter]:checked').value

  if(prompt.length < 5){
    alert('입력 프롬프트가 너무 짧습니다. 올바른 생성을 위해 보다 길게 입력해 주세요.')
    return
  } else if(prompt.length > 512){
    alert('입력 프롬프트가 너무 깁니다. 올바른 생성을 위해 보다 짧게 입력해 주세요.')
    return
  }
 
  $.loading(true)
  
  document.querySelector('#image .workflow img').src = '/web/image/loading.webp'

  let url
  let resp

  console.log(upscale,filter)
  console.log(negative,prompt)

  if(isImage || isVideo || image_id){ // 레퍼런스 
    console.log('---------------------------------------------- isFace',isFace)
    if(isFace){
      if(image_id){ // ref
        if(negative)
          url = `/v1/v/face?prompt=${prompt}&negative=${negative}&model=${model}&pose=face&width=${style[0]}&height=${style[1]}&userId=${_.userId}&upscale=${upscale}&filter=${filter}&isFace=${image_type == 'png' ? 0 : 1}`
        else
          url = `/v1/v/face?prompt=${prompt}&model=${model}&pose=face&width=${style[0]}&height=${style[1]}&userId=${_.userId}&upscale=${upscale}&filter=${filter}&isFace=${image_type == 'png' ? 0 : 1}` 
      } else  // upload
        url = `/v1/v/face?prompt=${prompt}&negative=${negative}&model=${model}&pose=face&width=${style[0]}&height=${style[1]}&userId=${_.userId}&upscale=${upscale}&filter=${filter}&isFace=1`
    } else { // 이미지 참조
      if(negative)
        url = `/v1/v/ref?prompt=${prompt}&negative=${negative}&model=${model}&pose=face&width=${style[0]}&height=${style[1]}&userId=${_.userId}&upscale=${upscale}&filter=${filter}`
      else
        url = `/v1/v/ref?prompt=${prompt}&model=${model}&pose=face&width=${style[0]}&height=${style[1]}&userId=${_.userId}&upscale=${upscale}&filter=${filter}`  
    }

    resp = await fetch(url, { //prompt=${encodeURI('남자가 서 있다')}
      method: 'POST',
      body: form
    }).catch(e=>{
      alert(e)
      $.loading(false)
      return
    })

  } else { // 일반 프롬프트

    if(negative)
      url = `/v1/txt2img?name=${model}&sentence=${prompt}&w=${style[0]}&h=${style[1]}&upscale=${upscale}&filter=${filter}`
    else
      url = `/v1/txt2img?name=${model}&sentence=${prompt}&w=${style[0]}&h=${style[1]}&upscale=${upscale}&filter=${filter}`
    
    resp = await fetch(url).catch(e=>{
      console.error(e)
      $.loading(false)
      return
    }).catch(e=>{
      alert(e)
      $.loading(false)
      return
    })
  }

  const blob = await resp.blob()

  $.loading(false)
  //console.log('result >>>',json.data)

  elem.style.display = 'none'

  if(filter == 1){
    if(style[0] == 896 && style[1] == 512){
      $.queryAll('.landscape').forEach(elm => elm.style.display = 'block')
      $.query('img[name=i_l_0]').src = `/v1/v/media/${json.data.fileId[0]}`
      $.query('img[name=i_l_1]').src = `/v1/v/media/${json.data.fileId[1]}`
    } else if(style[0] == 512 && style[1] == 896){
      $.queryAll('.portrait').forEach(elm => elm.style.display = 'block')
      $.query('img[name=i_p_0]').src = `/v1/v/media/${json.data.fileId[0]}`
      $.query('img[name=i_p_1]').src = `/v1/v/media/${json.data.fileId[1]}`
    } else { // sqaure
      $.queryAll('.square').forEach(elm => elm.style.display = 'block')
      $.query('img[name=i_s_0]').src = `/v1/v/media/${json.data.fileId[0]}`
      $.query('img[name=i_s_1]').src = `/v1/v/media/${json.data.fileId[1]}`
      $.query('img[name=i_s_2]').src = `/v1/v/media/${json.data.fileId[2]}`
      $.query('img[name=i_s_3]').src = `/v1/v/media/${json.data.fileId[3]}`
    }  
  } else {
    elem.style.display = 'block'
    elem.src = URL.createObjectURL(blob);
  }
    
    
  isImage = false
  isVideo = false
  isFace = false
  image_id = 0

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
  $.listen(generate)
  //$.query('textarea[name=prompt]').className = 'listen'
}

export function listening(text){
  $.query('textarea[name=prompt]').textContent = text
}

export function listened(){
  $.query('textarea[name=prompt]').className = ''
  if($.query('textarea[name=prompt]').textContent.length > 0)
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
  console.log('process image')
  const files = $.event.target.files;

  const reader = new FileReader()
  reader.readAsDataURL(files[0]);  
  reader.onload = function(e){
    var img = new Image()
    img.src = e.target.result
    img.onload = async function(){

      isImage = true


      $.queryAll('.img').forEach(elm => elm.style.display = 'none')
      const elem = document.getElementById('i_img')    
      elem.style.display = 'block'        
      
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext("2d")
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img,0,0)

      document.getElementById("i_img").style.display = 'block'
      document.getElementById("i_camera").style.display = 'none'

      document.getElementById('i_img').src = canvas.toDataURL();
      isFace = await $.getFace(files[0])
    }
  }
 
  form = new FormData()
  form.append('file', files[0])
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
}

export async function clear(){
  $.queryAll('.img').forEach(elm => elm.style.display = 'none')
  const elem = document.getElementById('i_img')
  elem.style.display = 'block'

  stop()
  
  image_id = 0
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
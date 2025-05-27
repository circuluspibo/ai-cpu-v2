
let image_id = 0
let audio_id = {}
let audio_ids = []
let prompt = 0
let timeout = 0
let isVideo = false

let a_lastId = 0
let a_list = []
let a_isLoad = false
let auto = 'full'

let i_lastId = 0
let i_list = []
let i_isLoad = false

let fileId = 0

$.query('ul[name=images]').addEventListener("scroll", (event) => {
  console.log(event.target.scrollTop / event.target.scrollHeight, event)
  if(!i_isLoad && i_list.indexOf(i_lastId) < 0){
    if( event.target.scrollTop / event.target.scrollHeight > 0.4){
      i_isLoad = true
      loadImage(i_lastId)
    }
  }
})

$.query('ul[name=audios]').addEventListener("scroll", (event) => {
  console.log(event.target.scrollTop / event.target.scrollHeight, event)
  if(!a_isLoad && a_list.indexOf(a_lastId) < 0){
    if( event.target.scrollTop / event.target.scrollHeight > 0.4){
      a_isLoad = true
      loadAudio(a_lastId)
    }
  }
})

export async function init(){
  const vid = $.query('video')
  vid.onended = ()=>{
    console.log('vid control',vid)
    vid.autoplay = false
    vid.controls = true
      
  }
}

export function popup(){
  $.query('aside').className = `animate__animated animate__fadeIn`
  $.query('aside').style.visibility = 'visible'
}

export async function create(){
  $.loading(false)


  /*
  fetch(`/v1/v/medias?userId=${_.userId}&type=mp4&model=human`).then(async resp=>{
    const items = await resp.json()
    console.log('result img',items)
  
    document.querySelector('#HUMAN ul[name=files]').innerHTML = ''
  
    for(const item of items){
      const elem = document.createElement('li')
      elem.innerHTML = `<video controlsList="nodownload" controls playsinline id='_${item.fileId}' preload='auto' class='square' src='/v1/v/media/${item.fileId}?type=mp4&length=${item.length}'></video>`

      document.querySelector('#HUMAN ul[name=files]').append(elem)
    }
  })
  */

  loadImage()
  loadAudio()

  if($.mode == 'noclip'){
    $.query('ul[name=videos]').style.display = 'none'
    $.query('ul[name=images]').style.width = '100%'
  }
}

function loadImage(_id){

  $.query('ul[name=images]').innerHTML = ''
  $.query('ul[name=videos]').innerHTML = ''

  fetch(`/v1/getImages`).then(async resp=>{
    const items = await resp.json()
    console.log('result img',items)

    let isOdd = true

    for(let item of items){
      item = item.split('.')[0]
      console.log(item)
      i_lastId = item
      const elem = document.createElement('li')
      elem.innerHTML = `<img id='__${item}' src='/images/${item}.jpg' onclick='$(event).selectImage("${item}","")'>
      <button class='remove' onclick="$(event).remove('${item}')"><i class="fa-solid fa-trash"></i></button>
      <button class='down' onclick="$.download('/images/${item}','${item}')"><i class="fa-solid fa-download"></i></button>`
  
      
      if(isOdd)
        $.query('ul[name=images]').append(elem)
      else
        $.query('ul[name=videos]').append(elem)
  
      isOdd = !isOdd
    }  
  })
}

function loadAudio(_id){

  //document.querySelector('#HUMAN ul[name=audios]').innerHTML = ''

  fetch(`/v1/getVoices`).then(async resp=>{
    const items = await resp.json()
    console.log('result voices',items)
  
    if(!_id){
      $.query('ul[name=audios]').innerHTML = ''
      a_list = items
    } else 
      a_list.push(...items)
  
    a_isLoad = false
  
    for(let item of items){
      const org = item
      item = item.split('.wav')[0].replace('.','_')
      a_lastId = item
  
      const elem = document.createElement('li')
      elem.innerHTML = `
      <fieldset id='__${item}'  onclick='$(event).selectAudio("${item}")'>
        <p>${$.short(item)}
        <button class='remove' onclick="$(event).remove('${item}')"><i class="fa-solid fa-trash"></i></button>
        <button class='down' onclick="$.download('/voices/${org}')"><i class="fa-solid fa-download"></i></button>      
        </p>   
        <audio controlsList="nodownload"  id='_${item}' controls src="/voices/${org}"></audio>
      </fieldset>
      `
      $.query('ul[name=audios]').append(elem)
  
     // new Plyr(`#_${item.fileId}`)
    }
  })
}

export async function selectImage(fileId, isVid=false){

  const target = document.querySelector(`#__${fileId}`)

  //const resp = await fetch(document.getElementById(`__${fileId}`).src)
  //const blob = await resp.blob()

  /*
  if(!await $.getFace(blob)){
    alert('얼굴을 찾을수 없습니다. 이미지에 얼굴이 포함되어 있는지 다시 확인하세요.')
    clear()
    return
  }
    */

  isVideo = isVid
  image_id = fileId

  /*
  if(target.naturalWidth == target.naturalHeight)
    auto = 'crop' // crop
  else
    auto = 'full'
  */

  document.querySelector('#HUMAN .workflow video').poster = `/images/${image_id}.jpg`
  document.querySelector('#HUMAN .workflow video').src = ''

  $.queryAll(`img.clicked`).forEach(item=>{
    item.className = ''
  })

  target.className = 'clicked'
}

export function selectAudio(fileId,text){

  if(document.querySelector(`#__${fileId}`).className == 'clicked'){
    document.querySelector(`#__${fileId}`).className = ''
    delete audio_id[fileId]
    return
  }

  //const old = $.query('.clicked')

  //if(old)
  //  old.className = ''

  //audio_id = fileId
  audio_id = fileId.replace('_','.')
  //audio_id[fileId] = true
  prompt = text

  document.querySelector(`#__${fileId}`).className = 'clicked'
  //document.querySelector(`#_${fileId}`).play()
}

export function close(){
  $.query('aside').className = `animate__animated animate__fadeOut`
  //$.query('aside').style.visibility = 'hidden'
}

export async function generate(){
  document.querySelector('#HUMAN ul[name=audios]').className = ''
  document.querySelector('#HUMAN ul[name=images]').className = ''
  clearTimeout(timeout)

  if(!image_id){
    document.querySelector('#HUMAN ul[name=images]').className = 'check'
    alert('Image item is not selected!')
    timeout = setTimeout(()=>{
      document.querySelector('#HUMAN ul[name=images]').className = ''
    },3000)
    return
  }  

  if(Object.keys(audio_id).length == 0){
    document.querySelector('#HUMAN ul[name=audios]').className = 'check'
    alert('Speech item is not selected!')    
    timeout = setTimeout(()=>{
      document.querySelector('#HUMAN ul[name=audios]').className = ''
    },3000)
    return
  }

  /*const mode = document.querySelector('#HUMAN input[name=h_type]:checked').value*/
  //const mode = document.querySelector('#HUMAN select[name=h_type]').value
  //let style = document.querySelector('#HUMAN select[name=style]').value
  const remove = document.querySelector('#HUMAN input[name=h_remove]:checked').value
  const enhance = document.querySelector('#HUMAN input[name=h_enhance]:checked').value

  //if(style == 'random')
  const style = Math.floor(Math.random() * 46)

  $.loading(true)
  document.querySelector('#HUMAN .workflow video').preload = '/image/loading.webp'

  /*
  const resp = await fetch(`blob:http://127.0.0.1/v1/img2human?image=${image_id}&audio=${audio_id}&remove=${remove}&userId=${_.userId}&isVideo=${isVideo ? 1 : 0}`).catch(e=>{
    console.error(e)
    $.loading(false)
    return
  }).catch(e=>{
    alert(e)
    $.loading(false)
    return
  })
  const json = await resp.json()
  $.loading(false)
  console.log('result img',json.data.fileId)
  */

  alert(image_id + " / " + audio_id)

  $.loading(false)

  document.querySelector('#HUMAN .workflow video').src = `/v1/img2human?image=${image_id}&audio=${audio_id}&remove=${remove}&userId=${_.userId}`
  //document.querySelector('#HUMAN .workflow video').autoplay = true
  //document.querySelector('#HUMAN .workflow img').src = `${lb.getGen()}/v1/txt2${model}?sentence=${encodeURI(prompt)}&w=${style[0]}&h=${style[1]}`

  //fileId = json.data.fileId
  image_id = 0
  audio_id = []

 // create()
  
}


export async function download(){
  if(fileId)
    $.download(`/v1/v/mp4?fileId=${fileId}&license=1`,`${fileId}.mp4`)
  else
    alert('다운로드 할 영상이 존재하지 않습니다.')
}


export async function remove(){

  if(!fileId ){
    alert('삭제 할 영상이 존재하지 않습니다.')
    return
  }

  const isDelete = confirm('Do you wanna remove it?')
  //console.log($.event)

  if(isDelete){
    const url =  `/v1/v/delete?_id=${fileId}`

    const resp = await fetch(url).catch(e=>{
      console.error(e)
      $.loading(false)
      return
    }).catch(e=>{
      alert(e)
      $.loading(false)
      return
    })
    const json = await resp.json()
    console.log('result img',json.data)
    
    document.querySelector('#HUMAN .workflow video').src = ''
    fileId = 0
    //loadVideo()
  }
}

/*
export function oncontextmenu(ev){
  console.log('context> ',ev)
  console.log(ev.clientX,ev.clientY)
}
*/

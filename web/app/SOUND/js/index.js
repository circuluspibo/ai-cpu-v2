
let wavesurfer = 0
let down = 0 

let lastId = 0
let isLoad = false
let list = []

let isFile = false
let isVideo = false

let form = 0

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

  wavesurfer = WaveSurfer.create({
    container: '#waveform2',
    waveColor: '#7f58a1',
    height : document.querySelector('#waveform2').offsetHeight,
    progressColor: '#2d1333',
    url : '/v1/a/audio/646b5736386a05de196e4b58'
  })

}

export function popup(){
  $.query('aside').className = `animate__animated animate__fadeIn`
  $.query('aside').style.visibility = 'visible'
}

export async function create(_id){

  $.loading(false)
  //model=sound&
  const resp = await fetch(`/v1/getSounds`).catch(e=>{
    alert(e)
    $.loading(false)
    return
  })
  const items = await resp.json()
  console.log('result img',items)

  if(!_id){
    $.query('ul[name=files]').innerHTML = ''
    list = items
  } else 
    list.push(...items)

  isLoad = false

  for(const item of items){
    lastId = item._id

    const elem = document.createElement('li')
    elem.innerHTML = `
    <fieldset ondblclick="alert('${item}')">
      <p>${$.short(item)}
      <button class='remove' onclick="$(event).remove('${item}')"><i class="fa-solid fa-trash"></i></button>
      <button class='down' onclick="$.download('/v1/a/mp3?fileId=${item}','${item}')"><i class="fa-solid fa-download"></i></button>
      </p>  
      <audio controlsList="nodownload"  id='_${item}' controls src="/sounds/${item}"></audio>
    </fieldset>
    `
    document.querySelector('#SOUND ul[name=files]').append(elem)

    //new Plyr(`#_${item.fileId}`)
  }

  if($.mode == 'junior'){
    $.query('div[name=option]').style.display = 'none'
    $.query('button.gen').style.height = '148px'
  }


}

export async function remove(fileId){
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

export function close(){
  $.query('aside').className = `animate__animated animate__fadeOut`
  //$.query('aside').style.visibility = 'hidden'
}

export async function generate(p='', m=''){

  let prompt = document.querySelector('#SOUND textarea[name=pos_prompt]').value
  let model = document.querySelector('#SOUND input[name=s_model]:checked').value





  if(p){
    document.querySelector('#SOUND textarea[name=pos_prompt]').value = p
    prompt = p
  }

  if(m){
    console.log(m)
    model = m
    document.getElementById(`m_${model}`).checked = true
  }

  //const negative = document.querySelector('#SOUND input[name=neg_prompt]').value
  const dur = document.querySelector('#SOUND input[name=length]').value

  //const scale = document.querySelector('#SOUND input[name=s_guide]:checked').value
  //const steps = document.querySelector('#SOUND input[name=s_steps]:checked').value
  //const enhance = document.querySelector('#SOUND input[name=s_enhance]:checked').value

  
  if(prompt.length < 5){
    alert('입력 프롬프트가 너무 짧습니다. 올바른 생성을 위해 보다 길게 입력해 주세요.')
    return
  } else if(prompt.length > 500){
    alert('입력 프롬프트가 너무 깁니다. 올바른 생성을 위해 보다 짧게 입력해 주세요.')
    return
  }
 
  $.loading(true)
  

  console.log('=================')
  console.log('pitch')

  //document.querySelector('#VOICE audio[name=output]').src = `${lb.getSlm()}/v1/tts?text=${text}!&voice=${voice}&lang=${lang}&pitch=${pitch}&rate=${rate}&volume=${volume}`
 //if(negative)
  //  url = `/v1/a/audio?prompt=${prompt}&negative=${negative}&model=${model}&scale=${scale}&dur=${dur}&userId=${_.userId}&enhance=${enhance}&steps=${steps}`    
  //else
  let url = `/v1/txt2${model}?prompt=${prompt}&dur=${dur}&userId=${_.userId}`
  
  const resp = await fetch(url).catch(e=>{
    console.error(e)
    $.loading(false)
    return
  }).catch(e=>{
    alert(e)
    $.loading(false)
    return
  })

  $.loading(false)

  const data = await resp.blob()

  wavesurfer.loadBlob(data)

  wavesurfer.on('ready', function () {
    create()
  
  });
} 

export function download(){
  $.download(down,'generated.mp3')
}

export function changeLength(){
  console.log('changed')
  document.querySelector('#SOUND span[name=length]').textContent = document.querySelector('#SOUND input[name=length]').value
}

export function changeGuide(){
  console.log('changed')
  document.querySelector('#SOUND span[name=guide]').textContent = document.querySelector('#SOUND input[name=guide]').value
}


export function play(){
  wavesurfer.play()
}

export function pause(){
  wavesurfer.pause()
}

export function stop(){
  wavesurfer.stop()
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
  $.query('textarea[name=pos_prompt]').value = text
}

export function listened(){
  $.query('textarea[name=pos_prompt]').className = ''
  if($.query('textarea[name=pos_prompt]').value.length > 0)
    generate()
}


export function file(){
  isFile = false
  console.log('main_v')
  //document.getElementById("i_capture").style.display = 'block'
  //document.getElementById("i_camera").style.display = 'block'
  const gallary = document.getElementById('s_gallary')
  gallary.value = ''
  gallary.click()
}

export function dropHandler(ev){ // https://www.smashingmagazine.com/2018/01/drag-drop-file-uploader-vanilla-js/
  ev.preventDefault()

  //this.style.backgroundColor = '';
  console.log('drop',$.event.dataTransfer) // https://dev-gorany.tistory.com/254
  

  const file =  ev.dataTransfer.files[0]
  console.log(file)

  form = new FormData()
  form.append('file', file)

  const reader = new FileReader()

  reader.onload = function(e){
    var blob = new window.Blob([new Uint8Array(e.target.result)],{type: file.type });
    wavesurfer.loadBlob(blob);
    isFile = true
  }

  reader.readAsArrayBuffer(file)
  
}

export function dragOverHandler(ev){
  ev.preventDefault()
}

export async function process(){
  $.loading(true)
  //document.querySelector('aside[name=generate]').style.visibility = 'visible'
  //document.querySelector('aside[name=generate] input').value = ''
  //document.querySelector('aside[name=generate] input').focus()

  console.log('process image')
  const files = $.event.target.files;

  document.getElementById("s_img").style.display = 'block'
  document.getElementById("s_img").src = URL.createObjectURL(files[0])

  console.log(files)

  const reader = new FileReader()
  //reader.readAsDataURL(files[0]);  
  console.log(1)
  reader.onload = function(e){
    console.log(e)
    var blob = new Blob([new Uint8Array(e.target.result)],{type: files[0].type });
    wavesurfer.loadBlob(blob);
    isFile = true
  }
  reader.readAsArrayBuffer(files[0])
 
  console.log(2)
  form = new FormData()
  form.append('file', files[0])
  form.append('prompt','이미지 해설을 제외한 음악 작곡을 위한 악기, 스타일, 톤을 포함하는 프롬프트를 1개만 명료하게 알려줘.')

  //const resp = await fetch(`https://oe-napi.circul.us/v1/img2chat?prompt='이미지 해설을 제외한 음악 작곡을 위한 악기, 스타일, 톤을 포함하는 프롬프트를 1개만 명료하게 알려줘.'&userId=${_.userId}`,{
  const resp = await fetch(`v1/i/chat?userId=${_.userId}`,{
    method: 'POST',
    body: form
  }).catch(e=>{
    alert(e)
    $.loading(false)
    return
  })

  const data = await resp.text()
  document.getElementById("s_img").style.display = 'none'
  $.loading(false)
  console.log('result data',data)

  $.query('textarea[name=pos_prompt]').value = data.replace(/\n/gi, "").replace(/"/gi, "")
}

export async function clear(){
  stop()  
  form = 0
  isFile = false

  wavesurfer.empty()
}

export async function camera(){

  if(isVideo){
    $.loading(true)
    isVideo = false

    const video =  document.getElementById("s_camera")
    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")
    ctx.translate(video.videoWidth, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video,0,0,video.videoWidth, video.videoHeight)

    const blob = await new Promise(resolve => canvas.toBlob(resolve))
    console.log('blob',blob)

  
    form = new FormData()
    form.append('file',blob, Date.now())
    form.append('prompt','이미지 해설을 제외한 음악 작곡을 위한 악기, 스타일, 톤을 포함하는 프롬프트를 1개만 명료하게 알려줘.')

    $.stream.getTracks().forEach( track => { track.stop() })
    video.style.display = 'none'

    document.getElementById("s_img").style.display = 'block'
    document.getElementById("s_img").src = URL.createObjectURL(blob)
    

    const resp = await fetch(`v1/i/chat?userId=${_.userId}`,{
      method: 'POST',
      body: form
    }).catch(e=>{
      alert(e)
      $.loading(false)
      return
    })
  
    const data = await resp.text()
    $.loading(false)
    document.getElementById("s_img").style.display = 'none'
    $.query('textarea[name=pos_prompt]').value = data.replace(/\n/gi, "").replace(/"/gi, "")

  } else {
    isVideo = true

    console.log('main_c')
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia ){
        // Navigator mediaDevices not supported
        alert("Media Device not supported")
        return;
    }
    let width = 896
    let height = 512
  // {video: {width: {exact: 512}, height: {exact: 512}}
    navigator.mediaDevices.getUserMedia({video: {width , height }}).then(stream=>{
      //document.getElementById("i_img").style.display = 'none'
      document.getElementById("s_camera").style.display = 'block'
      const cam = document.getElementById("s_camera")
      cam.srcObject = stream
      $.stream = stream
    }).catch(err=>{
      alert("Permission faield :", err)
    });
  }
}
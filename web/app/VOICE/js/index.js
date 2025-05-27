//import WaveSurfer from 'https://unpkg.com/wavesurfer.js@beta'

import WaveSurfer from 'http://127.0.0.1:9999/web/js/wavesurfer.esm.js'
import RecordPlugin from 'http://127.0.0.1:9999/web/js/record.esm.js'


const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

let wavesurfer = 0
let down = 0

let lastId = 0
let isLoad = false
let list = []

let isFile = false
let form = 0

let rec = 0

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
    container: '#waveform',
    waveColor: '#7f58a1',
    height : document.querySelector('#waveform').offsetHeight,
    progressColor: '#2d1333',
    //barWidth: 5,
    //barGap: 1,
    //barRadius: 2,
    //url : '/v1/a/audio/646b5736386a05de196e4b58'
  });

  rec = wavesurfer.registerPlugin(RecordPlugin.create())

  rec.on('record-end', (blob) => {
    isFile = true
    form = new FormData();
    form.append("file", blob, 'voice.wav')
  })

}

export function popup(){
  $.query('aside').className = `animate__animated animate__fadeIn`
  $.query('aside').style.visibility = 'visible'
}

export async function create(_id){
  $.loading(false)
  const resp = await fetch(`/v1/getVoices`)
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
      <button class='down' onclick="$.download('/voices/${item}')"><i class="fa-solid fa-download"></i></button>      
      </p>   
      <audio controlsList="nodownload"  id='_${item}' controls src="/voices/${item}"></audio>
    </fieldset>
    `
    document.querySelector('#VOICE ul[name=files]').append(elem)

   // new Plyr(`#_${item.fileId}`)
  }

  const res = await fetch(`/v1/a/audios?userId=${_.userId}&type=wav&model=profile`).catch(e=>{
    console.error(e)
    return
  })

  const voices = await res.json()

  console.log('profile',voices)

  $.queryAll('option.clone').forEach(elem=>{
    elem.remove()
  })

  for(const item of voices){
    const elem = document.createElement('option')
    elem.className = 'clone'
    elem.value = item.fileId
    elem.innerText = item.fileId
    $.query('select[name=voice]').append(elem)
  }


}

export function close(){
  $.query('aside').className = `animate__animated animate__fadeOut`
  //$.query('aside').style.visibility = 'hidden'
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

export function download(){
  $.download(down,'generated.mp3')
}

let sample = {
  "ko" : "안녕하세요. LG그램과 함께 온 디바이스 AI를 체험해 보세요.",
  "en" : "Hello. Experience the AI ​​of the on-device with LG Gram.",
  "cn" : "你好。体验 LG Gram 附带的设备人工智能。",
  "ja" : "こんにちは。 LGグラムと一緒に来たデバイスAIを体験してください。",
  "ar" : "مرحبًا استمتع بتجربة الجهاز AI الذي يأتي مع LG Gram.", // مرحبًا دعونا ننشئ عالمًا من الذكاء الاصطناعي على الجهاز معًا.
  "de" : "Hallo. Erleben Sie die Geräte-KI, die mit LG Gram ausgestattet ist.",
  "fa" : "سلام هوش مصنوعی دستگاه همراه با LG Gram را تجربه کنید.",
  "fr" : "Bonjour. Découvrez l'IA de l'appareil fournie avec LG Gram.",
  "id" : "Halo. Rasakan perangkat AI yang disertakan dengan LG Gram.",
  "km" : "សួស្តី បទពិសោធន៍ឧបករណ៍ AI ដែលភ្ជាប់មកជាមួយ LG Gram ។",
  "mn" : "сайн уу. LG Gram-д дагалддаг төхөөрөмжийн хиймэл оюун ухааныг мэдрээрэй.",
  "pt" : "olá. Experimente a IA do dispositivo que vem com o LG Gram.",
  "ru" : "привет. Испытайте искусственный интеллект устройства, который поставляется с LG Gram.",
  "th" : "สวัสดี. สัมผัสประสบการณ์อุปกรณ์ AI ที่มาพร้อมกับ LG Gram",
  "tr" : "Merhaba. LG Gram ile birlikte gelen cihazın yapay zekasını deneyimleyin.",
  "vi" : "Xin chào. Trải nghiệm thiết bị AI đi kèm với LG Gram.",
}
let lang = 'ko'
let voice = 0

export function changeVoice(evt){
  console.log($.event.target.value, $.event.target.value.length)
  //if($.event.target.value.length == 24)
  //  wavesurfer.load(`/v1/a/audio/${$.event.target.value}`)
  //else if($.event.target.value.startsWith("e_"))
  //  wavesurfer.load(`https://oe-sapi.circul.us/v1/tts?text=hello.&voice=${$.event.target.value}`) 
  //else 
    wavesurfer.load(`/v1/tts?text=안녕하세요.&voice=${$.event.target.value}`)
}

export function changeLang(evt){
  console.log($.event.target.value, $.event.target.value.length)
  lang = $.event.target.value
  const text = sample[lang]
  document.querySelector('#VOICE textarea[name=prompt]').value = text
  voice = 0
  wavesurfer.load(`/v1/tts?text=${text}&lang=${lang}&voice=${voice}`)
    
}

const voices = [
  'main','girl','girl2','girl3','boy','boy2','boy3','oldman','oldman2','oldman3','oldwoman','oldwoman2','oldwoman3',
  'man1','man2','man3','man4','man5','man6','man7','man8','man9','man10','man11','man12',
  'woman1','woman2','woman3','woman4','woman5','woman6','woman7','woman8','woman9','woman10','woman11','woman12',
  'e_main','e_boy','e_girl','e_man1','e_woman1',
  'CST','GYJ','JSY','JYS','KJE','KKI','PSB','SHR','BJS','CHS','GTE','HSJ','PSM','HJH','JBG','KDD','KMA','KTH','LJH','LSJ','PMK','SSH','CYJ','GJY','OMH','LSW',
  /*
  'ASH_1','CHY_1','PGJ_1','YSH_1','HGW_1','JBR_1','JSH_1','KDD_1','KSH_1','LJA_1','LJB_1','LYT_1','JCH_1','JYW_1','KIH_1','KJS_1','KYK_1','LHJ_1','LSY_1','OES_1',
  'ASH_2','CHY_2','PGJ_2','YSH_2','HGW_2','JBR_2','JSH_2','KDD_2','KSH_2','LJA_2','LJB_2','LYT_2','JCH_2','JYW_2','KIH_2','KJS_2','KYK_2','LHJ_2','LSY_2','OES_2',
  'ASH_3','CHY_3','PGJ_3','YSH_3','HGW_3','JBR_3','JSH_3','KDD_3','KSH_3','LJA_3','LJB_3','LYT_3','JCH_3','JYW_3','KIH_3','KJS_3','KYK_3','LHJ_3','LSY_3','OES_3',
  'ASH_4','CHY_4','PGJ_4','YSH_4','HGW_4','JBR_4','JSH_4','KDD_4','KSH_4','LJA_4','LJB_4','LYT_4','JCH_4','JYW_4','KIH_4','KJS_4','KYK_4','LHJ_4','LSY_4','OES_4',
  'ASH_5','CHY_5','PGJ_5','YSH_5','HGW_5','JBR_5','JSH_5','KDD_5','KSH_5','LJA_5','LJB_5','LYT_5','JCH_5','JYW_5','KIH_5','KJS_5','KYK_5','LHJ_5','LSY_5','OES_5',
  'ASH_6','CHY_6','PGJ_6','YSH_6','HGW_6','JBR_6','JSH_6','KDD_6','KSH_6','LJA_6','LJB_6','LYT_6','JCH_6','JYW_6','KIH_6','KJS_6','KYK_6','LHJ_6','LSY_6','OES_6',
  'ASH_7','CHY_7','PGJ_7','YSH_7','HGW_7','JBR_7','JSH_7','KDD_7','KSH_7','LJA_7','LJB_7','LYT_7','JCH_7','JYW_7','KIH_7','KJS_7','KYK_7','LHJ_7','LSY_7','OES_7'*/
]

export async function generate(p='', m=''){
  $.loading(true)
  
  let prompt = document.querySelector('#VOICE textarea[name=prompt]').value

  if(p)
    prompt = p
  //const lang = document.querySelector('#VOICE input[name=lang]:checked').value
  let voice = document.querySelector('#VOICE select[name=voice]').value
  //const lang = $.query('select[name=lang]').value

  if(m)
    voice = m

  if(voice.startsWith('e_')){
    voice = voice.replace('e_','')
    lang = 'en'
  }

  if(prompt.length < 2){
    alert('프롬프트가 너무 짧습니다. 2자 이상으로 작성해 주세요.')
    return
  }

  const pitch = document.querySelector('#VOICE select[name=pitch]').value
  const rate = document.querySelector('#VOICE select[name=rate]').value
  //const volume = document.querySelector('#VOICE select[name=volume]').value
  const volume = 100

  //const tts = new Audio(`${lb.getSlm()}/v1/tts?text=${img.split('.')[0]}!&voice=${voice}&lang=${lang}`)
  //tts.play()
  //alert(text)

  console.log('=================')
  console.log('pitch')

  
  const resp = await fetch(`/v1/tts?text=${prompt}&voice=${voice}&lang=${lang}&pitch=${pitch}&rate=${rate}&volume=${volume}&userId=${_.userId}`).catch(e=>{
    console.error(e)
    $.loading(false)
    return
  }).catch(e=>{
    alert(e)
    $.loading(false)
    return
  })

    //const json = await resp.json()
    //console.log('result img',json.data.fileId)
    const blob = await resp.blob()

    wavesurfer.loadBlob(blob)
  
    //down = `/v1/a/audio/${json.data.fileId}`
  
    //wavesurfer.on('ready', create)

  create()
  //document.querySelector('#VOICE audio[name=output]').src = `${lb.getSlm()}/v1/tts?text=${text}!&voice=${voice}&lang=${lang}&pitch=${pitch}&rate=${rate}&volume=${volume}`

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
  $.query('textarea[name=prompt]').className = 'listen'
}

export function listening(text){
  $.query('textarea[name=prompt]').value = text
}

export function listened(){
  $.query('textarea[name=prompt]').className = ''
  if($.query('textarea[name=prompt]').value.length > 0)
    generate()
}


export function file(){
  isFile = false
  console.log('main_v')
  //document.getElementById("i_capture").style.display = 'block'
  //document.getElementById("i_camera").style.display = 'block'
  const gallary = document.getElementById('v_gallary')
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

  //$.query('fieldset[name=voice_model]').disabled = true
  //$.query('fieldset[name=voice_rate]').disabled = true
  //$.query('fieldset[name=voice_speed]').disabled = true
  
}

export function dragOverHandler(ev){
  ev.preventDefault()

 // this.style.backgroundColor = 'pupple';
}

export function process(){

  //document.querySelector('aside[name=generate]').style.visibility = 'visible'
  //document.querySelector('aside[name=generate] input').value = ''
  //document.querySelector('aside[name=generate] input').focus()
  console.log('process image')
  const files = $.event.target.files;

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

  //$.query('fieldset[name=voice_model]').disabled = true
  //$.query('fieldset[name=voice_rate]').disabled = true
  //$.query('fieldset[name=voice_speed]').disabled = true
}

export async function clear(){
  stop()  
  form = 0
  isFile = false

  $.query('fieldset[name=voice_model]').disabled = false
  $.query('fieldset[name=voice_rate]').disabled = false
  $.query('fieldset[name=voice_speed]').disabled = false

  wavesurfer.empty()
  
}

export function record(){
  
  isFile = true
  
  if (rec.isRecording()) {
    rec.stopRecording()
  } else {
    rec.startRecording() //record.startRecording({ deviceId })
  }

  $.query('fieldset[name=voice_model]').disabled = false
  $.query('fieldset[name=voice_rate]').disabled = false
  $.query('fieldset[name=voice_speed]').disabled = false

}
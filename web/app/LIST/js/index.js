
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

$.query('ul[name=texts]').addEventListener("scroll", (event) => {
  if(!t_isLoad && t_list.indexOf(t_lastId) < 0){
    if( event.target.scrollTop / event.target.scrollHeight > 0.4){
      t_isLoad = true
      loadText(t_lastId)
    }
  }
})

$.query('ul[name=images]').addEventListener("scroll", (event) => {
  if(!i_isLoad && i_list.indexOf(i_lastId) < 0){
    if( event.target.scrollTop / event.target.scrollHeight > 0.4){
      i_isLoad = true
      loadImage(i_lastId)
    }
  }  
})

$.query('ul[name=audios]').addEventListener("scroll", (event) => {
  if(!a_isLoad && a_list.indexOf(a_lastId) < 0){
    if( event.target.scrollTop / event.target.scrollHeight > 0.4){
      a_isLoad = true
      loadAudio(a_lastId)
    }
  }
})

$.query('ul[name=videos]').addEventListener("scroll", (event) => {
  if(!v_isLoad && v_list.indexOf(v_lastId) < 0){
    if( event.target.scrollTop / event.target.scrollHeight > 0.4){
      v_isLoad = true
      loadAudio(v_lastId)
    }
  }
})

export async function init(){

}

export function popup(){
  $.query('aside').className = `animate__animated animate__fadeIn`
  $.query('aside').style.visibility = 'visible'
}

export async function create(){
  $.query('ul[name=texts]').innerHTML = 'Loading...'
  $.query('ul[name=images]').innerHTML = 'Loading...'
  $.query('ul[name=audios]').innerHTML = 'Loading...'
  $.query('ul[name=videos]').innerHTML = 'Loading...'

  loadText()
  loadImage()
  loadAudio()
  loadVideo()
}

function loadText(_id){
  fetch(`/v1/t/texts?userId=${_.userId}&model=chat`).then(async resp=>{
    const items = await resp.json()
    console.log('result txt',items)
  
    if(!_id){
      $.query('ul[name=texts]').innerHTML = ''
      t_list = items
    } else 
      t_list.push(...items)
  
    t_isLoad = false
  
    for(const item of items){
      t_lastId = item._id
      const elem = document.createElement('li')
      elem.innerHTML = `
      <fieldset onclick="$(event).select('${item.fileId}','${item.prompt}')">
        <p>${$.short(item.prompt,36)} 
        <button class='delete' onclick="$(event).removeText('${item._id}')"><i class="fa-solid fa-trash"></i></button></p>
      </fieldset>
      `      
      //elem.innerHTML = `<video controlsList="nodownload" controls playsinline id='_${item.fileId}' preload='auto' class='square' src='/v1/v/media/${item.fileId}?type=mp4&length=${item.length}'></video>`

      $.query('ul[name=texts]').append(elem)
    }
  })
}

function loadImage(_id){
  fetch(`/v1/v/medias?userId=${_.userId}&type=jpg`).then(async resp=>{
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
      elem.innerHTML = `<img src='/v1/v/media/${item.fileId}' onclick='$(event).selectImage("${item.fileId}")'>
      <button class='remove' onclick="$(event).removeImage('${item._id}')"><i class="fa-solid fa-trash"></i></button>`
      $.query('ul[name=images]').append(elem)
    }
  })  
}

function loadVideo(_id){
  fetch(`/v1/v/medias?userId=${_.userId}&type=mp4`).then(async resp=>{ // &model=human #userId=${_.userId}
    const items = await resp.json()
    console.log('result vid',items)
  
    if(!_id){
      $.query('ul[name=videos]').innerHTML = ''
      v_list = items
    } else 
      v_list.push(...items)
  
    v_isLoad = false
  
    for(const item of items){
      v_lastId = item._id
      const elem = document.createElement('li') // controlsList="nodownload"
      elem.innerHTML = `<video  controls playsinline id='_${item.fileId}' preload='auto' class='square' src='/v1/v/media/${item.fileId}?type=mp4&length=${item.length}'></video>
      <button class='remove' onclick="$(event).removeVideo('${item._id}')"><i class="fa-solid fa-trash"></i></button>`

      $.query('ul[name=videos]').append(elem)

      //new Plyr(`#_${item.fileId}`);
    }
  })
}

function loadAudio(_id){
  fetch(`/v1/a/audios?userId=${_.userId}`).then(async resp=>{
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
      <fieldset>
        <p>${$.short(item.prompt)}
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

export async function removeText(fileId){
  //$.event.target.className = 'selected'
  $.event.stopPropagation()

  setTimeout(async ()=>{
    const isDelete = confirm('Do you wanna remove it?')
    //console.log($.event)
  
    if(isDelete){
      const url =  `/v1/t/delete?_id=${fileId}`
  
      const resp = await fetch(url)
      const json = await resp.json()
      console.log('result img',json.data)
      
      loadText()
    } //else 
      //$.event.target.className = ''
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
      
      loadImage()
    } //else 
     // $.event.target.className = ''
  },50)
}

export async function removeVideo(fileId){
 // $.event.target.className = 'selected'

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
      
      loadVideo()
    }// else 
     // $.event.target.className = ''
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
      
      loadAudio()
    } //else 
     // $.event.target.className = ''
  },50)
}

export async function select(id,prompt){
  //current_id = id

  //const input = $.query('textarea[name=input]')
  //const output = $.query('textarea[name=output]')

  //input.textContent = prompt
  //input.scroll({ top: input.scrollHeight, behavior: "smooth"})

  const resp = await fetch(`/v1/t/text/${id}`)
  const content = await resp.text()

  document.querySelector('#VIEW').style.display = 'block'
  
  document.querySelector('#VIEW input[name=prompt]').value = prompt
  document.querySelector('#VIEW textarea[name=content]').textContent = content.replace(/<\/br>/gi, "\n")

  //alert(await resp.text())
  //output.scroll({ top: output.scrollHeight, behavior: "smooth"})
}

export function close(){
  $.query('aside').className = `animate__animated animate__fadeOut`
  //$.query('aside').style.visibility = 'hidden'
}


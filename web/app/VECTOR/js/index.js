
let wavesurfer = 0
let down = 0 

let lastId = 0
let isLoad = false
let list = []
let projectId = 0

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
  //model=sound&
  const resp = await fetch(`/v1/r/find?userId=${_.userId}`).catch(e=>{
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
    $.query('ul[name=files]').innerHTML = ''
    list = items
  } else 
    list.push(...items)

  isLoad = false

  for(const item of items){
    lastId = item._id

    const elem = document.createElement('li')
    elem.innerHTML = `
    <fieldset id='__${item.projectId}' onclick="$(event).select('${item.projectId}')">
      <p>${item.projectId}
      <button class='remove' onclick="$(event).remove('${item._id}')"><i class="fa-solid fa-trash"></i></button>
      <p>${item.url}</p>
    </fieldset>
    `
    $.query('ul[name=files]').append(elem)

    //new Plyr(`#_${item.fileId}`)
  }

  if($.mode == 'junior'){
    $.query('div[name=option]').style.display = 'none'
    $.query('button.gen').style.height = '148px'
  }
}

export async function keypress(){
  if(event.which != 13)
    return

  $.loading(true)
  let prompt = $.query('input[name=url]').value
  const url = `/v1/r/insert?url=${prompt}&userId=${_.userId}`
  
  const resp = await fetch(url).catch(e=>{
    console.error(e)
    $.loading(false)
    return
  })

  $.loading(false)

  const json = await resp.json()
  //alert(json.data)
  projectId = json.data

  create()

  
}



export async function select(id){
  const target = document.querySelector(`#__${id}`)
  projectId = id

  $.queryAll(`fieldset.clicked`).forEach(item=>{
    item.className = ''
  })
  
  target.className = 'clicked'

}

export async function remove(fileId){
  //$.event.target.className = 'selected'

  setTimeout(async ()=>{
    const isDelete = confirm('Do you wanna remove it?')
    //console.log($.event)
  
    if(isDelete){
      const url =  `/v1/r/delete?_id=${fileId}`
  
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

  let prompt = $.query('textarea[name=pos_prompt]').value
  
  if(prompt.length < 5){
    alert('입력 프롬프트가 너무 짧습니다. 올바른 생성을 위해 보다 길게 입력해 주세요.')
    return
  } else if(prompt.length > 100){
    alert('입력 프롬프트가 너무 깁니다. 올바른 생성을 위해 보다 짧게 입력해 주세요.')
    return
  }
 
  $.loading(true)
  

  console.log('=================')
  console.log(prompt)

  //document.querySelector('#VOICE audio[name=output]').src = `${lb.getSlm()}/v1/tts?text=${text}!&voice=${voice}&lang=${lang}&pitch=${pitch}&rate=${rate}&volume=${volume}`
  let url = ''
 //if(negative)
  //  url = `/v1/a/audio?prompt=${prompt}&negative=${negative}&model=${model}&scale=${scale}&dur=${dur}&userId=${_.userId}&enhance=${enhance}&steps=${steps}`    
  //else
  url = `/v1/r/search?prompt=${prompt}&projectId=${projectId}&userId=${_.userId}`
  
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

  $.query('ul[name=docs]').innerHTML = ''

  const json = await resp.json()
  for(const item of json.data.data){
    console.log(item)
    const elem = document.createElement('li')
    elem.innerHTML = `
    <fieldset onclick="$(event).select('${item[0].projectId}')">
      <p>${item[1]}
      <p>${item[0].page_content}
    </fieldset>
    `

    //projectId = item[0].projectId
    /*
<p>${item[0].metadata.title}
      <p>${item[0].metadata.source}
      <p>${item[0].metadata.summary}
      
    */
    $.query('ul[name=docs]').append(elem)
  }


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

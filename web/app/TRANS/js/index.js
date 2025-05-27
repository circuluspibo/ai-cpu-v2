

let current_id = 0

export async function init(){
 
}

export function popup(){
  $.query('aside').className = `animate__animated animate__fadeIn`
  $.query('aside').style.visibility = 'visible'
}

export async function create(){

  $.loading(false)


  let url = `/v1/getTrans`

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

  $.query('ul[name=files]').innerHTML = ''

  for(const item of items){
    const elem = document.createElement('li')
    elem.innerHTML = `
    <fieldset ondblclick="$(event).remove('${item}')"'>
      <p onclick='$(event).select("${item}","${item}")'>${item}</p>   
    </fieldset>
    `
    $.query('ul[name=files]').append(elem)
  }
}

export async function remove(fileId){
  $.event.target.className = 'selected'

  setTimeout(async ()=>{
    const isDelete = confirm('Do you wanna remove it?')
    //console.log($.event)
  
    if(isDelete){
      const url =  `/v1/t/delete?_id=${fileId}`
  
      const resp = await fetch(url).catch(e=>{
        console.error(e)
        $.loading(false)
        return
      })
      const json = await resp.json()
      console.log('result img',json.data)
      
      create()
    } else 
      $.event.target.className = ''
  },50)
}


export function close(){
  $.query('aside').className = `animate__animated animate__fadeOut`
  //$.query('aside').style.visibility = 'hidden'
}

export async function generate(){
  $.loading(true)
  let lang = $.query('select[name=lang]').value
  let prompt =  $.query('textarea[name=input]').value + "" //code_in.toString()

  const output = $.query('textarea[name=output]')
  const td = new TextDecoder() // lang auto

  //const form = new FormData()
 // form.append('prompt',prompt)
  console.log('prompt', prompt)

  fetch(`/v2/translate?lang=${lang}`,{ //fetch(`${lb.getSlm()}/v1/txt2chat`,{ // /v1/chat
    method : "POST",
    headers : {
      "Content-Type" : 'application/json'
    }, // prompt=${query}&temp=${temp}&lang=en`
    body : JSON.stringify({prompt})

  }).then(async resp=>{
    reader = resp.body.getReader()
    const chunks = []

    let done, value, result
    while(!done) {
      ({value, done} = await reader.read())
      if(done)
        break

      const d = td.decode(value)
      chunks.push(d)
      output.textContent += d
    }
    
  }).catch(e=>{
    //document.querySelector('#MAIN [name=prompt]').readOnly = false
    console.error(e)
    return
  })

  /*
  const resp = await fetch(`/v1/translate?lang=${lang}`, {
    method: "POST",
    headers : { "Content-Type" : 'application/json' },
    body : JSON.stringify({prompt})
  })
  const result = await resp.json()
  console.log(result)     

  output.textContent = result.data
  */
  $.loading(false)
  create()
} 

export function download(){
  $.download(down,'generated.mp3')
}

export function changeLength(){
  console.log('changed')
  $.query('span[name=length]').textContent = $.query('input[name=length]').value
}

export function changeGuide(){
  console.log('changed')
  $.query('span[name=guide]').textContent = $.query('input[name=guide]').value
}


export async function select(id,prompt){
  current_id = id

  const input = $.query('textarea[name=input]')
  const output = $.query('textarea[name=output]')

  input.textContent = prompt
  input.scroll({ top: input.scrollHeight, behavior: "smooth"})

  const resp = await fetch(`/v1/t/text/${id}`)

  output.textContent = await resp.text()
  output.scroll({ top: output.scrollHeight, behavior: "smooth"})
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
  $.query('textarea[name=input]').className = 'listen'
}

export function listening(text){
  $.query('textarea[name=input]').textContent = text
}

export function listened(){
  $.query('textarea[name=input]').className = ''
  if($.query('textarea[name=input]').textContent.length > 0)
    generate()
}

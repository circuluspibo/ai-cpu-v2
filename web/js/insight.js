
function is(event){
  this.event = event
}

document.querySelector('body').addEventListener('click', evt=>{
  console.log('INSIGHT-C',evt)
  console.log(evt.target.localName, evt.target.name)
})

document.querySelector('body').addEventListener('dblclick',evt=>{
  console.log('INSIGHT-DBLC',evt)
  console.log(evt.target.localName, evt.target.name)
})

document.querySelector('body').addEventListener('select',evt=>{
  console.log('INSIGHT-SELECT',evt)
  console.log(evt.target.localName, evt.target.name)
})

document.querySelector('body').addEventListener('mouseover',evt=>{
  console.log('INSIGHT-OVER',evt)
  console.log(evt.target.localName, evt.target.name)
})

document.querySelector('body').addEventListener('mousedown',evt=>{
  console.log('INSIGHT-DOWN',evt)
  console.log(evt.target.localName, evt.target.name)
})

document.querySelector('body').addEventListener('wheel',evt=>{
  console.log('INSIGHT-WHL',evt)
  console.log(evt.target.localName, evt.target.name)
})

document.querySelector('body').addEventListener('play',evt=>{
  console.log('INSIGHT-PLAY',evt)
  console.log(evt.target.localName, evt.target.name)
})

document.querySelector('body').addEventListener('ended',evt=>{
  console.log('INSIGHT-END',evt)
  console.log(evt.target.localName, evt.target.name)
})

document.querySelector('body').addEventListener('abort',evt=>{
  console.log('INSIGHT-ABORT',evt)
  console.log(evt.target.localName, evt.target.name)
})


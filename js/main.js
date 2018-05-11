// _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _/``````````\ _ _ _ _ _ _ _ _ _ _ _ _ _ _
// . . . . . . . . . . . . . . . . . . .    about  . . . . . . . . . . . . . . .
// -------------------------------------\,,,,,,,,,,/----------------------------
const nsfwt = document.querySelector('#nsfwToggle')

if( innerHeight<767 || innerWidth<1700){
    let warning = `(This page is best viewed at ~ 1700x767px,
        your browser is currently ${innerWidth}x${innerHeight})`
    document.querySelector('#sizeWarning').textContent = warning
}

document.querySelector('#enter').addEventListener('click',()=>{
    document.querySelector('#about').style.display = 'none'
})

nsfwt.addEventListener('click',()=>{
    if(nsfwt.textContent=="toggle off"){
        nsfwt.textContent="toggle on"
        console.log(nsfwt.textContent)
        blockchain.sfwOnly = true
    } else {
        nsfwt.textContent="toggle off"
        console.log(nsfwt.textContent)
        blockchain.sfwOnly = false
    }
})

// mobile check
if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)){
    document.querySelector('#mobile').style.display = "block"
}


// _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _/``````````\ _ _ _ _ _ _ _ _ _ _ _ _ _ _
// . . . . . . . . . . . . . . . . . . .    setup  . . . . . . . . . . . . . . .
// -------------------------------------\,,,,,,,,,,/----------------------------

let blockchain, gui
const ipaddr = location.host
const socket = io.connect(`https://${ipaddr}`)
let w = innerWidth, h = innerHeight, f = 4 // frustum size

// --------------------------
// block chain animation scene
// --------------------------
const scene = new THREE.Scene()
// camera = new THREE.PerspectiveCamera( 50, w/h, 1, 10000 ) // for debug
const camera = new THREE.OrthographicCamera(
    f*(w/h)/-2, f*(w/h)/2, f/2, f/-2, 1, 2000 )
const renderer = new THREE.WebGLRenderer()
renderer.setSize( w, h )
document.body.appendChild( renderer.domElement )


// --------------------------
// animation loop
// --------------------------
function draw() {
    requestAnimationFrame( draw )
    TWEEN.update()
    renderer.render(scene, camera)
}

draw()

// _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _/``````````\ _ _ _ _ _ _ _ _ _ _ _ _ _ _
// . . . . . . . . . . . . . . . . . . .   events  . . . . . . . . . . . . . . .
// -------------------------------------\,,,,,,,,,,/----------------------------


window.addEventListener('resize',function(){
    var aspect = innerWidth / innerHeight
    camera.left   = - f * aspect / 2
    camera.right  =   f * aspect / 2
    camera.top    =   f / 2
    camera.bottom = - f / 2
    camera.updateProjectionMatrix()
    renderer.setSize( innerWidth, innerHeight )
    if( gui.$refs && gui.$refs.nfo ) gui.$refs.nfo.position()
    if( gui.$refs && gui.$refs.tx ) gui.$refs.tx.position()
    if( gui.$refs && gui.$refs.cntrl ) gui.$refs.cntrl.position()
})


// setup scene (blockchain/gui/camera) on blockchain-data
socket.on('blockchain-data', function(data) {
    blockchain = new Blockchain({
        speed: 500, // animation transition speed in ms
        height: data.height,
        messageIndexes: data.blocklist,
        sfw: true,
        scene: scene,
        ip: ipaddr
    })

    blockchain.init( scene )

    camera.position.x = camera.position.y = camera.position.z = 3
    camera.lookAt( blockchain.firstBlockXYZ() )
    camera.position.z = 4.5
    camera.position.y = 3.5

    gui = new Vue({
        el: '#gui',
        data: { blockchain, camera },
        created:function(){
            blockchain.getCurrentBlockInfo((block)=>{
                if(gui.$refs.nfo) gui.$refs.nfo.show(block)
                blockchain.getCurrentBlockMessages((messages)=>{
                    if(gui.$refs.tx) gui.$refs.tx.show(block,messages)
                })
            })
        }
    })

    blockchain.cntrlData = gui.$refs.cntrl

    draw()

    // show enter button
    document.querySelector('#loading').style.display = "none"
    document.querySelector('#enter').style.display = "block"
})

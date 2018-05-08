// _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _/``````````\ _ _ _ _ _ _ _ _ _ _ _ _ _ _
// . . . . . . . . . . . . . . . . . . .    setup  . . . . . . . . . . . . . . .
// -------------------------------------\,,,,,,,,,,/----------------------------

let blockchain, gui
const ipaddr = '192.168.1.252:8989'//'10.1.10.41:8989'////'labs.brangerbriz.com:2222'
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
        ip: ipaddr,
        getAuthHeaders: getAuthHeaders
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

    if( innerHeight<767 || innerWidth<1700){
        alert(`Note: this page is best viewed at ~ 1700x767px,
            your browser is currently ${innerWidth}x${innerHeight}`)
    }
})


// this will be fired every 10 seconds
socket.on('peer-info', function(data) {
    if(typeof gui !=="undefined" && gui.$refs.cntrl){
        let addrs = data.map(p=>p.addr)
        // gui.$refs.cntrl.peers = addrs
        gui.$refs.cntrl.updatePeers(addrs)
    }
})

// this will be received when a node receives an unconfirmed transaction
socket.on('received-tx', function(data) {
    // console.log('received-tx:', data)
    if(typeof gui !=="undefined" && gui.$refs.cntrl){
        gui.$refs.cntrl.mempool++
    }
})

// _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _/``````````\ _ _ _ _ _ _ _ _ _ _ _ _ _ _
// . . . . . . . . . . . . . . . . . . .    setup  . . . . . . . . . . . . . . .
// -------------------------------------\,,,,,,,,,,/----------------------------

let blockchain, gui
const ipaddr = '192.168.1.252:8989'//'labs.brangerbriz.com:2222'
const socket = io.connect(`https://${ipaddr}`)
const scene = new THREE.Scene()
let w = innerWidth, h = innerHeight, f = 4 // frustum size
// camera = new THREE.PerspectiveCamera( 50, w/h, 1, 10000 ) // for debug
const camera = new THREE.OrthographicCamera(
    f*(w/h)/-2, f*(w/h)/2, f/2, f/-2, 1, 2000 )

const renderer = new THREE.WebGLRenderer()
renderer.setSize( w, h )
document.body.appendChild( renderer.domElement )

function draw() {
    requestAnimationFrame( draw )
    TWEEN.update()
    renderer.render(scene, camera)
}

// _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _/``````````\ _ _ _ _ _ _ _ _ _ _ _ _ _ _
// . . . . . . . . . . . . . . . . . . .   events  . . . . . . . . . . . . . . .
// -------------------------------------\,,,,,,,,,,/----------------------------

// setup scene (blockchain/gui/camera) on blockchain-data
socket.on('blockchain-data', function(data) {
    blockchain = new Blockchain({
        speed: 500, // animation transition speed in ms
        height: data.height,
        messageIndexes: data.blocklist,
        scene: scene,
        ip: ipaddr,
        getAuthHeaders: getAuthHeaders
    })

    blockchain.init( scene )

    camera.position.x = camera.position.y = camera.position.z = 3
    camera.lookAt( blockchain.firstBlockXYZ() )
    camera.position.z = 4.5
    camera.position.y = 3.5

    function getFirstBlockInfo(){
        blockchain.getCurrentBlockInfo((block)=>{
            gui.$refs.nfo.show(block)
            blockchain.getCurrentBlockMessages((messages)=>{
                gui.$refs.tx.show(block,messages)
            })
        })
    }

    gui = new Vue({
        el: '#gui',
        data: {
            blockchain:blockchain,
            camera:camera
        },
        created:getFirstBlockInfo
    })

    draw()
})

// this will be received when a node receives a new block
socket.on('received-block', function(data) {
    // TODO somekind of visual queue/event for a new block (github issue#3)
    blockchain.height = data.height
})

// this will be fired every 10 seconds
socket.on('peer-info', function(data) {
    if(typeof gui !=="undefined"){
        let addrs = data.map(p=>p.addr)
        gui.$refs.cntrl.peers = addrs
    }
})

// for debugging
function logBlock(idx){
    if(typeof idx=="undefined")
        blockchain.getCurrentBlockInfo(d=>console.log(d))
    else fetch(
        `https://${ipaddr}/api/block?index=${idx}`,
        { headers: getAuthHeaders() })
    .then(res => res.json())
    .then(data => { console.log(data) })
    .catch(err=>{ console.error(err) })
}

function logMessages(idx){
    if(typeof idx=="undefined")
        blockchain.getCurrentBlockMessages(m=>console.log(m))
    else fetch(
        `https://${ipaddr}/api/block/messages?index=${idx}`,
        { headers: getAuthHeaders() })
    .then(res => res.json())
    .then(data => { console.log(data) })
    .catch(err=>{ console.error(err) })
}

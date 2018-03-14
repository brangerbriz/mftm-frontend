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

// setup scene (blockchain/gui/camera) on block-count
socket.on('block-count', function(count) {

    blockchain = new Blockchain({
        speed: 500, // animation transition speed in ms
        height: count,
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
        blockchain.getCurrentBlockInfo((data)=>{
            gui.$refs.nfo.show(data)
        })
    }

    gui = new Vue({
        el: '#gui',
        data: {
            blockchain:blockchain,
            camera:camera
        },
        mounted:getFirstBlockInfo
    })

    draw()
})

// this will be received when a node receives a new block
socket.on('received-block', function(data) {
    // TODO somekind of visual queue/event for a new block
    blockchain.height = data.height
})

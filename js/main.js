
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

// _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _/```````\ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
// . . . . . . . . . . . . . . . . . . .  arrows . . . . . . . . . . . . . . . .
// -------------------------------------\,,,,,,,/-------------------------------

function arrowClick(){
    console.log(this.id)
    this.style.opacity="0.5"
    if(this.id=='rightArrow') blockchain.shiftNext()
    else blockchain.shiftPrev()
    setTimeout(()=>{ this.style.opacity="1" },blockchain.speed+100)
    blockchain.getCurrentBlockInfo((data)=>{
        console.log(data)
    })
}

let rightArrow = document.querySelector('#rightArrow')
    rightArrow.addEventListener('click',arrowClick)
let leftArrow = document.querySelector('#leftArrow')
    leftArrow.addEventListener('click',arrowClick)

// _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _/``````````\ _ _ _ _ _ _ _ _ _ _ _ _ _ _
// . . . . . . . . . . . . . . . . . . . blockchain . . . . . . . . . . . . . .
// -------------------------------------\,,,,,,,,,,/----------------------------

let blockchain
// setup scene (blockchain/camera) on block-count
socket.on('block-count', function(count) {

    blockchain = new Blockchain({
        speed: 500, // animation transition speed in ms
        height: count,
        scene: scene,
        ip: ipaddr,
        getAuthHeaders: getAuthHeaders
    })

    blockchain.init( scene )

    blockchain.getCurrentBlockInfo((data)=>{
        console.log(data)
        // data.hash
        // data.height
        // data.time
        // ....coinbase......
        // data.tx[0].hash
        // data.tx[0].vin[0].coinbase
        // data.tx[0].vout[n].amount
        // ....the rest......
        // data.tx[n].hash
        // data.tx[n].vout[n].amount
    })

    camera.position.x = 3
    camera.position.y = 3
    camera.position.z = 3//8
    camera.lookAt( blockchain.firstBlockXYZ() )

    draw()
})

// this will be received when a node receives a new block
socket.on('received-block', function(data) {
    // TODO somekind of visual queue/event for a new block
    blockchain.height = data.height
})

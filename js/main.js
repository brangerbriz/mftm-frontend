// ............................................................... setup .......
// .............................................................................

let w = innerWidth, h = innerHeight
const ipaddr = '192.168.1.252:8989'
const socket = io.connect(`https://${ipaddr}`)
const scene = new THREE.Scene()
const f = 4 // frustum size
// camera = new THREE.PerspectiveCamera( 50, w/h, 1, 10000 ) // for debug
const camera = new THREE.OrthographicCamera(
    f*(w/h)/-2, f*(w/h)/2, f/2, f/-2, 1, 2000 )

const renderer = new THREE.WebGLRenderer()
renderer.setSize( w, h )
document.body.appendChild( renderer.domElement )


socket.on('block-count', function(count) {
    console.log('block-count:', count)
})

let blockchain = new Blockchain({
    max:10, // number of blocks to visually render
    ip: ipaddr,
    getAuthHeaders: getAuthHeaders
})

blockchain.init( scene )

camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
camera.lookAt( blockchain.firstBlockXYZ() )

// ............................................................. animate .......
// .............................................................................

function draw() {
    requestAnimationFrame( draw )
    TWEEN.update()
    renderer.render(scene, camera)
} draw()

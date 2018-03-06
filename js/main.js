let w = innerWidth, h = innerHeight
let scene = new THREE.Scene()
// let camera = new THREE.PerspectiveCamera( 75,w/h,0.1,1000 )
let f = 4 // frustum size
let camera = new THREE.OrthographicCamera(
    f*(w/h)/-2, f*(w/h)/2, f/2, f/-2, 1, 2000 )

let renderer = new THREE.WebGLRenderer()
renderer.setSize( w, h )
document.body.appendChild( renderer.domElement )

let blockchain = []
for (let i = 0; i < 10; i++) {
    let block = new Block()
    block.position.x = -1.5*i
    blockchain.push( block )
    scene.add( block.obj )
}

camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
camera.lookAt(blockchain[0].position)

function draw() {
    requestAnimationFrame( draw )
    // camera.lookAt(block.position)
    // block.rotation.x += 0.01
    // blockchain.forEach(b=>b.update())
    TWEEN.update()
    // let val = Math.sin(Date.now()*0.0003)
    // console.log(val)
    // blockchain[0].material.uniforms.phase.value = val
    // blockchain[0].innerCube.rotation.y -= 0.005
    // block.position.x = Math.sin(Date.now()*0.001) * 3
    renderer.render(scene, camera)
}
draw()

blockchain.forEach(b=>b.update())

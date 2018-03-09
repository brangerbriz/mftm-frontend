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

// ......................................................... init blocks .......
// .............................................................................

socket.on('block-count', function(count) {
    console.log('block-count:', count)
})

console.log( getAuthHeaders().get('Authorization') )

// fetch a block using a block height index
fetch(`https://${ipaddr}/api/block?index=100`, { headers: getAuthHeaders() })
.then(res => res.json())
.then(data => {
    console.log(`This is how you get a block from using the block index:`)
    console.log(data)
}).catch(err=>{
    console.error(err)
})

let max = 10
let blockchain = []
for (let i = 0; i < max; i++) {
    let block = new Block({id:Math.random()});
    block.position.x = -1.5*i
    if(i>0) block.position.x -= 1.5
    else block.growCube()
    block.setPhase()
    blockchain.push( block )
    scene.add( block.obj )
    // block.update()
}

camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
camera.lookAt(blockchain[0].position)

// ............................................................. animate .......
// .............................................................................
let gate = false
function next(){
    let str = ''
    blockchain.forEach(b=>{str+=`, ${b.position.x}`})
    // console.log(str)
    if( !gate ) {
        gate = true
        blockchain.forEach(b=>b.update(()=>{
            // ...update call back
            if( blockchain[0].position.x >= 9 ){ // ie. if off screen
                console.log(blockchain[blockchain.length-1].position.x)
                // remove block from front of blockchain && from scene
                let oldBlock = blockchain.shift()
                scene.remove( oldBlock.obj )
                // add block to blockchain && scene
                let newBlock = new Block({id:Math.random()});
                    newBlock.position.x = -9
                    newBlock.setPhase()
                blockchain.push( newBlock )
                scene.add( newBlock.obj )
            }
            console.log(gate)
            gate = false
            console.log(gate)
        }))
    }
}

function draw() {
    requestAnimationFrame( draw )
    TWEEN.update()
    renderer.render(scene, camera)
} draw()

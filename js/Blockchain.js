class Blockchain {
    constructor( config ){
        if( !config ) throw new Error('Blockchain expecting config object')
        if( !config.getAuthHeaders )
            throw new Error('Blockchain expecting getAuthHeaders function')

        this.getAuthHeaders = config.getAuthHeaders
        this.serverIP = config.ip || 'localhost:8989'
        this.max = config.max || 10
        this.shiftLock = false
        this.blocks = []
    }
    init( scene ){
        for (let i = 0; i < this.max; i++) {

            let block = new Block()
                block.position.x = -1.5*i

            if(i>0) block.position.x -= 1.5
            else block.growCube()

            block.setPhase()
            this.blocks.push( block )
            scene.add( block.obj )
        }
    }
    add( block ){
        if( this.blocks.length < this.max ){
            this.blocks.push( block )
        } else {
            throw new Error('blockchain maxed out')
        }
    }
    remove(id){
        this.blocks = this.blocks.filter(b=>b.id!==id)
    }
    firstBlockXYZ(){
        return this.blocks[0].position
    }
    firstBlockX(){
        return this.blocks[0].position.x
    }
    lastBlockX(){
        return this.blocks[this.blocks.length-1].position.x
    }
    getBlockInfo(index,callback){
        fetch(
            `https://${this.serverIP}/api/block?index=${index}`,
            { headers: this.getAuthHeaders() })
        .then(res => res.json())
        .then(data => { callback(data) })
        .catch(err=>{ console.error(err) })
    }
    shiftNext( scene, block ){
        if( !this.shiftLock ){
            this.shiftLock = true
            this.blocks.forEach(b=>b.update())
            setTimeout(()=>{
                // if first block is off screen
                if( this.blocks[0].position.x >= 9 ){
                    // remove block from front of blockchain && from scene
                    let oldBlock = this.blocks.shift()
                    scene.remove( oldBlock.obj )
                    // add block to blockchain && scene
                    let newBlock = new Block()
                        newBlock.position.x = -9
                        newBlock.setPhase()
                    this.blocks.push( newBlock )
                    scene.add( newBlock.obj )
                }
                this.shiftLock = false
            },this.blocks[0].speed+50)
        }
    }
}

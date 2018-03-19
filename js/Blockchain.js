class Blockchain {
    constructor( config ){
        if( !config ) throw new Error('Blockchain expecting config object')
        if( !config.getAuthHeaders )
            throw new Error('Blockchain expecting getAuthHeaders function')

        this.scene = config.scene
        this.getAuthHeaders = config.getAuthHeaders
        this.height = config.height
        this.messageIndexes = config.messageIndexes
        // messageIndexes = {all:[], sfw:[], valid:[], bookmarked:[]}
        this.speed = config.speed || 500
        this.serverIP = config.ip || 'localhost:8989'
        this.renderTotal = 9

        this.shiftLock = false
        this.blocks = []
        this.index = 0
    }

    init(){
        for (let i = 0; i < this.renderTotal; i++) {

            let block = new Block({speed:this.speed})
                block.position.x = -1.5*i

            if(i>0) block.position.x -= 1.5
            else block.growCube()

            block.setPhase()
            this.blocks.push( block )
            this.scene.add( block.obj )
        }
    }

    firstBlockXYZ(){
        return this.blocks[0].position
    }

    getCurrentBlockInfo(callback){
        fetch(
            `https://${this.serverIP}/api/block?index=${this.index}`,
            { headers: this.getAuthHeaders() })
        .then(res => res.json())
        .then(data => { callback(data) })
        .catch(err=>{ console.error(err) })
    }

    getCurrentBlockMessages(callback){
        // TODO make these variable ( github issue#2 )
        if( this.messageIndexes.all.indexOf(this.index) >=0 ){
            fetch(
                `https://${this.serverIP}/api/block/messages?index=${this.index}`,
                { headers: this.getAuthHeaders() })
                .then(res => res.json())
                .then(data => { callback(data) })
                .catch(err=>{ console.error(err) })
        } else {
            callback(null)
        }
    }

    _shift( dir, callback ){
        if( !this.shiftLock ){
            // only shift next if we're not already at the end
            // only shift back if we're not already at the beginning
            if( (dir > 0 && this.index !== this.height) ||
                (dir < 0 && this.index !== 0 ) ){
                    this.shiftLock = true
                    this.index += dir
                    this.blocks.forEach(b=>b.update(dir))
                    setTimeout( callback, this.blocks[0].speed+100 )
                }
        }
    }

    shiftNext(){
        this._shift( +1,()=>{
            // if first block is off screen
            if( this.blocks[0].position.x > 7.5
                && this.index < this.height-3 ){
                // remove block from front of blockchain && from scene
                let oldBlock = this.blocks.shift()
                this.scene.remove( oldBlock.obj )
                // add block to blockchain && scene
                let newBlock = new Block({speed:this.speed})
                    newBlock.position.x = -7.5
                    newBlock.setPhase()
                this.blocks.push( newBlock )
                this.scene.add( newBlock.obj )
            }
            this.shiftLock = false
        })
    }

    shiftPrev(){
        this._shift( -1, ()=>{
            // if last block is off screen
            if( this.blocks[this.blocks.length-1].position.x < -7.5
                && this.index > 3 ){
                // remove block from back of blockchain && from scene
                let oldBlock = this.blocks.pop()
                this.scene.remove( oldBlock.obj )
                // add block to blockchain && scene
                let newBlock = new Block({speed:this.speed})
                    newBlock.position.x = 7.5
                    newBlock.setPhase()
                this.blocks.unshift( newBlock )
                this.scene.add( newBlock.obj )
            }
            this.shiftLock = false
        })
    }


}

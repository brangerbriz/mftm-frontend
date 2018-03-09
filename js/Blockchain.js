class Blockchain {
    constructor(){
        this.max = 10
        this.blocks = []
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
}

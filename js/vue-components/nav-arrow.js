Vue.component('nav-arrow', {
    data:function(){return {
        opacity:1
    }},
    props:{
        DataType:String,
        DataBc:Object
    },
    methods:{
        css:function(){
            let props = {
                opacity:this.opacity,
                cursor:'pointer',
                position:'absolute',
                'z-index':10,
                top:'25%',
                height:'150px'
            }

            if(this.DataType=='left') props.left="50px"
            else if(this.DataType=='right') props.right="50px"

            return props
        },
        after:function(times,func){
            return function() {
                if (--times < 1) {
                    return func.apply(this, arguments)
                }
            }
        },
        shift:function(){
            let block, messages
            let blockchain = this.DataBc

            this.opacity="0.5"
            gui.$refs.nfo.hide()
            gui.$refs.tx.hide()

            const showData = this.after(3,()=>{
                this.opacity="1"
                gui.$refs.nfo.show(block)
                gui.$refs.tx.show(block,messages)
            })

            if(this.DataType=="left") blockchain.shiftPrev()
            else blockchain.shiftNext()

            blockchain.getCurrentBlockInfo((data)=>{
                block=data
                showData()
            })

            blockchain.getCurrentBlockMessages((data)=>{
                messages=data
                showData()
            })

            setTimeout(showData,blockchain.speed+100)
        }
    },
    template:`<div>

        <svg viewBox="0 0 130 350"
             xmlns="http://www.w3.org/2000/svg"
             :style="css()"
             @click="shift">

            <g v-if="DataType=='left'" stroke="#ffffff" >
                <line x1="10" y1="176" x2="125" y2="0" stroke-width="10" />
                <line x1="125" y1="350" x2="10" y2="174" stroke-width="10" />
            </g>
            <g v-else stroke="#ffffff" >
                <line x1="0" y1="0" x2="125" y2="176" stroke-width="10" />
                <line x1="125" y1="174" x2="0" y2="350" stroke-width="10" />
            </g>
        </svg>

    </div>`
})

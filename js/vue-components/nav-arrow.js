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

            let str = ``
            for(let p in props) str+=`${p}:${props[p]};`
            return str
        },
        shift:function(){
            let blockchain = this.DataBc
            this.opacity="0.5"
            if(this.DataType=="left") blockchain.shiftPrev()
            else blockchain.shiftNext()
            setTimeout(()=>{ this.opacity="1" },blockchain.speed+100)
            blockchain.getCurrentBlockInfo((data)=>{
                console.log(data)
            })
        }
    },
    template:`<div>

        <svg viewBox="0 0 130 350"
             xmlns="http://www.w3.org/2000/svg"
             :style="css()"
             @click="shift"
             version="1.1">

            <g v-if="DataType=='left'" stroke="#87BEF2" >
                <line x1="10" y1="176" x2="125" y2="0" stroke-width="10" />
                <line x1="125" y1="350" x2="10" y2="174" stroke-width="10" />
            </g>
            <g v-else stroke="#87BEF2" >
                <line x1="0" y1="0" x2="125" y2="176" stroke-width="10" />
                <line x1="125" y1="174" x2="0" y2="350" stroke-width="10" />
            </g>
        </svg>

    </div>`
})

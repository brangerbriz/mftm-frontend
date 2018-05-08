Vue.component('trans-msgs', {
    data:function(){return {
        anim:0, // animation percentage
        abbreviate:false,
        cssv:{ // some of the initial CSS values for secCSS
            pt:50, // padding top
            pb:10, // padding bottom
            h:570, // max-height
            b:4,   // border
            t:80,  // top
        },
        messages:null, /* null || Array w/Objects:
            annotation:String,
            block_timestamp:String,
            data:String,
            nsfw:Boolean,
            tags:Array,
            transaction_hash:String,
            type:String(ex: coinbase message)
        */
        block:{ // block data
            hash:'x',
            height:0,
            time:0
        },
    }},
    props:{
        DataBc:Object // blockchain
    },
    computed:{
        secCSS:function(){
            return {
                opacity:this.anim,
                position:'absolute',
                'z-index':10,
                left:"140px",
                top:`${this.cssv.t}px`,
                'max-height':`${this.cssv.h}px`,
                width:'755px',
                background:'rgba(0,0,0,0.5)',
                border:`${this.cssv.b}px solid #fff`,
                padding:`${this.cssv.pt}px 10px ${this.cssv.pb}px 10px`,
                overflow: 'scroll'
            }
        },
        headerCSS:function(){
            return {
                position:'fixed',
                background:'#000',
                width:'755px',
                margin:'-50px 0px 0px -10px',
                padding:'10px',
                'border-bottom':'2px solid #fff'
            }
        },
        messageCSS:function(){
            return {
                background: 'rgba(100,100,100,0.5)',
                color: '#5ADDFF',
                padding: '8px',
                margin: '4px 0px 2px 0px'
            }
        },
        annotationCSS:function(){
            return {
                background: 'rgba(136,0,255,1)',
                color: '#fff',
                padding: '8px',
                margin: '4px 0px 2px 0px'
            }
        }
    },
    methods:{
        shortHash(hash){
            let a = hash.split('')
            let p1 = a.slice(0,10).join('')
            let p2 = a.slice(a.length-11,a.length-1).join('')
            return `${p1}...${p2}`
        },
        hashURL:function(hash){
            return `https://blockchain.info/tx/${hash}`
        },
        formatMessage:function(m){
            let msg = m.data
            let str = JSON.stringify(msg)
            str = str.substring(1, str.length-1)
            return str
        },
        formatAnnotation:function(m){
            let a = m.annotation
            if( a.indexOf('tx:')==0){
                return null
            } else {
                return a
            }
        },
        needsPre:function(m){
            return (
                m.tags.includes('ascii-art') ||
                m.tags.includes('code') ||
                m.format
            )
        },
        passFilter:function(msg,filt){ // NOTE
            if(!filt) filt = {}
            let show = true
            // if filtering out non-valid && message isn't valid...
            if( filt.valid && !msg.valid ) show = false
            // if filtering by tags && message doesn't contain tag...
            if( filt.tags && filt.tags.length>0 ){
                let common = msg.tags.filter(t=>filt.tags.includes(t))
                if(common.length==0) show = false
            }
            // if filtering by search term && term not in message...
            if( filt.searchTerm ){
                if( msg.data.search(filt.searchTerm)<0 ) show = false
            }
            return show
        },
        position:function(){
            // update CSS to fit on screen
            if(this.$el && gui.$refs.cntrl.$el ){
                let totalHeight = this.$el.children[0].offsetHeight
                let cntrlHeight = gui.$refs.cntrl.$el.children[0].offsetHeight
                let spaceAvail = innerHeight-cntrlHeight
                if( spaceAvail <= totalHeight+this.cssv.t ){
                    if( spaceAvail <= totalHeight ){
                        let pad = this.cssv.pt+this.cssv.pb+this.cssv.b
                        let space = spaceAvail - pad
                        this.cssv.t = (space*0.10)/2
                        this.cssv.h = space*0.90
                    } else {
                        this.cssv.t = (spaceAvail-totalHeight)/2
                    }
                }
            }
        },
        show:function(block,messages,filters){
            if(block) {
                // update block data
                this.block = block
                // create message dictionary
                let d = {}
                messages.forEach((m)=>{
                    if( this.passFilter(m,filters) ){
                        if( d.hasOwnProperty(m.transaction_hash) ){
                            d[m.transaction_hash].annotation += m.annotation
                            d[m.transaction_hash].data += m.data
                            d[m.transaction_hash].tags =
                                [...d[m.transaction_hash].tags,...m.tags]
                        } else d[m.transaction_hash] = m
                        d[m.transaction_hash].hash = m.transaction_hash
                    }
                })
                this.messages = d
            }
            this.anim+=0.2
            if(this.anim<1) setTimeout(this.show,50)
            else if(this.anim>1) this.anim=1

            this.position()
        },
        hide:function(){
            this.anim-=0.5
            if(this.anim>0) setTimeout(this.hide,50)
            else if(this.anim<0) this.anim=0
        }
    },
    template:`<div>
        <section :style="secCSS">
            <div :style="headerCSS">
                messages found in block
            </div>


            <div v-for="(t,i) in messages" :key="t.hash">
                <span>
                    <b>transaction hash/id:</b>
                    <a :href="hashURL(t.hash)" target="_blank">
                        {{ shortHash(t.hash) }}
                    </a>
                    <div v-if="DataBc.sfwOnly && messages[t.hash].nsfw" :style="annotationCSS">
                        [HIDDEN: NOT SAFE FOR WORK]
                    </div>
                    <div v-else :style="messageCSS">
<pre v-if="needsPre(messages[t.hash])">
{{ messages[t.hash].data }}
</pre>
                        <span v-else>{{messages[t.hash].data}}</span>
                    </div>
                    <div v-if="messages[t.hash].annotation && formatAnnotation(messages[t.hash])" :style="annotationCSS">
                        {{formatAnnotation(messages[t.hash])}}
                    </div>
                </span>
            </div>



        </section>
    </div>`
})

Vue.component('trans-msgs', {
    data:function(){return {
        anim:0, // animation percentage
        abbreviate:false,
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
            time:0,
            tx:[{
                hash:'x',
                vin:[{coinbase:'x'}],
                vout:[{value:0}]
            }]
        },
        lazyTx:[], // lazy loaded transactions (updates on scroll)
        abbrTx:[] // abbreviated transactions (only exapnd message txs)
    }},
    props:{
        DataBc:Object // blockchain
    },
    computed:{
        secCSS:function(){
            let props = {
                opacity:this.anim,
                position:'absolute',
                'z-index':10,
                left:"140px",
                top:"80px",
                'max-height':'570px',
                width:'755px',
                background:'rgba(0,0,0,0.5)',
                border:'4px solid #fff',
                padding:'50px 10px 10px 10px',
                overflow: 'scroll'
            }
            return this.printCSS(props)
        },
        headerCSS:function(){
            let props = {
                position:'fixed',
                background:'#000',
                width:'755px',
                margin:'-50px 0px 0px -10px',
                padding:'10px',
                'border-bottom':'2px solid #fff'
            }
            return this.printCSS(props)
        },
        messageCSS:function(){
            let props = {
                background: 'rgba(100,100,100,0.5)',
                color: '#5ADDFF',
                padding: '8px',
                margin: '4px 0px 2px 0px'
            }
            return this.printCSS(props)
            // TODO don't wordwrap 'ascii art' or 'code'
        },
        abbrToggleCSS:function(){
            let props = {
                float:'right',
                background: '#ffffff',
                color:'#000000',
                padding:"0px 8px",
                cursor:'pointer',
                'user-select':'none'
            }
            return this.printCSS(props)
        }
    },
    methods:{
        shortHash(hash){
            let a = hash.split('')
            let p1 = a.slice(0,10).join('')
            let p2 = a.slice(a.length-11,a.length-1).join('')
            return `${p1}...${p2}`
        },
        shortBTC(t){
            let val = t.vout.map(o=>o.value).reduce((a,b)=>a+b)
            return Math.round(val*10000)/10000
        },
        hashURL:function(hash){
            return `https://blockchain.info/tx/${hash}`
        },
        printCSS:function(props){
            let str = ``
            for(let p in props) str+=`${p}:${props[p]};`
            return str
        },
        txLazyLoad:function(e){
            let l = this.lazyTx.length
            if(e.target.scrollTop==e.target.scrollTopMax
                && l<this.block.tx.length){
                this.lazyTx = [...this.lazyTx,...this.block.tx.slice(l,l+25)]
            }
        },
        setupAbbrTx:function(block){
            let arr = []
            if(this.messages){
                let hashIdxz = []
                for(let m in this.messages){
                    let idx = block.tx.findIndex(t=>t.hash==m)
                    arr.push( block.tx[idx] )
                }
            }
            return arr
        },
        formatMessage:function(msg){
            let str = JSON.stringify(msg)
            return str.substring(1, str.length-1)
        },
        showHideMessage:function(){
            let diff = this.block.tx.length - this.abbrTx.length
            let sMsg = `show the ${diff} hidden transaction${(diff==1)?'':'s'}`
            let hMsg = 'hide messageless transactions'
            if(this.abbreviate) return sMsg
            else return hMsg
        },
        show:function(block,messages){
            if(block) {
                // update block data && reset other details:
                // tx arrays + messages array + abbreviate bool
                this.block = block
                this.lazyTx = block.tx.slice(0,25)
                if(messages){
                    this.abbreviate = true
                    let dict = {} // create message dictionary
                    messages.forEach((m)=>{
                        if( dict.hasOwnProperty(m.transaction_hash) ){
                            dict[m.transaction_hash].annotation += m.annotation
                            dict[m.transaction_hash].data += m.data
                            dict[m.transaction_hash].tags =
                                [...dict[m.transaction_hash].tags,...m.tags]
                        } else dict[m.transaction_hash] = m
                    })
                    this.messages = dict
                } else {
                    this.abbreviate = false
                    this.messages = null
                }
                this.abbrTx = this.setupAbbrTx(block)
            }
            this.anim+=0.2
            if(this.anim<1) setTimeout(this.show,50)
            else if(this.anim>1) this.anim=1
        },
        hide:function(){
            this.anim-=0.5
            if(this.anim>0) setTimeout(this.hide,50)
            else if(this.anim<0) this.anim=0
        }
    },
    template:`<div>
        <section :style="secCSS" @scroll="txLazyLoad($event)">
            <div :style="headerCSS">
                transaction list
                <span :style="abbrToggleCSS" @click="abbreviate=!abbreviate">
                    {{ showHideMessage() }}
                </span>
            </div>

            <span v-if="abbreviate">

                <div v-for="(t,i) in abbrTx" :key="t.hash">
                    <span>
                        <b>hash/id:</b>
                        <a :href="hashURL(t.hash)" target="_blank">
                            {{ shortHash(t.hash) }}
                        </a>
                        <span v-if="i==0">(coinbase)</span>
                        <span style="float:right;"> {{ shortBTC(t) }} BTC </span>
                        <div :style="messageCSS">
                            {{ formatMessage(messages[t.hash].data) }}
                        </div>
                    </span>
                </div>

            </span>
            <span v-else>

                <div v-for="(t,i) in lazyTx" :key="t.hash">
                    <b>hash/id:</b>
                    <a :href="hashURL(t.hash)" target="_blank">
                        {{ shortHash(t.hash) }}
                    </a>
                    <span v-if="i==0">(coinbase)</span>
                    <span style="float:right;"> {{ shortBTC(t) }} BTC </span>
                    <div v-if="messages && messages.hasOwnProperty(t.hash)"
                         :style="messageCSS">
                         {{ formatMessage(messages[t.hash].data) }}
                    </div>
                </div>

            </span>

        </section>
    </div>`
})
/*
    // test 200254
    test blocks:
    '348772', '370'
    '348752', '160'
    '319798', '113'
    '329227', '113'
    '397596', '98'
    '396640', '97'
    '396738', '96'
    '320713', '89'
    '397148', '86'
    '393631', '86'
    '397147', '86'
    '348771', '84'
    '393778', '84'
    '396715', '83'
    '393650', '81'
    '395046', '79'
    '494196', '76'
    '372706', '74'
    '426732', '71'
    '397158', '70'
    '426681', '69'
    '397164', '69'
*/

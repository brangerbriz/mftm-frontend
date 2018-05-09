Vue.component('control-area', {
    data:function(){return {
        viewing:'main', // or tags
        size: {
            // padding - (btnsCSS.width + btnsCSS.right)
            w: innerWidth-(18*2)-(401+18),
            h: 161 // btnsCSS.height
        },
        ml: (this.viewing=='main') ? '0px' : -innerWidth+"px",
        tagsDisplayed:'theme', // or 'lang'
        themeTags:['☆','♡','ad','ascii-art','birthday','chat','code','conspiracy',
            'emoticon','eulogy', 'hello','holiday','insult','link','love',
            'marriage','meme','meta','poetry','politics','quote','religion',
            'satoshi','signature','test','tribute','xss'],
        langTags:['arabic', 'azerbaijani', 'bengali', 'bulgarian', 'catalan',
                  'chinese', 'corsican', 'croatian', 'czech', 'dutch',
                  'english', 'esperanto', 'estonian', 'french', 'galician',
                  'german', 'greek', 'hawaiian', 'hebrew', 'hindi', 'hungarian',
                  'icelandic', 'indonesian', 'italian', 'japanese', 'korean',
                  'kyrgyz', 'latin', 'latvian', 'lithuanian', 'malay',
                  'malayalam', 'maori', 'mongolian', 'norwegian', 'persian',
                  'polish', 'portuguese', 'punjabi', 'romanian', 'russian',
                  'serbian', 'slovak', 'spanish', 'sundanese', 'swedish',
                  'tamil', 'telugu', 'turkish', 'ukrainian', 'vietnamese',
                  'welsh'],
        tags:[], // currently selected tags
        searchValue:null,
        searchFilter:null,
        searchColor:'#fff',
        // for timeline stuff
        tl:{ bins:40, arr:[] },
        years:[2009,2010,2011,2012,2013,2014,2015,2016,2017,2018],
    }},
    props:{
        DataId:String, // page didactic text elment id
        DataBc:Object // blockchain
    },
    mounted:function(){
        this.position()
        this.createBins()
    },
    computed:{
        secCSS:function(){
            return {
                'position':'fixed',
                'z-index':10,
                'left':'0px',
                'bottom':'0px',
                'height':'196px',
                'width':'100%',
                'background':'#000',
                'border-top': '2px solid #fff',
            }
        },
        mainSecCSS:function(){
            return {
                'position':'absolute',
                'margin-left':this.ml,
                'transition':'all 1s'
            }
        },
        btnsCSS:function(){
            return {
                'position': 'absolute',
                'right': `-${innerWidth-this.size.w-18}px`,
                'top': '18px',
                'display': 'flex',
                'flex-direction': 'column',
                'height': '161px',
                'justify-content': 'space-between',
            }
        },
        bCSS:function(){
            return {
                'background': '#8800FF',
                'padding': '8px 0px',
                'width': '400px',
                'display': 'inline-block',
                'text-align': 'center',
                'user-select':'none',
                'cursor':'pointer'
            }
        },
        aboutCSS:function(){
            return {
                'background': '#000',
                'border':'1px solid #fff',
                'padding': '6px 0px',
                'width': '400px',
                'display': 'inline-block',
                'text-align': 'center',
                'user-select':'none',
                'cursor':'pointer'
            }
        },
        inputCSS:function(){
            return {
                'border': '2px solid #8800FF',
                'padding': '10px',
                'background': '#000',
                'color': this.searchColor,
                'user-select':'none'
            }
        },
        searchBtnCSS:function(){
            return {
                'background': '#8800FF',
                'border': 'none',
                'color': '#fff',
                'padding': '8px 39px',
                'font-size': '16px',
                'font-family': "'Source_Code', monospace",
                'cursor':'pointer',
                'user-select':'none'
            }
        },
        svgCSS:function(){
            return {
                'width': this.size.w+'px',
                'height': this.size.h+'px',
                'position': 'relative',
                'left': '18px',
                'top': '18px',
            }
        },
        tagSecCSS:function(){
            let ml = (this.viewing=='tags') ? '0px' : innerWidth+"px"
            return {
                'position': 'absolute',
                'top': '0px',
                'left': '0px',
                'width': '100%',
                'height': '100%',
                'background-color': '#000',
                'padding': '20px',
                'display':'flex',
                'margin-left':ml,
                'transition':'all 1s'
            }
        },
        tagsCntrlCSS:function(){
            return {
                'margin-right':'18px',
                'display': 'flex',
                'flex-direction': 'column',
                'height': '96px',
                'justify-content': 'space-between',
            }
        },
        viewbox:function(){
          return `0 0 ${this.size.w} ${this.size.h}`;
        },
        pathCSS:function(){
            return {
                'fill': '#8800FF',
                'stroke': '#8800FF',
                'strokeWidth': 4,
                'fillOpacity': 0.4,
                'strokeOpacity': 1.0
            }
        },
        filtPathCSS:function(){
            return {
                'fill': '#5ADDFF',
                'stroke': '#5ADDFF',
                'strokeWidth': 4,
                'fillOpacity': 0.4,
                'strokeOpacity': 1.0
            }
        },
        timePathCSS:function(){
            return {
                'stroke': '#fff',
                'strokeWidth': 8,
            }
        },
        timeMrkCSS:function(){
            return {
                'stroke': '#fff',
                'strokeWidth': 2,
            }
        },
        timeLineStr:function(){
            return `M0 ${this.size.h} L ${this.size.w} ${this.size.h}`
        },
        timeMrkStr:function(){
            let pos = (this.DataBc.index/this.DataBc.height)*this.size.w
            return `M${pos} 0 L ${pos} ${this.size.h}`
        },
        timeTxt:function(){
            return (this.DataBc.index/this.DataBc.height)*this.size.w + 10
        },
        pathStr:function() {
            let values = this.createBins()
            return this.pathD( values, this.lineCmd )
        },
        filtPathStr:function() {
            let values = this.createBins(true)
            return this.pathD( values, this.lineCmd )
        }
    },
    methods:{
        position:function(){
            this.ml = (this.viewing=='main') ? '0px' : -innerWidth+"px"
            this.size.w = innerWidth-(18*2)-(401+18)
        },
        tagCSS:function(tag){
            let clr = (this.tags.indexOf(tag)>=0) ?
                {b:'rgb(90, 221, 255)',c:'rgb(0, 0, 0)'} :
                {b:'rgb(50, 50, 50)',c:'rgb(255, 255, 255)'}
            return {
                'display': 'inline-block',
                'background': clr.b,
                'color': clr.c,
                'padding': '6px 16px',
                'cursor': 'pointer',
                'margin':'0px 9px 9px 0px'
            }
        },
        showDidacticInfo:function(){
            document.getElementById(this.DataId).style.display = "block"
        },
        switchTagsDisplayed:function(){
            if(this.tagsDisplayed=="theme"){
                this.tagsDisplayed = "lang"
            } else {
                this.tagsDisplayed = "theme"
            }
        },
        switchBackToMain(){
            this.viewing = 'main'
            let filter = { search:this.searchFilter, tags:this.tags }
            this.DataBc.updateFilteredIndexes(filter,()=>{
                // console.log(this.DataBc.filteredIndexes)
            })
        },
        inputSearch:function(e){
            this.searchValue = e.target.value
            this.searchColor = '#fff'
        },
        updateSearch:function(){
            this.searchFilter = (this.searchValue=="") ? null : this.searchValue
            let filter = { search:this.searchFilter, tags:this.tags }
            this.DataBc.updateFilteredIndexes(filter,()=>{
                this.searchColor = '#5ADDFF'
                // console.log(this.DataBc.filteredIndexes)
            })
        },
        selectTag:function(e){
            let tag = e.target.textContent
                tag = tag.replace(/\n/g, "")
                tag = tag.replace(/ /g, "")
                tag = (tag=='☆') ? 'bookmark' : tag
                tag = (tag=='♡') ? 'favorite' : tag
            if( e.target.style.backgroundColor == "rgb(50, 50, 50)"){
                e.target.style.backgroundColor = "rgb(90, 221, 255)"
                e.target.style.color = "rgb(0, 0, 0)"
                this.tags.push(tag)
            } else {
                e.target.style.backgroundColor = "rgb(50, 50, 50)"
                e.target.style.color = "rgb(255, 255, 255)"
                this.tags.splice(this.tags.indexOf(tag),1)
            }
        },
        tagTypeMessage:function(){
            if(this.tagsDisplayed=="theme"){
                return 'show language tags'
            } else {
                return 'show thematic tags'
            }
        },
        after:function(times,func){
            return function() {
                if (--times < 1) {
                    return func.apply(this, arguments)
                }
            }
        },
        timelineJump:function(blockSpot){
            let block, messages
            let blockchain = this.DataBc
            let filters = {
                valid:true, // b/c blockchain.validOnly is always true in web
                searchTerm:gui.$refs.cntrl.searchFilter,
                tags:gui.$refs.cntrl.tags
            }

            gui.$refs.leftArrow.opacity="0.5"
            gui.$refs.rightArrow.opacity="0.5"
            gui.$refs.nfo.hide()
            gui.$refs.tx.hide()

            const showData = this.after(4,()=>{
                gui.$refs.leftArrow.opacity="1"
                gui.$refs.rightArrow.opacity="1"
                gui.$refs.nfo.show(block)
                gui.$refs.tx.show(block,messages,filters)
            })

            blockchain.seekTo( blockSpot,(target)=>{
                new TWEEN.Tween(blockchain)
                    .to({ index:target }, 250)
                    .easing(TWEEN.Easing.Sinusoidal.Out)
                    .onComplete(()=>{

                        showData()

                        blockchain.getCurrentBlockInfo((data)=>{
                            block=data
                            showData()
                        })

                        blockchain.getCurrentBlockMessages((data)=>{
                            messages=data
                            showData()
                        })

                    })
                    .start()
            })

            setTimeout(showData,blockchain.speed+100)
        },
        clickTL:function(e){
            let blockSpot = e.layerX / this.size.w
            this.timelineJump( blockSpot )
        },
        createFilteredValues:function(){
            let a = []
            if( this.DataBc.filtering ) a = this.DataBc.filteredIndexes
            return a
        },
        tlCurIdx:function(){
            return this.tl.arr.indexOf(this.DataBc.index)+1
        },
        createBins:function(filter){
            let xCount = 0
            let yTally = 0
            let binSze = this.DataBc.height / this.tl.bins
            let values = []
            let arr = (filter) ?
                this.createFilteredValues() : this.DataBc.messageIndexes.valid

            for(let i = 0; i < this.tl.bins; i++) values.push([i,0])
            arr.forEach(v=>{
                let binIdx = this.map(v,0,this.DataBc.height,0,this.tl.bins-1)
                    binIdx = Math.round(binIdx)
                values[binIdx][1]++
            })
            this.tl.arr = arr.sort()

            // reduce to scale
            let nudge = 10
            let maxX = Math.max(...values.map(p=>p[0]))
            let maxY = Math.max(...values.map(p=>p[1]))
            values = values.map((p)=>{
                let x = this.map(p[0],0,maxX,0,this.size.w)
                let y = this.map(p[1],0,maxY,0,this.size.h-nudge)
                    y = this.size.h - y - nudge// flip && nudge up
                return [Math.round(x),Math.round(y)]
            })
            // add header/footer points to fill out shape
            values.unshift([0,this.size.h])
            values.push([this.size.w,this.size.h])
            values.push([0,this.size.h])
            return values
        },
        map:function(value, inMin, inMax, outMin, outMax) {
            return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin
        },
        // these next few functions via:
        // https://medium.com/@francoisromain/smooth-a-svg-path-with-cubic-bezier-curves-e37b49d46c74
        lineVec:function(p1,p2){
            lengthX = p2[0] - p1[0]
            lengthY = p2[1] - p1[1]
            return {
                length: Math.sqrt(Math.pow(lengthX,2)+Math.pow(lengthY,2)),
                angle: Math.atan2(lengthY,lengthX)
            }
        },
        cntrlPnt:function(cur,prev,nxt,rev){
            let p = prev || cur
            let n = nxt || cur
            let smoothing = 0.2
            let o = this.lineVec(p,n)
            let angle = o.angle + (rev ? Math.PI : 0)
            let length = o.length * smoothing
            let x = cur[0] + Math.cos(angle) * length
            let y = cur[1] + Math.sin(angle) * length
            return [x,y]
        },
        lineCmd:function(p){
            return `L ${p[0]} ${p[1]}`
        },
        pathD:function(points,command){
            let d = points.reduce((acc,pt,i,a)=>{
                return `${acc} ${command(pt,i,a)}`
            })
            return `M ${d}`
        }
    },
    template:`<div>
        <section :style="secCSS">

            <section :style="mainSecCSS">
                <div :style="btnsCSS">
                    <div>
                        <input type="text" placeholder="search term"
                               :style="inputCSS"
                               @input="inputSearch($event)">
                        <button :style="searchBtnCSS" @click="updateSearch()">
                            filter</button>
                    </div>
                    <div>
                        <span :style="bCSS" @click="viewing='tags'">
                            filtering messages by {{tags.length}}
                            tag<span v-if="tags.length!==1">s</span>
                             &gt;&gt;
                        </span>
                    </div>
                    <div @click="showDidacticInfo()">
                        <span :style="aboutCSS">about this project</span>
                    </div>
                </div>

                <svg xmlns="http://www.w3.org/2000/svg" @click="clickTL($event)"
                     :view-box="viewbox" :style="svgCSS">
                    <g>
                        <path :style="pathCSS" :d="pathStr"></path>
                        <path :style="filtPathCSS" :d="filtPathStr"></path>
                        <path :style="timeMrkCSS" :d="timeMrkStr"></path>
                        <path :style="timePathCSS" :d="timeLineStr"></path>
                    </g>
                    <text :x="timeTxt" y="10"
                        font-family="monospace" font-size="14" fill="#fff">
                        {{tlCurIdx()}}/{{tl.arr.length}}
                    </text>
                    <text v-for="(y,i) in years"
                          :x="(size.w/9.33333)*i" :y="size.h-8"
                          font-family="monospace" font-size="14" fill="#fff">
                        |{{y}}
                    </text>
                </svg>
            </section>

            <section :style="tagSecCSS">
                <div :style="tagsCntrlCSS">
                    <div :style="bCSS" @click="switchBackToMain()">
                        &lt;&lt; back to timeline </div>
                    <div :style="bCSS" @click="switchTagsDisplayed()">
                        {{ tagTypeMessage() }} </div>
                </div>
                <div>
                    <div v-if="tagsDisplayed=='theme'" >
                        <div v-for="t in themeTags" :style="tagCSS(t)"
                             :key="t" @click="selectTag($event)">
                            {{t}}
                        </div>
                    </div>
                    <div v-else="tagsDisplayed=='lang'">
                        <div v-for="l in langTags" :style="tagCSS(l)"
                             :key="l" @click="selectTag($event)">
                            {{l}}
                        </div>
                    </div>
                </div>
            </section>

        </section>
    </div>`
})

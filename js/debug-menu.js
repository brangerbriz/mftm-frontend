let showBtn = document.querySelector('#hiddenBtn')
let closeBtn = document.querySelector('#close')
let menu = document.querySelector('#hiddenMenu')
let restartBtn = document.querySelector('#restart')
let nsfwBtn = document.querySelector('#nsfwToggle')
let consoleDump = document.querySelector('#consoleDump')

showBtn.addEventListener('click',()=>{
    menu.style.display = "block"
})

closeBtn.addEventListener('click',()=>{
    menu.style.display = "none"
})

restartBtn.addEventListener('click',()=>{
    window.location.reload()
})

nsfwBtn.addEventListener('click',()=>{
    blockchain.sfwOnly = !blockchain.sfwOnly
    if(blockchain.sfwOnly) nsfwBtn.textContent = 'show nsfw'
    else nsfwBtn.textContent = 'censor nsfw'
})

window.onerror = function(msg, url, line, col, err) {
    console.log(err)
    // alert('Error message: '+msg+'\nURL: '+url+'\nLine Number: '+line);
    let path = url.split('/')
    let file = path[path.length-1]
    consoleDump.textContent += `ERR:${file}:${line}:${col}: ${msg} - ${err}\n`
    return true;
}

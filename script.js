
const lineLimit = [5,7,5]

class User {
    constructor(name, avatar) {
        this.name = name;
        this.avatar = avatar;
    }
}

let numHaikus = 0
const haikus = new Array()

class Haiku {
    constructor(text, user, picture) {
        this.text = text;
        this.user = user;
        this.replies = [];
        this.picture = picture;
        this.id = "haiku_" + (numHaikus++)
        
    }

    render(parent) {
        let node = document.getElementById(this.id)
        if (document.getElementById(this.id)){
            if (node.parentNode){
                node.parentNode.removeChild(node)
            }
        }

        let newHaiku = document.createElement('div')
        newHaiku.className = 'haiku'
        newHaiku.id = this.id

        let avatar = document.createElement('img')
        avatar.className = 'avatar'
        avatar.src = this.user.avatar

        let text = document.createElement('p')
        text.appendChild( document.createTextNode(this.text) )
        text.style.whiteSpace = "pre-line"

        newHaiku.appendChild( avatar )
        newHaiku.appendChild( text )

        if(this.picture){
            let picture = document.createElement('img')
            picture.className = 'requestimg'
            picture.src = this.picture
            newHaiku.appendChild(picture)
        }

        if (Array.isArray(this.replies)) {
            this.replies.forEach((haiku) => haiku.render(newHaiku))
        }

        if (parent.className != "haiku") {
            let button = document.createElement('button')
            button.addEventListener('click',()=> showReplyBox(newHaiku,button, this))
            button.textContent = "reply"
            button.className = "replybutton"
            newHaiku.appendChild(button)
        }
        
        

        parent.appendChild(newHaiku);
    }
}

let replybox
let replyhaiku

function showReplyBox (parent,button,haikuobj) {
    replyhaiku = haikuobj
    console.log(button, parent)

    if (replybox) {
        let oldParent = replybox.parentNode
        let newButton = document.createElement('button')
            newButton.addEventListener('click',()=> showReplyBox(oldParent,newButton))
            newButton.textContent = "reply"
            newButton.className = "replybutton"
            oldParent.appendChild(newButton)
        
    } else {
        replybox = document.createElement('div')
        replybox.className = "replybox"
    replybox.innerHTML = `
<form id="reply" onsubmit="submitHaiku(this)" action="javascript:void(0);"> </form>
<textarea form="reply" name="haiku_text" type="text" rows="3" autocomplete="off" placeholder="haiku..." wrap="off" onkeyup="updateSylCount(this)"></textarea>
<div class="sylcount">
    ooooo<br>
    ooooooo<br>
    ooooo<br>
</div>
<input form="reply" type="submit" class="submitbutton" value="not quite" disabled="true">
    `
    }

    parent.appendChild (replybox)
    
    parent.removeChild(button)
}

function countsyl (text){
    const words = text.match(/\w+(?:'\w+)*/g)
    let sum = 0
    if (words){
        words.forEach( (word) => sum +=  sylInWord(word))
    }

    return sum
}

function sylInWord (word){
    let count = pronouncing.syllableCount(pronouncing.phonesForWord(word)[0])
    if (typeof count === 'number') {
        return count;
    } else {
        console.log("PRONOUNCINGJS COUNT FAILED ON:" + word)
        count = regExSylCount(word)
        if (typeof count === 'number') {
            return count
        } else {
            console.log("REGEX COUNT FAILED ON:" + word)
            return 8
        }
    }
}

function regExSylCount(word) {
    word = word.toLowerCase();
    var t_some = 0;
    if(word.length>3)
        {
        if(word.substring(0,4)=="some")
            {
            word = word.replace("some","");
            t_some++;
            }
        }
    word = word.replace(/(?:[^laeiouy]|ed|[^laeiouy]e)$/, '');   
    word = word.replace(/^y/, '');                                 
    //return word.match(/[aeiouy]{1,2}/g).length;   
    var syl = word.match(/[aeiouy]{1,2}/g);
    //console.log(syl);
    if(syl)
    {
        //console.log(syl);
        return syl.length+t_some;
    }
}



function updateSylCount (textArea){
    

    const lines = textArea.value.split(/\r?\n/)
    const lineLen = new Array()
    let newValue = ""

    for (let i = 0; i < Math.min(3,lines.length); i++) {
        lineLen[i] = countsyl(lines[i])
        if (lineLen[i] == lineLimit[i]){newValue}
        newValue = newValue + lines[i]
        if (i < Math.min(3,lines.length) - 1) {
            newValue = newValue + "\n"
        }
    }
    // console.log(lines)
    // console.log(lineLen)
    textArea.value = newValue

    const sylCountBox = textArea.nextElementSibling
    while (sylCountBox.lastChild) {
        sylCountBox.removeChild(sylCountBox.lastChild);
    }

    // format makrs
    for (let i = 0; i < 3; i++) {
        let marks = ""
        if (lineLen[i] > 0){
            if (lineLen[i] > lineLimit[i]) {
                marks = marks + "ø".repeat(lineLimit[i]) + "x".repeat(lineLen[i] - lineLimit[i])
            } else {
                marks = marks + "ø".repeat(Math.min(lineLen[i],lineLimit[i]))
                marks = marks + "o".repeat(lineLimit[i] - lineLen[i])
            }
        } else {
            marks = marks + "o".repeat(lineLimit[i])
        }
        sylCountBox.appendChild( document.createTextNode(marks) )
        sylCountBox.appendChild(document.createElement('br'))
    }

    const submit = sylCountBox.nextElementSibling

    
    let isReady = true
    for (let i = 0; i < 3; i++) {
        if (lineLen[i] != lineLimit[i]){
            isReady = false
        }
    }

    if (isReady) {
        submit.value = "submit!" 
        submit.style['text-decoration'] = "underline"
        submit.disabled = false
        
    } else {
        submit.value = "not quite" 
        submit.style['text-decoration'] = ""
        submit.style['text-decoration-style'] = ""
        submit.disabled = false
    }
    
    return isReady

}

function submitHaiku (formNode){
    
    if (updateSylCount(formNode.elements.haiku_text)) {
        let haiku = new Haiku( formNode.elements.haiku_text.value, player)
        formNode.elements.haiku_text.value = ""
        updateSylCount(formNode.elements.haiku_text)
        if (formNode.id == "new_haiku"){
            haikus.push(haiku)
            haiku.render(haikuList)
        } else if (formNode.id == "reply"){
            replyHaikuNode = replybox.parentNode.appendChild

            console.log(replyHaikuNode)
            replyhaiku.replies.push(haiku)
            replyhaiku.render(haikuList)

        }
    
        
    }

    newRequest()
}

const requests = [
    "REQUEST: \n what is this place?",
    "REQUEST: \n what was your mother like?",
    "REQUEST: \n where do birds go in the winter?",
    "REQUEST: \n why is it worth giving back things that I'm not using anymore?",
    "REQUEST: \n what's the best way to prepare for the summer?",
    "REQUEST: \n how do you plant a garden?",
    "REQUEST: \n what's the point of <insert the first thing you see here>?",
    "REQUEST: \n why are the trees always red in the movies?",
    "REQUEST: \n who do you love most?",
    "REQUEST: \n why did you give it all up?",
    "REQUEST: \n where are we going?",
    "REQUEST: \n why did you need to talk to everyone?",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
]

const images = [
    "img/garden.png",
    "img/baby.png",
    "img/bongo.png",
    "img/call.png",
    "img/car.png",
    "img/cows.png",
    "img/decay.png",
    "img/phonebooth.png",
    "img/pool.png",
    "img/worker.png",
    "img/summer.png",
    "img/westside.png",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
]

function newRequest (){
    let i = Math.floor(Math.random() * requests.length);
    let img = document.querySelector('.requestimg')
    let req = document.querySelector('.imgtag')

    img.src = images[i]
    img.alt = images[i] + requests[i]

    req.textContent = requests[i]

    
}



const texts = [
`i’m so happy for us
lago agrio is clean
we took far too long`,

`longfin dace. spikedace.
colorado pikeminnow.
razorback sucker.`,

`wildflowers grew
along the mountain bush trails
now, buffalo grass`,

`fourteen days of sun
water spills into dry soil
death lingers; he’s gone`,


]

const replies = [
[`it takes time to heal
our wounds. we must love ourselves
take pride in being better`,],

[`beautiful shiner.
sonora sucker. gila chub
pupfish. yaqui chub.`,

`salmon salmon sal-
mon salmon salmon salmon
salmon salmon sal-`,

`please stop fishposting!
elise and i are going out.
fish better be gone! >:(`,],

[`when i see the earth
should i laugh or should i cry?
watch what the seed does.`,],

[`please, janet. it’s just
a plant. you will be alright
propagate mine, dear.`,

`george the rosemary
will be sorely missed by all
we mourn his loss, lol.`,],



]

function populate () {
    for (let i = 0; i < texts.length; i++) {
        const replyHaikus = []
        for (let rep = 0; rep < replies[i].length; rep++) {
            replyHaikus.push(new Haiku(replies[i][rep], randomUser()) )
        }

        const genHaiku = new Haiku(texts[i],randomUser())
        genHaiku.replies = replyHaikus

        haikus.push(genHaiku)
        
    }
}

const usernames = [
    "bob",
    "bradly",
    "emily",
    "janet",
    "jeff",
    "karen",
    "katerina",
    "pavel",
    "reece",
    "rosana",
    "wilford",
]

const users = []

function generateUsers(){
    for (let i = 0; i < usernames.length; i++) {
        users.push(new User(usernames[i], 'people/' + usernames[i] + '.jpg')) 
    }
}

function randomUser () {
    if (users.length <= 0) {
        generateUsers()
    }
    let i = Math.floor(Math.random() * users.length);
    return users[i]
}




//Reveren7



const player = new User("you", 'people/willow.jpg')

populate()

const haikuList = document.querySelector('.haikuList');

haikus.forEach((haiku) => haiku.render(haikuList))



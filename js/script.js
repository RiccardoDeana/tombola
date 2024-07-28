const tavola = document.querySelector('#tavola')
const calledDuration = 3.5

function loadTable(){
    if (!isStorageOk()){
        writeNotCalledInStorage()
    }
    createNumbers()
}

function createNumbers(){

    let tr = document.createElement('tr')

    for (let i = 1; i <= 90; i++) {
        if (i % 10 === 1) {
            tr = document.createElement('tr')
        }

        let numberTd = document.createElement('td')
        let numberDiv = document.createElement('div')
        let numberTxt = document.createTextNode(i)

        if (localStorage.getItem(i) === 'false') {
            numberDiv.setAttribute('class', 'number')
        }
        else{
            numberDiv.setAttribute('class', 'number called')
        }
        numberDiv.setAttribute('id', 'number-' + i)

        numberDiv.appendChild(numberTxt)
        numberTd.appendChild(numberDiv)
        tr.appendChild(numberTd)
    
        if (i % 10 === 0) {
            tavola.appendChild(tr)
        }
      }
}

function writeNotCalledInStorage(){
    console.log('Writing all numbers as non-called in local storage')
    for (let i = 1; i <= 90; i++) {
        localStorage.setItem(i, false)
    }
}

function isStorageOk(){
    for (let i = 1; i <= 90; i++) {
        if (localStorage.getItem(i) === null) {            
            console.log(i + ' is missing from local storage')
            return false
        }
    }
    console.log('Local storage is OK')
    return true
}

document.onload = loadTable()

function showBigCalled(calledNumber){
    let overlayEle = document.getElementById('overlay')
    let calledNumberElem = document.getElementById('big-called-number')
    calledNumberElem.firstChild.data = calledNumber
    overlayEle.style.display = 'block'
}

function hideBigCalled(){
    let overlayEle = document.getElementById('overlay')
    overlayEle.style.display = 'none'
}


tavola.addEventListener('click', function(e){
    console.log(e.target.innerText + ' clicked')
    if(e.target.className === "number"){
        e.target.setAttribute('class', 'number called')
        localStorage.setItem(e.target.innerText.trim(), true)
        showBigCalled(e.target.innerText)
        setTimeout(hideBigCalled, calledDuration * 1000)
        
    }
    else if(e.target.className === "number called"){
        e.target.setAttribute('class', 'number')
        localStorage.setItem(e.target.innerText.trim(), false)
    }
    
})

function resetTable(){
    console.log('Resetting table status')
    let calledNumbers = tavola.querySelectorAll('.number.called')
    for (let i = 0; i < calledNumbers.length; i++) {
        calledNumbers[i].setAttribute('class', 'number')
    }
    localStorage.clear()
    writeNotCalledInStorage()
}

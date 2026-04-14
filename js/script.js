;(function () {
    const CALLED = 'true'
    const NOT_CALLED = 'false'
    const STORAGE_KEY = 'tombola_v1'
    const CALLED_DURATION = 3.5

    const bingo = document.querySelector('#bingo')
    let overlay, bigCalledNumber

    function isStorageOk() {
        return localStorage.getItem(STORAGE_KEY) === 'initialized'
    }

    function writeNotCalledInStorage() {
        console.log('Writing all numbers as non-called in local storage')
        for (let i = 1; i <= 90; i++) {
            localStorage.setItem(i, NOT_CALLED)
        }
        localStorage.setItem(STORAGE_KEY, 'initialized')
    }

    function createNumbers() {
        let tr

        for (let i = 1; i <= 90; i++) {
            if (i % 10 === 1) {
                tr = document.createElement('tr')
            }

            const numberTd = document.createElement('td')
            const numberDiv = document.createElement('div')

            numberDiv.classList.add('number')
            if (localStorage.getItem(i) !== NOT_CALLED) {
                numberDiv.classList.add('called')
            }
            numberDiv.id = 'number-' + i
            numberDiv.textContent = i

            numberTd.appendChild(numberDiv)
            tr.appendChild(numberTd)

            if (i % 10 === 0) {
                bingo.appendChild(tr)
            }
        }
    }

    function showBigCalled(calledNumber) {
        bigCalledNumber.textContent = calledNumber
        overlay.style.display = 'block'
    }

    function hideBigCalled() {
        overlay.style.display = 'none'
    }

    function resetTable() {
        console.log('Resetting table status')
        bingo.querySelectorAll('.number.called').forEach(el => el.classList.remove('called'))
        localStorage.clear()
        writeNotCalledInStorage()
    }

    function attachEvents() {
        bingo.addEventListener('click', function (e) {
            const target = e.target
            if (!target.classList.contains('number')) return

            console.log(target.textContent + ' clicked')

            if (!target.classList.contains('called')) {
                target.classList.add('called')
                localStorage.setItem(target.textContent.trim(), CALLED)
                showBigCalled(target.textContent)
                setTimeout(hideBigCalled, CALLED_DURATION * 1000)
            } else {
                target.classList.remove('called')
                localStorage.setItem(target.textContent.trim(), NOT_CALLED)
            }
        })

        document.getElementById('btnReset').addEventListener('click', resetTable)
    }

    function loadTable() {
        overlay = document.getElementById('overlay')
        bigCalledNumber = document.getElementById('big-called-number')

        if (!isStorageOk()) {
            writeNotCalledInStorage()
        }
        createNumbers()
        attachEvents()
    }

    document.addEventListener('DOMContentLoaded', loadTable)
})()

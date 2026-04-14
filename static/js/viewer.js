;(function () {
    const CALLED_DURATION = 3.5

    const bingo = document.querySelector('#bingo')
    const overlay = document.getElementById('overlay')
    const bigCalledNumber = document.getElementById('big-called-number')
    let prevCalled = null  // null on first load so we don't show overlay for existing state

    function createNumbers() {
        let tr
        for (let i = 1; i <= 90; i++) {
            if (i % 10 === 1) tr = document.createElement('tr')
            const td = document.createElement('td')
            const div = document.createElement('div')
            div.classList.add('number')
            div.id = 'number-' + i
            div.textContent = i
            td.appendChild(div)
            tr.appendChild(td)
            if (i % 10 === 0) bingo.appendChild(tr)
        }
    }

    function applyState(calledList) {
        const calledSet = new Set(calledList)

        for (let i = 1; i <= 90; i++) {
            document.getElementById('number-' + i).classList.toggle('called', calledSet.has(i))
        }

        if (prevCalled !== null) {
            const newlyAdded = calledList.filter(n => !prevCalled.has(n))
            if (newlyAdded.length > 0) {
                showBigCalled(newlyAdded[newlyAdded.length - 1])
                setTimeout(hideBigCalled, CALLED_DURATION * 1000)
            }
        }

        prevCalled = calledSet
    }

    function showBigCalled(number) {
        bigCalledNumber.textContent = number
        overlay.style.display = 'block'
    }

    function hideBigCalled() {
        overlay.style.display = 'none'
    }

    function connectSSE() {
        const es = new EventSource('/stream')
        es.onmessage = e => applyState(JSON.parse(e.data))
        es.onerror = () => {
            es.close()
            setTimeout(connectSSE, 3000)
        }
    }

    createNumbers()
    connectSSE()
})()

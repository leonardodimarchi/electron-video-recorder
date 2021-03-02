//For video sources
const { desktopCapturer, remote, dialog } = require('electron')
const { Menu } = remote
const { writeFile } = require('fs')

//Recording
let recorder
const recordedChunks = []

//Buttons
const videoElement = document.querySelector('video')
const btnStart = document.getElementById('btnStart')
const btnStop = document.getElementById('btnStop')
const btnSelectVideo = document.getElementById('btnSelectVideo')

btnSelectVideo.onclick = getVideoSourcesThenSelectAndStream


async function getVideoSourcesThenSelectAndStream(){
    const inputSources = await desktopCapturer.getSources({
        types: ['window','screen']
    })

    const videoOptionsMenu = Menu.buildFromTemplate(
        inputSources.map(source => {
            return {
                label: source.name,
                click: () => selectSource(source)
            }
        })
    )

    videoOptionsMenu.popup()
}

async function selectSource(source){
    btnSelectVideo.innerText = source.name

    const constraints = {
        audio:false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id
            }
        }
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints)

    videoElement.srcObject = stream
    videoElement.play()

    //Setting up Media recorder
    const options = { mimeType: 'video/webm; codecs=vp9' }
    recorder = new MediaRecorder(stream, options)

    //Register Event Handlers
    recorder.ondataavailable = handleDataAvailable
    recorder.onstop = handleStop
}

function handleDataAvailable(e){
    console.log('data available')
    recordedChunks.push(e,data)
}

async function handleStop(e){
    const blob = new Blob(recordedChunks, {
        type: 'video/webm; codecs=vp9'
    })

    const buffer = Buffer.from(await blob.arrayBuffer())

    const { filePath } = await dialog.showSaveDialog({
        buttonLabel: 'Save video',
        defaultPath:`vid-${Date.now()}.webm`
    })

    console.log(filePath)

    writeFile(filePath, buffer, () => console.log('video saved successfully'))
}

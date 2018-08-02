function initSocket(gs) {

    let socket = io()
    gs.socket = socket

    socket.on("onconnect", function(data) {
        console.log("socket connected: ", data)
        gs.firstClient = data.isFirst

        if (gs.firstClient) {
            console.log("first connected player - you always will be generating levels")
        } else {
            console.log("second connected player - you always will be receiving generated levels")
        }
    })

    socket.on("disconnect", function(data) {
        console.log("disconnect")
    })

    socket.on("returnScores", function(data) {
        console.log(data)
    })

    socket.on("leaving", () => {
        console.log("Your opponent has left")
    })
}

function init() {
    
    let gs = {
        blockClick: true,
        levelCompleted:  false,
        levelStarting: false,
        showMenu: true,
        currentLevel: 0,
        firstClient: false,
        username: "anonymous",
        opponent: undefined,
        waitForResponse: false,
        stepsWaiting: 0,
        socket: null,
        score: 0,
        levelsCount: 6
    }

    initSocket(gs)
    initUI(gs)
    initThree(gs)

    document.body.appendChild(gs.renderer.domElement)

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup",   handleKeyUp)

    window.addEventListener("resize",  (e) => {

        let screenDim = getScreenDim()

        gs.camera.aspect = screenDim.x / screenDim.y
        gs.camera.updateProjectionMatrix()

        gs.renderer.setSize(screenDim.x, screenDim.y)
    }, false)

    window.addEventListener("click", (e) => {

        Input.mouse.leftClick = true

        Input.mouse.x = e.clientX
        Input.mouse.y = e.clientY

        // mouse coords in canvas clipSpace: < -1.0 ; 1.0 >
        Input.mouse.canvasX =  (e.clientX / window.innerWidth)  * 2.0 - 1.0
        Input.mouse.canvasY = -(e.clientY / window.innerHeight) * 2.0 + 1.0

    }, false)

    return gs
}

function initThree(gs) {
    
    gs.scene = new THREE.Scene()

    let screenDim = getScreenDim()

    gs.camera = new THREE.PerspectiveCamera(
        45, // fov
        screenDim.x / screenDim.y, // screen ratio
        0.1,    // min
        10000.0 // max
    )
    gs.camera.updateProjectionMatrix()

    gs.renderer = new THREE.WebGLRenderer({ antialias:true })
    gs.renderer.autoClear = false
    gs.renderer.setClearColor(0xFFF6DC)
    gs.renderer.setSize(screenDim.x, screenDim.y)

    gs.raycaster = new THREE.Raycaster()
}
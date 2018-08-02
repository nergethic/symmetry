let UIElementType = {
    Rect: 0,
    Text: 1,
    MirroredText: 2
}

let UIElementFlags = {
    Clickable: 0x00000001,
    Test:      0x00000010
}

function UIElement(name, pos, width, height, type, flags, ctxOptions) {
    this.name       = name
    this.pos        = pos
    this.width      = width
    this.height     = height
    this.type       = type
    this.flags      = flags
    this.ctxOptions = ctxOptions
    this.visible    = true

    switch (type) {
        case UIElementType.Text:
        case UIElement.MirroredText: {
            this.text = ""
        } break;
    }
}

function UIManager(ctx) {
    this.ctx = ctx
    this.elements = []
    this.elem = null

    this.remove = (elem) => {
        if (isIn(this.elements, elem).found) {
            this.elements.splice(indices, 1)
        } else {
            console.log("elem does not exist", elem)
        }
    }

    this.add = (elem) => {
        if (!isIn(this.elements, elem).found) {
            this.elements.push(elem)
        } else {
            console.log("elem was already added", elem)
        }
    }

    this.hide = (gs) => {

        gs.showMenu = false
        gs.ctx.clearRect(0, 0, 2000, 2000) // TODO
        document.getElementById("login_id").style.display = "none"

        for (let i in gs.uiManager.elements) {
            gs.uiManager.elements[i].visible = false
        }
    }

    this.getElementByName = (name) => {

        for (let i = 0; i < this.elements.length; ++i) {
            if (this.elements[i].name == name) {
                return this.elements[i]
            }
        }

        return undefined
    }

    this.clear = () => {
        this.ctx.clearRect(0, 0, 2000, 2000) // TODO: clear only canvas resoltion
    }

    this.drawSingleElement = (elem) => {

        if (!elem.visible) return;

        let options = Object.keys(elem.ctxOptions)

        for (let i = 0; i < options.length; ++i) {
            let key = options[i]
            ctx[key] = elem.ctxOptions[key]
        }

        switch (elem.type) {

            case UIElementType.Rect: {
                ctx.fillRect(elem.pos.x, elem.pos.y, elem.width, elem.height)
            } break;

            case UIElementType.Text: {
                ctx.fillText(elem.text, elem.pos.x, elem.pos.y + elem.height)
                //ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
                //ctx.fillRect(elem.pos.x, elem.pos.y, elem.width, elem.height)
            } break;

            case UIElementType.MirroredText: {
                ctx.save()
                ctx.rotate(Math.PI)  
                ctx.fillText(elem.text, elem.pos.x, elem.pos.y)
                ctx.restore()
            } break;
        }
    }

    this.draw = () => {

        for (let i = 0; i < this.elements.length; ++i) {
            this.drawSingleElement(this.elements[i])
        }
    }
}

let screenDim = getScreenDim()

let cn = {
    font: "Work Sans",
    width: screenDim.x,
    height: screenDim.y,
}

function initUI(gs) {

    let d = document.createElement('div')
    d.id = "login_id"
    document.body.appendChild(d)
    d.innerHTML = '<label for="login"> Username: </label> <input type="text" id="login" autofocus/>'

    let c = document.createElement('canvas')
    c.id = "canvas_id"
    c.width = cn.width
    c.height = cn.height 
    document.body.appendChild(c)

    let ctx = c.getContext("2d")

    gs.ctx = ctx
    gs.uiManager = new UIManager(ctx)

    let logo = new UIElement("symmetryText",
        new V2(cn.width / 2.0, cn.height - (cn.height * 0.82)),
        0.0, 0.0,
        UIElementType.Text, 0, {
        fillStyle: "white",
        textAlign: "center",
        font:      "bold 100px " + cn.font
    })
    logo.text = "Symmetry"

    let mirroredLogo = new UIElement("symmetryMirroredText",
        new V2(-(cn.width / 2.0) + 5, -(cn.height - (cn.height * 0.85)) - 65),
        0.0, 0.0,
        UIElementType.MirroredText, 0, {
        fillStyle: "rgba(255, 255, 255, 0.3)",
        textAlign: "center",
        font:      "bold italic 100px " + cn.font
    })
    mirroredLogo.text = "Symmetry"

    let background = new UIElement("bg",
        new V2((cn.width / 5.0), 0.0),
        cn.width - (2 * (cn.width / 5.0)), cn.height,
        UIElementType.Rect, 0, {
        fillStyle: "rgba(0, 0, 0, 0.3)"
    })
    
    let findOpponentButton = new UIElement("findOpponentButton",
        new V2(cn.width/2.0 - 170, cn.height - (cn.height * 0.17)),
        330.0, 36.0,
        UIElementType.Text, UIElementFlags.Clickable, {
        fillStyle: "white",
        textAlign: "left",
        font:      "bold 50px " + cn.font
    })
    findOpponentButton.text = "Find opponent"

    let scoreButton = new UIElement("scoreButton",
        new V2(cn.width/2.0 - 97.5, cn.height - (cn.height * 0.3)),
        195.0, 30.0,
        UIElementType.Text, UIElementFlags.Clickable, {
        fillStyle: "white",
        textAlign: "left",
        font:      "600 40px " + cn.font
    })
    scoreButton.text = "Highscores"
    
    gs.uiManager.add(background)
    gs.uiManager.add(mirroredLogo)
    gs.uiManager.add(logo)
    gs.uiManager.add(findOpponentButton)
    gs.uiManager.add(scoreButton)
}

function showError(gs) {
    
    let errorMessage = new UIElement("errorMessage",
        new V2(cn.width/2.0 - 175.0, cn.height - (cn.height * 0.52)),
        350.0, 14.0,
        UIElementType.Text, 0, {
        fillStyle: "#ef5151",
        textAlign: "left",
        font:      "600 16px " + cn.font
    })
    errorMessage.text = "Please only use letters, numbers and underscore"

    gs.uiManager.add(errorMessage)
}

function showLoading(gs) {
    let waitingText = new UIElement("waitingText",
        new V2(cn.width/2.0 - 120.0, cn.height - (cn.height * 0.20)),
        240.0, 30.0,
        UIElementType.Text, 0, {
        fillStyle: "white",
        textAlign: "left",
        font:      "600 72px " + cn.font
    })
    waitingText.text = "waiting"

    gs.uiManager.add(waitingText)
}

function drawSession(gs) {

    let background = new UIElement("bg",
        new V2(cn.width / 1.5, 0.0),
        cn.width / 2.0, cn.height - (cn.height * 0.85),
        UIElementType.Rect, 0, {
        fillStyle: "rgba(0, 0, 0, 0.3)"
    })

    let opponent = new UIElement("playingAgainst",
        new V2((cn.width / 1.5) + 24.0, cn.height - (cn.height * 0.95)),
        295.0, 30.0,
        UIElementType.Text, 0, {
        fillStyle: "white",
        textAlign: "left",
        font:      "bold 24px " + cn.font
    })
    opponent.text = "Your opponent: " + gs.opponent

    gs.uiManager.add(background)
    gs.uiManager.add(opponent)
    
}
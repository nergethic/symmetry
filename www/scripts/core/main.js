let EntityType = {
    Tile: 0,
    UIElement: 1
}

let BoardType = {
    Player: 0,
    Middle: 1,
    Opponent: 2
}

let CameraPositions = {
    game: {
        pos:  new V3(170.0, 600.0, 400.0),
        lookPoint: new V3(170.0, -100.0, 80.0),
    },

    top: {
        pos: new V3(170.0, 700.0, 80.0),
        lookPoint: new V3(170.0, -100.0, 80.0)
    }
}

let charArray = ["A","Ą","B","C","Ć","D","E","Ę","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","Ś","T","U","V","W","X","Y","Z","Ż","Ź","1","2","3","4","5","6","7","8","9","_"," "]
let allow = true

let currentCameraPosition = CameraPositions.top
currentCameraPosition.pos = currentCameraPosition.pos.clone()
currentCameraPosition.lookPoint = currentCameraPosition.lookPoint.clone()

function startGame(gs) {

    // TODO(Artur):
    //let startScreen = new StartScreen()
    //document.body.appendChild(startScreen.getScreen())

    let boards = new Array(3)

    boards[BoardType.Player]   = new Board(BoardType.Player,   Config.boardWidth, Config.boardHeight, new V3(0.0, Config.tileZ/2.0, 180.0),  1.8)
    boards[BoardType.Middle]   = new Board(BoardType.Middle,   Config.boardWidth, Config.boardHeight, new V3(0.0, Config.tileZ/2.0, 0.0),    1.8)
    boards[BoardType.Opponent] = new Board(BoardType.Opponent, Config.boardWidth, Config.boardHeight, new V3(0.0, Config.tileZ/2.0, -180.0), 1.8)

    let middleBoard = boards[BoardType.Middle]

    forEach(boards, (board) => {
        gs.scene.add(board.tileContainer)
    })

    gs.socket.on("ready", function(data) {
        let me, them

        if (data.players.indexOf(gs.username) == 0) {
            me = 0 , them = 1
        } else {
            me = 1 , them = 0
        }

        gs.opponent = data.players[them]

        gs.uiManager.hide(gs)
        gs.uiManager.getElementByName("waitingText").pos.y = cn.height - (cn.height * 0.50)
        
        drawSession(gs)

        if (gs.firstClient) {
            startNewLevel(gs.currentLevel)
        }
    })

    gs.socket.on("clickTile", function(data) {

        // reverse y
        let y = boards[BoardType.Opponent].height - data.y - 1

        let tile = boards[BoardType.Opponent].tiles[y][data.x]
        tile.active = !tile.active
        tile.switching = true
    })

    function endLevel(win) {

        if (win) {
            gs.score++
            gs.socket.emit("win", {})
            console.log("you won level")
        } else {
            console.log("opponent won level")
        }

        gs.currentLevel++
        gs.blockClick = true

        if (gs.currentLevel <= gs.levelsCount) {
            gs.levelEnding = true

            if (gs.firstClient) {
                setTimeout(() => {
                    startNewLevel(gs.currentLevel)
                }, 2100.0)
            }
        } else {
            if (win) {
                alert("you won the game!")
            } else {
                alert("you lost the game!")
            }
        }
    }

    gs.socket.on("win", function(data) {
        endLevel(false)
    })

    gs.socket.on("sendNewLevelArray", function(data) {
        console.log("got new level")
        startNewLevel(gs.currentLevel)
        middleBoard.setLevel(data.levelData, true)
        gs.socket.emit("levelLoaded")
        gs.waitForResponse = true
    })

    gs.socket.on("levelLoaded", function () {
        console.log("second player loaded level msg")

        // timeout for testing connection problems - longer response time
        //setTimeout(() => {
            let waitingText = gs.uiManager.getElementByName("waitingText")
            waitingText.visible = false
            gs.uiManager.clear()

            gs.waitForResponse = false
            gs.stepsWaiting    = 0
            gs.levelStarting   = true
        //}, 3000.0)
    })

    function startNewLevel(n) {

        let newLevelTileData  = null
        let newLevelTileCount = null

        if (n == 0) {
            newLevelTileCount = 5
        } else {
            newLevelTileCount = 10
        }

        if (gs.firstClient) {
            console.log("generating level")
            newLevelTileData = middleBoard.generateNewLevel(newLevelTileCount)
            middleBoard.setLevel(newLevelTileData, false)
            gs.waitForResponse = true
            console.log("sending level to the second player")
            gs.socket.emit("sendNewLevelArray", {levelData: newLevelTileData})
        }

        middleBoard.tileContainer.position.set(0.0, 0.0, 0.0)
        middleBoard.tileContainer.rotation.set(0.0, 0.0, 0.0)
        middleBoard.tileContainer.scale.set(1.0, 1.0, 1.0)

        switch (n) {

            case 2: {
                middleBoard.initLevelAction = (t) => {
                    middleBoard.tileContainer.position.x = Config.tileWidth * t
                }

                middleBoard.endLevelAction = (t) => {
                    middleBoard.tileContainer.position.x = Config.tileWidth - Config.tileWidth*t
                }
            } break;

            case 3: {
                middleBoard.initLevelAction = (t) => {
                    let val = 1.0 - 0.3*t
                    middleBoard.tileContainer.scale.set(val, val, val)
                    middleBoard.tileContainer.position.x = lerp(0.0, (Config.tileWidth*Config.boardWidth/2.0) - (0.7*Config.tileWidth*Config.boardWidth/2.0) + (0.7*middleBoard.spacing*((Config.boardWidth-1)/2.0)), t)
                    middleBoard.tileContainer.position.z = lerp(0.0, Config.tileWidth*Config.boardHeight/2.0 - (0.7*Config.tileWidth*Config.boardHeight/2.0), t)
                }

                middleBoard.endLevelAction = (t) => {
                    let val = 0.7 + 0.3*t
                    middleBoard.tileContainer.scale.set(val, val, val)
                    middleBoard.tileContainer.position.x = lerp((Config.tileWidth*Config.boardWidth/2.0) - (0.7*Config.tileWidth*Config.boardWidth/2.0) + (0.7*middleBoard.spacing*((Config.boardWidth-1)/2.0)), 0.0, t)
                    middleBoard.tileContainer.position.z = lerp(Config.tileWidth*Config.boardHeight/2.0 - (0.7*Config.tileWidth*Config.boardHeight/2.0), 0.0, t)
                }
            } break;

            case 4: {
                middleBoard.initLevelAction = (t) => {
                    middleBoard.tileContainer.rotation.x = Math.PI/4.0*t
                    middleBoard.tileContainer.position.x = Config.tileWidth*t
                }

                middleBoard.endLevelAction = (t) => {
                    middleBoard.tileContainer.rotation.x = Math.PI/4.0 - Math.PI/4.0*t
                    middleBoard.tileContainer.position.x = Config.tileWidth - Config.tileWidth*t
                }
            } break;

            case 5: {
                middleBoard.initLevelAction = (t) => {
                    middleBoard.tileContainer.position.x = -2.0*Config.tileWidth*t
                }

                middleBoard.endLevelAction = (t) => {
                    middleBoard.tileContainer.position.x = -2.0*Config.tileWidth + 2.0*Config.tileWidth*t
                }
            } break;

            case 6: {
                gs.clock.elapsedTime = 0.0 // TODO super dirty - it's working because nobody is using it elsewhere
                middleBoard.updateAction = (dt) => {
                    middleBoard.tileContainer.position.x = Config.tileWidth*Config.boardWidth/2.0*Math.sin(1.3*gs.clock.elapsedTime)

                    for (let y = 0; y < middleBoard.height; ++y) {
                        for (let x = 0; x < middleBoard.width; ++x) {
                            middleBoard.tiles[y][x].material.uniforms.depth.value = 3.5
                            middleBoard.tiles[y][x].material.uniforms.time.value += 2.0*dt
                        }
                    }
                }
            } break;

            /*
            case 0: {
                middleBoard.initLevelAction = (t) => {
                    middleBoard.tileContainer.rotation.x = -Math.PI/2.5*t
                    middleBoard.tileContainer.rotation.y = Math.PI/2.0*t
                    middleBoard.tileContainer.rotation.z = Math.PI/2.0*t

                    middleBoard.tileContainer.position.x = lerp(0.0, (Config.tileWidth*Config.boardWidth/2.0) - (Config.tileWidth*Config.boardHeight/2.0), t)
                    middleBoard.tileContainer.position.y = lerp(0.0, (-Config.tileWidth*Config.boardWidth/2.0) + 150, t)
                    middleBoard.tileContainer.position.z = 170.0 * t
                }

                middleBoard.endLevelAction = (t) => {
                    middleBoard.tileContainer.position.x = Config.tileWidth - Config.tileWidth*t
                }
            } break;
            */
        }
    }

    function leftClickAction(mouseCoords) {

        if (gs.showMenu) {
            // body onclick:
            for (let i = 0; i < gs.uiManager.elements.length; ++i) {
            
                let elem = gs.uiManager.elements[i]
            
                if (elem.flags & UIElementFlags.Clickable) {

                    if (isInside(mouseCoords, elem)) {

                        switch (elem.name) {

                            case "findOpponentButton": {
                                
                                let name = document.getElementById("login").value

                                for(let i = 0; i < name.length; ++i) {

                                    let l = name.charAt(i).toUpperCase()
                                    if(!isIn(charArray, l).found) {
                                        allow = false
                                        break;
                                    }
                                }

                                if (allow) {
                                    if (name != "") {
                                        gs.username = name
                                    }

                                    gs.socket.emit("search", {
                                        username: gs.username,
                                    })

                                    gs.uiManager.elements[3].visible = false
                                    gs.uiManager.elements[4].visible = false

                                    showLoading(gs)

                                } else {
                                    showError(gs)
                                }

                                allow = true
         
                            } break;

                            case "scoreButton": {
                                gs.socket.emit("getScores")
                            } break;

                            default: {
                                console.log("Unknown button name!")
                            } break;
                        }
                    }
                }
            }
        } else if (!gs.blockClick) {
            
            let fromVec = new THREE.Vector2(mouseCoords.canvasX, mouseCoords.canvasY)
            gs.raycaster.setFromCamera(fromVec, gs.camera)

            let intersects = gs.raycaster.intersectObjects(gs.scene.children, true)

            if (intersects.length > 0) {

                let obj = intersects[0].object

                if (obj.boardType == BoardType.Player) {

                    if (!(obj.setting && obj.unsetting)) {

                        obj.active = !obj.active
                        obj.switching = true

                        gs.socket.emit("clickTile", {
                            x: obj.x,
                            y: obj.y
                        })

                        if (middleBoard.checkIfWin(boards[BoardType.Player], true)) {
                            endLevel(true)
                        }
                    }
                }
            }
        }
    }

    function lerpV3(modify, src, dst, t) {
        modify.x = lerp(src.x, dst.x, t)
        modify.y = lerp(src.y, dst.y, t)
        modify.z = lerp(src.z, dst.z, t)
    }

    function switchCamera(posFrom, posTo, lookFrom, lookTo, t) {
        lerpV3(gs.camera.position, posFrom, posTo, t)
        lerpV3(currentCameraPosition.lookPoint, lookFrom, lookTo, t)

        gs.camera.lookAt(currentCameraPosition.lookPoint)
    }

    gs.camera.position.set(currentCameraPosition.pos.x, currentCameraPosition.pos.y, currentCameraPosition.pos.z)
    gs.camera.lookAt(currentCameraPosition.lookPoint)

    let clock = new Clock()
    gs.clock = clock
    clock.start()

    let cameraAngle = Math.PI / 2.0
    let cameraRadiusFromLookPoint = 400.0

    let secondTimer              = new Timer(1.0, 1.0)
    let levelEndingActionTimer   = new Timer(0.6, 1.0)
    let levelStartingActionTimer = new Timer(0.6, 1.0)

    let dt = 0.0

    function step() {
        requestAnimationFrame(step)

        dt = clock.getDt()

        // secondTimer.advance(dt)

        if (gs.waitForResponse) {
            console.log("waiting")
            gs.stepsWaiting++

            if (gs.stepsWaiting > 30) {

                let waitingText = gs.uiManager.getElementByName("waitingText")
                waitingText.visible = true

                gs.uiManager.clear()
                gs.uiManager.drawSingleElement(waitingText)
            }

            return;
        }

        levelEndingActionTimer.advanceIf(gs.levelEnding, dt)
        levelStartingActionTimer.advanceIf(gs.levelStarting, dt)

        ifLeftClick(leftClickAction)

        if (Input.keyLeft.pressed) {
            cameraAngle -= dt
            gs.camera.position.x = cameraRadiusFromLookPoint * Math.cos(cameraAngle)
            gs.camera.position.z = cameraRadiusFromLookPoint * Math.sin(cameraAngle)
            gs.camera.lookAt(currentCameraPosition.lookPoint)
        } else if (Input.keyRight.pressed) {
            cameraAngle += dt
            gs.camera.position.x = cameraRadiusFromLookPoint * Math.cos(cameraAngle)
            gs.camera.position.z = cameraRadiusFromLookPoint * Math.sin(cameraAngle)
            gs.camera.lookAt(currentCameraPosition.lookPoint)
        }

        if (levelEndingActionTimer.checkTick()) { // camera reached top position
            forEach(boards, (board) => {
                board.clear()
            })
            gs.levelEnding = false
        }

        if (levelStartingActionTimer.checkTick()) { // camera reached default game position
           gs.levelStarting = false
           gs.blockClick    = false
        }

        if (gs.levelEnding) {
            middleBoard.endLevelAction(easeOutQuad(levelEndingActionTimer.time))
            switchCamera(CameraPositions.game.pos, CameraPositions.top.pos, CameraPositions.game.lookPoint, CameraPositions.top.lookPoint, easeOutQuad(levelEndingActionTimer.time))
        }

        if (gs.levelStarting) {
            middleBoard.initLevelAction(easeOutQuad(levelStartingActionTimer.time))
            switchCamera(CameraPositions.top.pos, CameraPositions.game.pos, CameraPositions.top.lookPoint, CameraPositions.game.lookPoint, easeInOutCubic(levelStartingActionTimer.time))
        }

        forEach(boards, (board) => {
            board.update(dt)
        })

        // render
        if (gs.showMenu) {
            
            gs.uiManager.clear()
            gs.uiManager.draw()
        }
        
        gs.renderer.clear()
        gs.renderer.render(gs.scene, gs.camera)
    }
    step()
}
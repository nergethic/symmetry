function Board(boardType, width, height, pos, spacing) {

    this.type = boardType
    this.width  = width
    this.height = height
    this.tileZ  = Config.tileZ
    this.spacing = spacing

    this.tiles = new Array(height)

    let tile        = null
    let halfTileDim = Config.tileWidth / 2.0
    let tileZ       = Config.tileZ
    let activeTileZ = Config.activeTileZ

    this.tileGeo = new THREE.BoxGeometry(Config.tileWidth, Config.tileWidth, 1.0)

    this.groundTileBlueprint = new THREE.Mesh(this.tileGeo, Materials.tile)
    this.groundTileBlueprint.rotation.x = -Math.PI / 2.0

    this.tileContainer = new THREE.Object3D()

    this.material = Materials.createShadeMaterial(Shaders.outline)

    this.tileColor = null
    this.activeTileColor = null

    switch (this.type) {
        case BoardType.Player: {
            this.tileColor = Colors.green
            this.activeTileColor = Colors.violet
        } break;

        case BoardType.Middle: {
            this.tileColor = Colors.black
            this.activeTileColor = Colors.yellow
        } break;

        case BoardType.Opponent: {
            this.tileColor = Colors.red
            this.activeTileColor = Colors.blue
        } break;
    }

    this.material.uniforms.color.value = this.tileColor

    for (let y = 0; y < this.height; ++y) {

        this.tiles[y] = new Array(this.width)

        for (let x = 0; x < this.width; ++x) {

            this.tiles[y][x] = this.groundTileBlueprint.clone()
            let tile = this.tiles[y][x]

            tile.scale.z = this.tileZ
            tile.material = this.material.clone()
            tile.material.uniforms.coords.value = [x, y]

            //tiles[y][x].material.map = mat.map.clone()
            tile.position.set(pos.x + (x * (Config.tileWidth + this.spacing)) + halfTileDim, pos.y, pos.z + (y * (Config.tileWidth + this.spacing)) + halfTileDim)
            tile.type = EntityType.Tile
            tile.boardType = this.type
            tile.active = false
            tile.switching = false
            tile.x = x
            tile.y = y

            this.tileContainer.add(tile)
        }
    }

    this.clear = () => {
        for (let y = 0; y < Config.boardHeight; ++y) {
            for (let x = 0; x < Config.boardWidth; ++x) {

                this.tiles[y][x].active    = false
                this.tiles[y][x].switching = true
            }
        }
    }

    this.setLevel = (tileData, reverseY) => {

        let x, y

        for (let i = 0; i < tileData.length; ++i) {
            x = tileData[i] % this.width

            if (reverseY) {
                y = this.height - (Math.floor(tileData[i] / this.width)) - 1
            } else {
                y = Math.floor(tileData[i] / this.width)
            }
            

            tile = this.tiles[y][x]
            tile.active = true
            tile.switching = true
        }
    }

    this.generateNewLevel = (activeBlocksCount) => {

        let currentCount = 0
        let tileDataToSend = []
        
        while (currentCount != activeBlocksCount) {
            for (let y = 0; y < this.height    && currentCount != activeBlocksCount; ++y) {
                for (let x = 0; x < this.width && currentCount != activeBlocksCount; ++x) {

                    tile = this.tiles[y][x]
                    if (tile.active) continue;

                    if (Math.random() < 0.2) {

                        tileDataToSend.push(y*this.width + x)
                        currentCount++
                    }
                }
            }
        }

        return tileDataToSend
    }

    this.updateSettingTile = (tile, dt) => {

        if (tile.scale.z < activeTileZ) {

            tile.scale.z += activeTileZ * dt*4.0
            let t = (tile.scale.z-tileZ)/(activeTileZ-tileZ)

            tile.position.y = tileZ/2.0 + activeTileZ/2.0 * t
            tile.material.uniforms.color.value = lerpRGBA(this.tileColor, this.activeTileColor, t)
            tile.material.uniforms.lineWidth.value = 0.8 - 0.4*t

        } else {

            tile.scale.z = activeTileZ
            tile.position.y = tileZ/2.0 + activeTileZ/2.0
            tile.material.uniforms.color.value = this.activeTileColor
            tile.material.uniforms.lineWidth.value = 0.4

            return true
        }

        return false
    }

    this.updateUnsettingTile = (tile, dt) => {
        
        if (tile.scale.z > tileZ) {

            tile.scale.z -= tileZ * dt*5.0
            let t = ((activeTileZ-tileZ) - (tile.scale.z-tileZ)) / (activeTileZ-tileZ)
            
            tile.position.y = tileZ/2.0 + activeTileZ/2.0 - activeTileZ/2.0*t
            tile.material.uniforms.color.value = lerpRGBA(this.activeTileColor, this.tileColor, t) // todo dark green
            tile.material.uniforms.lineWidth.value = 0.4 + 0.4*t

        } else {

            tile.scale.z = tileZ
            tile.position.y = tileZ/2.0
            tile.material.uniforms.color.value = this.tileColor
            tile.material.uniforms.lineWidth.value = 0.8
            
            return true
        }

        return false
    }

    this.checkIfWin = (board, mirror) => {

        let result = true
        let checkTiles = board.tiles

        for (let y = 0; y < this.height; ++y) {
            for (let x = 0; x < this.width; ++x) {

                if (mirror) {

                    if (this.tiles[y][x].active !== checkTiles[this.height-y-1][x].active)
                        result = false

                } else {

                    if (this.tiles[y][x].active !== checkTiles[y][x].active)
                        result = false

                }
            }
        }

        return result
    }

    // this is to be overriten
    this.initLevelAction = (t) => {}
    this.endLevelAction  = (t) => {}
    this.updateAction    = (dt) => {}

    this.update = (dt) => {

        this.updateAction(dt)

        for (let y = 0; y < this.height; ++y) {

            for (let x = 0; x < this.width; ++x) {

                tile = this.tiles[y][x]

                tile.material.uniforms.time.value += dt

                if (tile.switching) {

                    if (tile.active) {
                        if (this.updateSettingTile(tile, dt)) {
                            tile.switching = false
                        }
                    } else {
                        if (this.updateUnsettingTile(tile, dt)) {
                            tile.switching = false
                        }
                    }
                }
            }
        }
    }
}
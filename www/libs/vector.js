// NO DEPENDENCIES

function V2(x, y) {
    this.x = x
    this.y = y

    this.set = (x, y) => {
        this.x = x
        this.y = y
    }

    this.add = (v) => {
        return new V2(this.x + v.x, this.y + v.y)
    }

    this.addVal = (val) => {
        return new V2(this.x + val, this.y + val)
    }

    this.sub = (v) => {
        return new V2(this.x - v.x, this.y - v.y)
    }

    this.subVal = (val) => {
        return new V2(this.x - val, this.y - val)
    }

    this.mul = (v) => {
        return new V2(this.x * v.x, this.y * v.y)
    }

    this.mulVal = (val) => {
        return new V2(this.x * val, this.y * val)
    }

    this.div = (v) => {
        if (v.x != 0 && v.y != 0)
            return new V2(this.x / v.x, this.y / v.y)
        else {
            return ReturnCode.Error
        }
    }

    this.divVal = (val) => {
        if (val == 0) return ReturnCode.Error
        return new V2(this.x / val, this.y / val)
    }

    this.dot = (v) => {
        return this.x*v.x + this.y*v.y
    }

    this.length = () => {
        return Math.sqrt(this.dot(this))
    }

    this.normalize = () => {
        return this.divVal(this.length())
    }

    this.toArray = () => {
        return [this.x, this.y]
    }

    this.clone = () => {
        return new V2(this.x, this.y)
    }

    this.isEqual = (v) => {
        if (this.x == v.x && this.y == v.y)
            return true
        else
            return false
    }
}

function V3(x, y, z) {
    this.x = x
    this.y = y
    this.z = z

    this.set = (x, y, z) => {
        this.x = x
        this.y = y
        this.z = z
    }

    this.add = (v) => {
        if (typeof(v) == "object")
            return new V3(this.x + v.x, this.y + v.y, this.z + v.z)
        else
            return new V3(this.x + v, this.y + v, this.z + v)
    }

    this.sub = (v) => {
        if (typeof(v) == "object")
            return new V3(this.x - v.x, this.y - v.y, this.z - v.z)
        else
            return new V3(this.x - v, this.y - v, this.z - v)
    }

    this.mul = (v) => {
        if (typeof(v) == "object")
            return new V3(this.x * v.x, this.y * v.y, this.z * v.z)
        else
            return new V3(this.x * v, this.y * v, this.z * v)
    }

    this.div = (v) => {
        if (typeof(v) == "object") {
            if (v.x != 0 && v.y != 0 && v.z != 0) {
                return new V3(this.x / v.x, this.y / v.y, this.z / v.z)
            } else {
                Logger.logError(gs, "division by zero")
                return ReturnCode.Error
            }
        } else if (v == 0) {
            Logger.logError(gs, "division by zero")
            return ReturnCode.Error
        }
        
    }

    this.divVal = (val) => {
        if (val == 0) return ReturnCode.Error
        return new V3(this.x / val, this.y / val, this.z / val)
    }

    this.dot = (v) => {
        return this.x*v.x + this.y*v.y + this.z*v.z
    }

    this.length = () => {
        return Math.sqrt(this.dot(this))
    }

    this.normalize = () => {
        return this.divVal(this.length())
    }

    this.toArray = () => {
        return [this.x, this.y, this.z]
    }

    this.clone = () => {
        return new V3(this.x, this.y, this.z)
    }

    this.isEqual = (v) => {
        if (this.x == v.x && this.y == v.y && this.z == v.z)
            return true
        else
            return false
    }
}
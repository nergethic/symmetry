// NO DEPENDENCIES

let Time = {
	Second: 1.0,
	Milisecond: 0.001
}

function getTimeInSeconds() {
    return Date.now() * 0.001
}

function Clock() {
	this.running     = false
	this.startTime   = 0.0
	this.oldTime     = 0.0
	this.elapsedTime = 0.0

    this.start = () => {
		this.startTime   = (performance || Date).now()

		this.oldTime     = this.startTime
		this.elapsedTime = 0.0
		this.running     = true
	}

	this.stop = () => {
		this.getElapsedTime()
		this.running = false

	}

	this.getElapsedTime = () => {
		this.getDt()
		return this.elapsedTime
	}

	this.getDt = () => {
		let diff = 0.0

		if (!this.running) {
			this.start()
		}

        let now = (performance || Date).now()

        let dt = (now - this.oldTime) / 1000.0
        this.oldTime = now

        this.elapsedTime += dt

		return dt
	}
}

function Timer(frequency, timeToTick) {

	this.timeToTick = timeToTick
	this.time = 0.0
	this.totalTime = 0.0
	this.pause = false
	this.frequency = frequency
	this.tick = false
	this.doneProcessing = true
	this.advanceCondition = true

	this.reset = () => {
		
		if (this.tick) {
			this.time -= this.timeToTick
			this.doneProcessing = false
		} else {
			this.time = 0.0
		}
	}

	this.advanceIf = (condition, dt) => {
		this.advanceCondition = condition
		this.advance(dt)
	}

	this.checkTick = () => {

		if (this.tick) {
			this.tick = false
			return true
		}

		return false
	}

	this.advance = (dt) => {

		if (this.advanceCondition && !this.pause) {
			this.time      += dt * this.frequency
			this.totalTime += dt * this.frequency

			if (this.time >= this.timeToTick) {
				this.tick = true
				this.reset()
				return true
			}
		}

		return false
	}
}
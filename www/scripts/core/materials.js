let Colors = {
    black:  [0.109, 0.113, 0.113, 1.0],
    green:  [0.011, 0.682, 0.553, 1.0],
    yellow: [1.0, 0.756, 0.27, 1.0],
    blue:   [0.0, 0.7364, 0.6874, 1.0],
    lightGreen: [0.607, 1.0, 0.694, 1.0],
    red:    [0.941, 0.325, 0.447, 1.0],
    violet: [0.345, 0.388, 0.972, 1.0]
}

let Materials = {

    createShadeMaterial: (shader) => {
        return new THREE.ShaderMaterial({
            uniforms:       THREE.UniformsUtils.clone(shader.uniforms),
            vertexShader:   shader.vertexShader,
            fragmentShader: shader.fragmentShader,
            side: THREE.FrontSide
        })
    },

    black: new THREE.MeshBasicMaterial({
        color: 0x1C1D1D,
        side: THREE.DoubleSide
    }),
    white: new THREE.MeshBasicMaterial({
        color: 0xF9F9F9,
        side: THREE.DoubleSide
    }),
    tile: new THREE.MeshBasicMaterial({
        color: 0x8B8B8A,
        side: THREE.DoubleSide
    }),
    green: new THREE.MeshBasicMaterial({
        color: 0x03AE8D,
        side: THREE.DoubleSide
    }),
    red: new THREE.MeshBasicMaterial({
        color: 0xF05372,
        side: THREE.DoubleSide
    }),
    gray: new THREE.MeshBasicMaterial({
        color: 0x39495A,
        side: THREE.DoubleSide
    }),
    violet: new THREE.MeshBasicMaterial({
        color: 0xB476AF,
        side: THREE.DoubleSide
    })
}

let Shaders = {
    outline: {
        uniforms: {
            "lineWidth": { type: "f", value: 0.8 },
            "time":      { type: "f", value: 0.0 },
            "depth":     { type: "f", value: 1.0 },
            "color":     { type: "v4", value: [0.0, 0.0, 0.0, 1.0] },
            "coords":    { type: "v2", value: [0.0, 0.0] }
        },
        vertexShader: [
            "uniform float time;",
            "uniform float depth;",
            "uniform vec2 coords;",
            "uniform float lineWidth;",
            "void main() {",
                "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
                "vec4 displacement = vec4( normalize( normalMatrix * normal ) * lineWidth, 0.0 ) + mvPosition;",
                "displacement.y += depth * sin(time + coords.x + coords.y);",
                "gl_Position = projectionMatrix * displacement;",
            "}"
        ].join("\n"),
        fragmentShader: [
            "uniform float time;",
            "uniform vec4 color;",
            "uniform vec2 coords;",
            "void main() {",
                "vec4 outputColor = color;",
                "outputColor += sin(time + coords.x + coords.y) / 15.0;",
                "gl_FragColor = outputColor;",
            "}"
        ].join("\n")
    }
}
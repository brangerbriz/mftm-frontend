class Block {
    constructor( config ){
        this.obj = new THREE.Object3D()
        this.position = this.obj.position
        this.rotation = this.obj.rotation

        this.uniforms = {
            phase: { type: "f", value: 0.0 }
        }

        this.material = new THREE.ShaderMaterial({
            uniforms:this.uniforms,
            linewidth:2,
            vertexShader:this.vertexShader(),
            // fragmentShader:document.querySelector('#frag').textContent
            fragmentShader:this.fragmentShader()
        })

        this.innerCube = new THREE.Mesh(
            new THREE.BoxGeometry(0.75,0.75,0.75), this.material )

        this.outerCube = new THREE.Line(
            this.buffLineCube(1.5), this.material )

        this.obj.add( this.innerCube )
        this.obj.add( this.outerCube )
    }
    buffLineCube( size ) {
        let h = size * 0.5
        let geometry = new THREE.BufferGeometry()
        let position = [
            -h,-h,-h, -h, h,-h,  h, h,-h,  h,-h,-h,
            -h,-h,-h, -h,-h, h, -h, h, h, -h, h,-h,
            -h, h, h,  h, h, h,  h,-h, h, -h,-h, h,
             h,-h, h,  h,-h,-h,  h, h,-h,  h, h, h,
        ]
        geometry.addAttribute('position',
            new THREE.Float32BufferAttribute(position,3) )
        return geometry
    }
    vertexShader(){
        return `
        varying vec3 vp;

        void main() {
            vec3 trans = vec3(position);
            vec4 mvPos = modelViewMatrix * vec4(trans,1.0);
            gl_Position = projectionMatrix * mvPos;
            vp = -mvPos.xyz;
        }`
    }
    fragmentShader(){
        return `
        #extension GL_OES_standard_derivatives : enable

        uniform float phase;
        varying vec3 vp;

        void main() {
            vec3 fdx = vec3(dFdx(vp.x), dFdx(vp.y), dFdx(vp.z));
            vec3 fdy = vec3(dFdy(vp.x), dFdy(vp.y), dFdy(vp.z));
            vec3 fdz = vec3(dFdy(vp.y), dFdx(vp.z), dFdy(vp.y));
            vec3 fdxy = refract( fdx, fdz, 0.0 );
            vec3 norm = normalize( fdxy );
            float x = norm.x;
            float y = norm.y + phase;
            float z = norm.z * 6.0 + 0.25;
            gl_FragColor = vec4( x, y, z, 1.0 );
        }`
    }
    update(){
        let pX = this.position.x + 1.5
        let rx = this.innerCube.rotation.x + Math.PI * 0.5

        new TWEEN.Tween(this.position)
            .to({ x:pX, y:0, z:0 }, 500)
            .easing(TWEEN.Easing.Sinusoidal.Out)
            .start()

        new TWEEN.Tween(this.uniforms.phase)
            .to({ type: "f", value: pX/6 }, 500)
            .easing(TWEEN.Easing.Sinusoidal.Out)
            .start()

        new TWEEN.Tween(this.innerCube.rotation)
            .to({ x:rx, y:0, z:0 }, 500)
            .easing(TWEEN.Easing.Sinusoidal.Out)
            .start()
    }
}

import {useEffect, useRef} from "react";
import * as THREE from 'three'
import * as dat from 'dat.gui'

export default function Index (){
    let webglOutput=useRef(null)
    const init=()=>{
        let scene=new THREE.Scene()
        let renderer=new THREE.WebGLRenderer()
        renderer.setClearColor(new THREE.Color(0x000000))
        renderer.setSize(window.innerWidth,window.innerHeight)
        let planeGeometry=new THREE.PlaneGeometry(60,60)
        let planeMaterial=new THREE.MeshBasicMaterial({color:0xcccccc})
        let plane=new THREE.Mesh(planeGeometry,planeMaterial)
        plane.rotation.x=-0.5*Math.PI
        plane.position.x=-10
        plane.position.y=-5
        plane.position.z=-2
        scene.add(plane)
        let camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000)
        camera.position.x=50
        camera.position.y=20
        camera.position.z=50
        camera.lookAt(scene.position)
        function addBox(length,translateX,translateY,translateZ){
            let boxLength=1.5
            let boxGeometry=new THREE.BoxGeometry(boxLength,boxLength,boxLength)
            let material=new THREE.MeshNormalMaterial()
            let rolTotal=Math.floor(length/2/boxLength)
            for(let i=0;i<rolTotal;i++){
                for(let j=0;j<rolTotal;j++){
                    let mesh=new THREE.Mesh(boxGeometry,material)
                    mesh.position.x=-length/2+boxLength/2+2*i*boxLength+translateX
                    mesh.position.y=boxLength/2+translateY
                    mesh.position.z=-length/2+boxLength/2+2*j*boxLength+translateZ
                    scene.add(mesh)
                }
            }
        }
        let controls=new function (){
            this.currentCamera="透视投影摄像机"
            this.changeCamera=function (){
                if(camera instanceof THREE.PerspectiveCamera){
                    camera=new THREE.OrthographicCamera(window.innerWidth/-16,window.innerWidth/16,window.innerHeight/16,window.innerHeight/-16,-200,500)
                    camera.position.x=50
                    camera.position.y=20
                    camera.position.z=50
                    camera.lookAt(scene.position)
                    this.currentCamera="正交投影摄像机"
                }else {
                    camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000)
                    camera.position.x=50
                    camera.position.y=20
                    camera.position.z=50
                    camera.lookAt(scene.position)
                    this.currentCamera="透视投影摄像机"
                }
            }
        }
        let gui=new dat.GUI()
        gui.add(controls,'changeCamera','切换摄像机')
        gui.add(controls,'currentCamera','当前摄像机类型').listen()
        addBox(60,plane.position.x,plane.position.y,plane.position.z)
        webglOutput.current.appendChild(renderer.domElement)
        function renderScene() {
            renderer.render(scene, camera);
            requestAnimationFrame(renderScene);
        }
        renderScene()
    }

    useEffect(()=>{
        init()
    },[])
    return (
        <div ref={webglOutput}></div>
    )
}

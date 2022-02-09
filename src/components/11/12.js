import {useEffect, useRef} from "react";
import * as THREE from 'three'
import * as dat from 'dat.gui'

export default function Index (){
    let webglOutput=useRef(null)

    const init=()=>{

        let scene=new THREE.Scene()
        let camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,10,200)
        let renderer=new THREE.WebGLRenderer()
        renderer.setClearColor(new THREE.Color(0xffffff))
        renderer.setSize(window.innerWidth,window.innerHeight)
        let planeGeometry=new THREE.PlaneGeometry(60,60)
        let planeMaterial=new THREE.MeshBasicMaterial({color:0xff0000})
        let plane=new THREE.Mesh(planeGeometry,planeMaterial)
        plane.rotation.x=-0.5*Math.PI
        plane.position.x=-10
        plane.position.y=-5
        plane.position.z=-2
        scene.add(plane)

        camera.position.x=50
        camera.position.y=20
        camera.position.z=50

        camera.lookAt(scene.position)
        function addBox(length,translateX,translateY,translateZ){
            let boxlength=1.5
            let boxGeometry=new THREE.BoxGeometry(boxlength,boxlength,boxlength)
            let material=new THREE.MeshNormalMaterial({color:0xff0000})
            let rolTotal=Math.floor(length/2/boxlength)
            for(let i=0;i<rolTotal;i++){
                for(let j=0;j<rolTotal;j++){
                    let mesh=new THREE.Mesh(boxGeometry,material)
                    mesh.position.x=-length/2+boxlength/2+2*i*boxlength+translateX
                    mesh.position.y=boxlength/2+translateY
                    mesh.position.z=-length/2+boxlength/2+2*j*boxlength+translateZ
                    scene.add(mesh)
                }
            }
        }
        let controls=new function (){
            this.cameraNear=camera.near
            this.cameraFar=camera.far
        }
        let gui=new dat.GUI()
        gui.add(controls,'cameraNear',0,50,'摄像机的Near的值').onChange(function (e){
            camera.near=e
        })
        gui.add(controls,'cameraFar',50,200,'摄像机的Far值').onChange(function (e){
            camera.far=e
        })
        // scene.overrideMaterial=new THREE.MeshDepthMaterial()
        addBox(60,plane.position.x,plane.position.y,plane.position.z)



        webglOutput.current.appendChild(renderer.domElement)
        window.addEventListener('resize',onResize,false)
        function onResize(){
            renderer.setSize(window.innerWidth,window.innerHeight)
            camera.aspect=(window.innerWidth/window.innerHeight)
            camera.updateProjectionMatrix()
        }
        renderScene()

        function renderScene() {
            requestAnimationFrame(renderScene);
            renderer.render(scene, camera);
        }
    }


    useEffect(()=>{
        init()
    },[])
    return (
        <div ref={webglOutput}></div>
    )
}

import {useEffect, useRef} from "react";
import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'
import * as dat from 'dat.gui'
import {Stats} from '../../utils/stats'
import Detector from '../../utils/Detector'
import '../../utils/OrbitControls'
import '../../utils/AssimpLoader'


export default function Index (){
    let webglOutput=useRef(null)
    let statsDom=useRef(null)

    const webglRender=()=>{
        {
            if(!Detector.webgl){
                Detector.addGetWebGLMessage()
            }
        }
        let renderer=new THREE.WebGLRenderer({antialias:false})
        {//render
            renderer.setClearColor(new THREE.Color(0x000000))
            renderer.setSize(window.innerWidth,window.innerHeight)
            renderer.shadowMap.enabled=true
            webglOutput.current.appendChild(renderer.domElement)
        }
        let scene=new THREE.Scene()
        let camera=new THREE.PerspectiveCamera(25,window.innerWidth/window.innerHeight,0.1,2000)

        {//camera
            camera.position.x=60
            camera.position.y=60
            camera.position.z=60

            camera.lookAt(new THREE.Vector3(0, 0, 0))
        }
        let box
        {
            let texloader=new THREE.TextureLoader()
            let texture=texloader.load('/models/box.jpg')
            let mat=new THREE.MeshPhongMaterial()
            mat.map=texture
            let geometry=new THREE.BoxGeometry(15,15,15)
            box=new THREE.Mesh(geometry,mat)
            box.castShadow=true
            scene.add(box)
        }
        let light=new THREE.SpotLight(0xffffff)
        {
            light.position.set(20,40,20)
            light.shadow.mapSize.width=2048
            light.shadow.mapSize.height=2048
            light.shadow.camera.near=0.1
            light.shadow.camera.far=100
            light.shadow.camera.fov=60
            light.angle=0.4
            light.castShadow=true
            scene.add(light)

        }






        {
            window.addEventListener('resize',onResize,false)
            function onResize(){
                renderer.setSize(window.innerWidth,window.innerHeight)
                camera.aspect=(window.innerWidth/window.innerHeight)
                camera.updateProjectionMatrix()
            }
        }
        let stats=new Stats()
        {
            stats.setMode(0)
            stats.domElement.style.position='absolute'
            stats.domElement.style.left='0px'
            stats.domElement.style.top='0px'
            statsDom.current.appendChild(stats.domElement)
        }
        let clock=new THREE.Clock()
        let step=0
        function renderScene() {

            stats.update()
            let delta=clock.getDelta()
            if(box){
                step+=0.01
                box.rotation.y=step
            }

            requestAnimationFrame(renderScene);
            renderer.render(scene, camera);
        }

        renderScene()
    }


    useEffect(()=>{
        webglRender()
    },[])
    return (
        <div>
            <div ref={statsDom}></div>
            <div ref={webglOutput}></div>
        </div>

    )
}

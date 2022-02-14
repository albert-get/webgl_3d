import {useEffect, useRef} from "react";
import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'
import * as dat from 'dat.gui'
import {Stats} from '../../utils/stats'
import Detector from '../../utils/Detector'
import '../../utils/OBJLoader'


export default function Index (){
    let webglOutput=useRef(null)
    let statsDom=useRef(null)

    const webglRender=()=>{
        {
            if(!Detector.webgl){
                Detector.addGetWebGLMessage()
                return
            }
        }
        let renderer=new THREE.WebGLRenderer()
        {//render
            renderer.setClearColor(new THREE.Color(0x000000))
            renderer.setSize(window.innerWidth,window.innerHeight)
            renderer.shadowMap.enabled=true
            webglOutput.current.appendChild(renderer.domElement)
        }
        let scene=new THREE.Scene()
        let camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000)

        {//camera
            camera.position.x=30
            camera.position.y=0
            camera.position.z=30

            camera.lookAt(new THREE.Vector3(0, 0, 0))
        }


        {
            let ambientLight=new THREE.AmbientLight(0xffffff)
            scene.add(ambientLight)
            let light=new THREE.SpotLight()
            light.position.set(0,0,30)
            light.intensity=0.8
            scene.add(light)


        }
        let earth
        {
            let sphereG=new THREE.SphereGeometry(10,40,40)
            let planeTexture=THREE.ImageUtils.loadTexture('/models/Earth.png')
            let specularTexture=THREE.ImageUtils.loadTexture('/models/EarthSpec.png')
            let normalTexture=THREE.ImageUtils.loadTexture('/models/EarthNormal.png')
            let planeMaterial=new THREE.MeshPhongMaterial()
            planeMaterial.specularMap=specularTexture
            planeMaterial.specular=new THREE.Color(0xffffff)
            planeMaterial.shininess=40
            planeMaterial.normalMap=normalTexture
            planeMaterial.map=planeTexture
            let sphere=new THREE.Mesh(sphereG,planeMaterial)
            scene.add(sphere)
            earth=sphere
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
            step+=0.01
            earth.rotation.y=step

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

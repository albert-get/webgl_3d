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
        let camera=new THREE.PerspectiveCamera(25,window.innerWidth/window.innerHeight,0.1,1000)

        {//camera
            camera.position.x=30
            camera.position.y=30
            camera.position.z=30

            camera.lookAt(new THREE.Vector3(0, 0, 0))
        }


        {
            let light=new THREE.DirectionalLight(0xffffff)
            light.position.set(10,10,10)

            scene.add(light)
            let spotLight=new THREE.SpotLight(0xffffff)
            spotLight.position.set(0,10,0)
            scene.add(spotLight)

        }

        let model
        {
            let loader=new THREE.OBJLoader()
            loader.load('/models/konglong.obj',function (loadedMesh){
                let texture=new THREE.TextureLoader().load('/models/konglong.jpg')
                let normal=new THREE.TextureLoader().load('/models/konglongn.jpg')
                let mat=new THREE.MeshPhongMaterial()
                mat.map=texture
                mat.normalMap=normal
                loadedMesh.children.forEach(function (child){
                    child.material=mat
                })
                model=loadedMesh
                model.scale.set(0.7,0.7,0.7)
                model.rotation.y=Math.PI*0.25
                scene.add(model)
            })
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
            if(model){
                model.rotation.y+=0.006
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

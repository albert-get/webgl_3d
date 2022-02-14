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
            camera.position.x=-20
            camera.position.y=20
            camera.position.z=30

            camera.lookAt(new THREE.Vector3(0, 0, 0))
        }


        {
            let ambientLight=new THREE.AmbientLight(0x0c0c0c)
            scene.add(ambientLight)
            let light=new THREE.SpotLight()
            light.position.set(186,104,111)
            light.intensity=1.2
            scene.add(light)


        }

        {
            let groundGeom=new THREE.PlaneGeometry(40,40,1,1)
            let lm=THREE.ImageUtils.loadTexture('/models/pm.png')
            let wood=THREE.ImageUtils.loadTexture('/models/floor-wood.jpg')
            let groundMaterial=new THREE.MeshBasicMaterial({
                color:0xffffff,
                lightMap:lm,
                map:wood
            })
            groundGeom.faceVertexUvs[1]=groundGeom.faceVertexUvs[0]
            let groundMesh=new THREE.Mesh(groundGeom,groundMaterial)
            groundMesh.rotation.x=-Math.PI/2
            groundMesh.position.y=0
            scene.add(groundMesh)
            let model
            let chahu2
            let loader=new THREE.OBJLoader()
            loader.load('/models/chahu.obj',function (loaderMesh){
                let meshMaterial=new THREE.MeshPhongMaterial()
                meshMaterial.map=THREE.ImageUtils.loadTexture('/models/ghxp.png')
                loaderMesh.children.forEach(function (child){
                    child.material=meshMaterial
                })
                model=loaderMesh
                loaderMesh.scale.set(0.4,0.4,0.4)
                loaderMesh.rotation.y=0.2
                loaderMesh.position.set(-8,0,0)
                scene.add(loaderMesh)
                chahu2=loaderMesh.clone()
                chahu2.position.set(2.8,0,-8)
                scene.add(chahu2)
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
        function renderScene() {

            stats.update()


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

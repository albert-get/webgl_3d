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
            webglOutput.current.appendChild(renderer.domElement)
        }
        let scene=new THREE.Scene()
        let camera=new THREE.PerspectiveCamera(25,window.innerWidth/window.innerHeight,0.1,2000)

        {//camera
            camera.position.x=1000
            camera.position.y=0
            camera.position.z=0

            camera.lookAt(new THREE.Vector3(0, 0, 0))
        }






        let mesh
        let animation
        {
            var onProgress = function( xhr ) {
                if ( xhr.lengthComputable ) {
                    var percentComplete = xhr.loaded / xhr.total * 100;
                    console.log( Math.round( percentComplete, 2 ) + '% downloaded' );
                }
            };

            var onError = function( xhr ) {
            };
            let loader=new THREE.AssimpLoader()
            loader.load('/models/Octaminator.assimp',function (assimp){
                mesh=assimp.object
                mesh.position.x=-100
                mesh.position.y=0
                mesh.rotation.x=Math.PI/2
                mesh.rotation.y=-Math.PI/2
                mesh.rotation.z=Math.PI/2
                mesh.scale.set(0.5,0.5,0.5)
                animation=assimp.animation
                scene.add(mesh)
                light.lookAt(mesh.position)

            },onProgress,onError)
        }
        {
            let controls=new THREE.OrbitControls(camera,renderer.domElement)
            controls.minDistance=40
            controls.maxDistance=1000
            controls.enablePan=true
            controls.zoomSpeed=3.0
        }


        let light=new THREE.DirectionalLight(0xffffff,1.0)
        {
            light.position.set(0,4,4)
            // light.lookAt(mesh.position)

            scene.add(light)
            let ambientLight=new THREE.AmbientLight(0x8888ff)
            scene.add(ambientLight)
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
            let delta=clock.getDelta()
            if(animation){
                animation.setTime(Date.now()/1000)
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

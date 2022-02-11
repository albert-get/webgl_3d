import {useEffect, useRef} from "react";
import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'
import * as dat from 'dat.gui'
import {Stats} from '../../utils/stats'
import '../../utils/OrbitControls'
import '../../utils/FBXLoader'
import Detector from '../../utils/Detector'


export default function Index (){
    let webglOutput=useRef(null)
    let statsDom=useRef(null)

    const webglRender=()=>{
        {
            if(!Detector.webgl){
                Detector.addGetWebGLMessage()
            }
        }
        let renderer=new THREE.WebGLRenderer()
        {//render
            renderer.setClearColor(new THREE.Color(0xffffff))
            renderer.setSize(window.innerWidth,window.innerHeight)
            renderer.setPixelRatio(window.devicePixelRatio)
            webglOutput.current.appendChild(renderer.domElement)
        }
        let scene=new THREE.Scene()
        let camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,1,2000)

        {//camera
            camera.position.x=2
            camera.position.y=18
            camera.position.z=28

            camera.lookAt(new THREE.Vector3(0, 0, 0))
        }
        let gridHelper=new THREE.GridHelper(30,20)
        {
            gridHelper.setColors(0x303030,0x303030)
            gridHelper.position.set(0,-0.04,0)
            scene.add(gridHelper)
        }

        let stats=new Stats()
        {
            stats.setMode(0)
            stats.domElement.style.position='absolute'
            stats.domElement.style.left='0px'
            stats.domElement.style.top='0px'
            statsDom.current.appendChild(stats.domElement)
        }

        let light=new THREE.SpotLight(0xffffff)
        {
            light.position.set(300,500,100)
            light.intensity=3
            scene.add(light)
        }
        let manager=new THREE.LoadingManager()
        {
            manager.onProgress=function (item,loaded,total){
                console.log(item,loaded,total)
            }

        }
        let mixers=[]
        let clock=new THREE.Clock()

        {
            var onProgress = function( xhr ) {
                if ( xhr.lengthComputable ) {
                    var percentComplete = xhr.loaded / xhr.total * 100;
                    console.log( Math.round( percentComplete, 2 ) + '% downloaded' );
                }
            };

            var onError = function( xhr ) {
            };
            let loader=new THREE.FBXLoader(manager)
            loader.load('/models/fbx/xsi_man_skinning.fbx',function (object){
                object.traverse(function (child){
                    if(child instanceof THREE.Mesh){

                    }
                    if(child instanceof THREE.SkinnedMesh){
                        if(child.geometry.animations!==undefined||child.geometry.morphAnimations!==undefined){
                            child.mixer=new THREE.AnimationMixer(child)
                            mixers.push(child.mixer)
                            let action=child.mixer.clipAction(child.geometry.animations[0])
                            action.play()
                        }
                    }
                })
                scene.add(object)
            },onProgress,onError)
        }
        {
            let controls=new THREE.OrbitControls(camera,renderer.domElement)
            controls.enabled=true
            controls.minDistance=50
            controls.maxDistance=100
            controls.minAzimuthAngle=-1
            controls.maxAzimuthAngle=1
            controls.minPolarAngle=-2
            controls.maxPolarAngle=2
            controls.target.set(0,12,0)
            controls.update()
        }

        {
            window.addEventListener('resize',onResize,false)
            function onResize(){
                renderer.setSize(window.innerWidth,window.innerHeight)
                camera.aspect=(window.innerWidth/window.innerHeight)
                camera.updateProjectionMatrix()
            }
        }
        renderScene()


        function renderScene() {

            stats.update()
            let delta=clock.getDelta()
            if ( mixers.length > 0 ) {
                for ( var i = 0; i < mixers.length; i ++ ) {
                    mixers[ i ].update( delta );
                }
            }
            requestAnimationFrame(renderScene);
            renderer.render(scene, camera);
        }

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

import {useEffect, useRef} from "react";
import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'
import * as dat from 'dat.gui'
import {Stats} from '../../utils/stats'
import '../../utils/ColladaLoader'

export default function Index (){
    let webglOutput=useRef(null)
    let statsDom=useRef(null)

    const webglRender=()=>{

        let renderer=new THREE.WebGLRenderer()
        {//render
            renderer.setClearColor(new THREE.Color(0xffffff,1.0))
            renderer.setSize(window.innerWidth,window.innerHeight)
            renderer.shadowMap.enabled=true
            webglOutput.current.appendChild(renderer.domElement)
        }
        let scene=new THREE.Scene()
        let camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000)


        {//camera
            camera.position.x=400
            camera.position.y=50
            camera.position.z=150

            camera.lookAt(new THREE.Vector3(0, 0, 0))
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
        let clock=new THREE.Clock()

        let animation
        {
            let loader=new THREE.ColladaLoader()
            loader.load('/models/monster.dae',function (collada){

                let animations=collada.animations

                let child=collada.scene
                animation=new THREE.AnimationMixer(child)
                let action=animation.clipAction(animations[ 0 ]).play()
                child.scale.set(0.1,0.1,0.1)
                child.rotation.x=-0.5*Math.PI
                child.position.x=-100
                child.position.y=-60
                scene.add(child)
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
        renderScene()

        function renderScene() {

            stats.update()
            let delta=clock.getDelta()
            if(animation!==undefined){
                animation.update(delta)
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

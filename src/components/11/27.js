import {useEffect, useRef} from "react";
import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'
import * as dat from 'dat.gui'
import {Stats} from '../../utils/stats'

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
            camera.position.x=0
            camera.position.y=0
            camera.position.z=4

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
            light.position.set(0,50,30)
            light.intensity=2
            scene.add(light)
        }
        let mesh
        let helper
        let clock=new THREE.Clock()
        let gui=new dat.GUI()
        {
            let controls=new function (){
                this.showHelper=false
            }
            gui.add(controls,'showHelper',0,0.5).onChange(function (state){
                helper.visible=state
            })
        }
        let animation=new THREE.AnimationMixer(scene)
        {
            let loader=new THREE.JSONLoader()
            loader.load('/models/hand-2.js',function (geometry){
                let mat=new THREE.MeshLambertMaterial({color:0xf0c8c9,skinning:true})
                mesh=new THREE.SkinnedMesh(geometry,mat)
                mesh.rotation.x=0.5*Math.PI
                mesh.rotation.z=0.7*Math.PI
                scene.add(mesh)
                animation.clipAction(geometry.animations[0],mesh)
                    .setDuration(1)
                    .startAt(-Math.random())
                    .play()
                helper=new THREE.SkeletonHelper(mesh)
                helper.material.linewidth=5
                helper.visible=true
                scene.add(helper)
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
            if(mesh){
                helper.update()
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

import {useEffect, useRef} from "react";
import * as THREE from 'three'
import * as dat from 'dat.gui'
import {Stats} from '../../utils/stats'
import '../../utils/ColladaLoader'

export default function Index (){
    let webglOutput=useRef(null)
    let statsDom=useRef(null)

    const init=()=>{
        let stats=initStats()
        let scene=new THREE.Scene()
        let camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000)
        let renderer=new THREE.WebGLRenderer()
        renderer.setClearColor(new THREE.Color(0xffffff,1.0))
        renderer.setSize(window.innerWidth,window.innerHeight)
        renderer.shadowMap.enabled=true



        camera.position.set(150,150,150)

        camera.lookAt(new THREE.Vector3(0,20,0))
        scene.add(camera)


        let light=new THREE.DirectionalLight(0xffffff)
        light.position.set(150,150,150)
        light.intensity=2
        scene.add(light)

        webglOutput.current.appendChild(renderer.domElement)

        let onProgress=function (xhr){
            if(xhr.lengthComputable){
                let percentComplete=xhr.loaded/xhr.total*100
                console.log(Math.round(percentComplete,2)+'% downloaded')
            }
        }
        let onError=function (xhr){

        }
        let mesh
        let loader=THREE.ColladaLoader()
        loader.load('/models/dae/Truck_dae.dae',function (result){
            mesh=result.scene.children[0].children[0].clone()
            mesh.scale.set(4,4,4)
            scene.add(mesh)
        },onProgress,onError)

        window.addEventListener('resize',onResize,false)
        function onResize(){
            renderer.setSize(window.innerWidth,window.innerHeight)
            camera.aspect=(window.innerWidth/window.innerHeight)
            camera.updateProjectionMatrix()
        }
        renderScene()

        function renderScene() {

            stats.update()
            requestAnimationFrame(renderScene);
            renderer.render(scene, camera);
        }
        function initStats(){
            let stats=new Stats()
            stats.setMode(0)
            stats.domElement.style.position='absolute'
            stats.domElement.style.left='0px'
            stats.domElement.style.top='0px'
            statsDom.current.appendChild(stats.domElement)
            return stats
        }
    }


    useEffect(()=>{
        init()
    },[])
    return (
        <div>
            <div ref={statsDom}></div>
            <div ref={webglOutput}></div>
        </div>

    )
}

import {useEffect, useRef} from "react";
import * as THREE from 'three'
import * as dat from 'dat.gui'
import {Stats} from '../../utils/stats'

export default function Index (){
    let webglOutput=useRef(null)
    let statsDom=useRef(null)

    const init=()=>{
        let stats=initStats()
        let scene=new THREE.Scene()
        let camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000)
        let renderer=new THREE.WebGLRenderer()
        renderer.setClearColor(new THREE.Color(0xEEEEEE,1.0))
        renderer.setSize(window.innerWidth,window.innerHeight)
        renderer.shadowMap.enabled=true



        camera.position.x=-30
        camera.position.y=40
        camera.position.z=50

        camera.lookAt(new THREE.Vector3(0,10,0))


        let spotLight=new THREE.PointLight(0xffffff)
        spotLight.position.set(0,50,30)
        spotLight.position.set(0,50,30)
        spotLight.intensity=2
        scene.add(spotLight)

        let mesh
        // let loader=new THREE.FileLoader()
        // loader.load('/models/misc_chair01.js',function (geometry,mat){
        //     mesh=new THREE.Mesh(geometry,mat[0])
        //     mesh.scale.x=15
        //     mesh.scale.y=15
        //     mesh.scale.z=15
        //     scene.add(mesh)
        // })



        webglOutput.current.appendChild(renderer.domElement)
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

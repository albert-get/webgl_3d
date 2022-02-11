import {useEffect, useRef} from "react";
import * as THREE from 'three'
import * as dat from 'dat.gui'
import {Stats} from '../../utils/stats'
import '../../utils/OBJLoader'
import '../../utils/MTLLoader'

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



        camera.position.set(-30,40,50)

        camera.lookAt(new THREE.Vector3(0,10,10))
        scene.add(camera)


        let light=new THREE.DirectionalLight(0xffffff)
        light.position.set(0,40,50)
        light.intensity=2
        scene.add(light)

        webglOutput.current.appendChild(renderer.domElement)

        let mesh
        let texLoader=new THREE.TextureLoader()
        let wingmap=texLoader.load('/models/butterflywings.png')
        let onProgress=function (xhr){
            if(xhr.lengthComputable){
                let percentComplete=xhr.loaded/xhr.total*100
                console.log(Math.round(percentComplete,2)+'% downloaded')
            }
        }
        let onError=function (xhr){

        }
        let loader=new THREE.MTLLoader()
        loader.load('/models/butterfly.mtl',function (mtl){
            let objloader=new THREE.OBJLoader()
            objloader.setMaterials(mtl)
            objloader.load('/models/butterfly.obj',function (loadmesh){
                let wing2=loadmesh.children[5]
                let wing1=loadmesh.children[4]
                wing1.material.opacity=0.8
                wing1.material.map=wingmap
                wing1.material.transparent=true
                wing1.material.depthTest=false
                wing1.material.side=THREE.DoubleSide
                wing2.material.opacity=0.8
                wing2.material.map=wingmap
                wing2.material.depthTest=false
                wing2.material.transparent=true
                wing2.material.side=THREE.DoubleSide

                loadmesh.scale.set(140,140,140)
                mesh=loadmesh
                scene.add(mesh)
            })
        },onProgress,onError)

        window.addEventListener('resize',onResize,false)
        function onResize(){
            renderer.setSize(window.innerWidth,window.innerHeight)
            camera.aspect=(window.innerWidth/window.innerHeight)
            camera.updateProjectionMatrix()
        }
        renderScene()

        function renderScene() {
            if(mesh){
                mesh.rotation.y+=0.006
            }
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

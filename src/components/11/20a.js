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



        camera.position.set(130,40,50)

        camera.lookAt(scene.position)
        scene.add(camera)


        let light=new THREE.DirectionalLight(0xffffff)
        light.position.set(30,40,50)
        light.intensity=1
        scene.add(light)

        webglOutput.current.appendChild(renderer.domElement)

        let mesh
        let onProgress=function (xhr){
            if(xhr.lengthComputable){
                let percentComplete=xhr.loaded/xhr.total*100
                console.log(Math.round(percentComplete,2)+'% downloaded')
            }
        }
        let onError=function (xhr){

        }
        let material=new THREE.MeshLambertMaterial({color:0x5c3A21})
        let loader=new THREE.OBJLoader()
        loader.load('/models/pinecone.obj',function (loadedMesh){
            loadedMesh.children.forEach(function (child){
                child.material=material
                // child.geometry.computeFaceNormals()
                child.geometry.computeVertexNormals()
            })
            mesh=loadedMesh
            loadedMesh.scale.set(100,100,100)
            loadedMesh.rotation.x=-0.3
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
            if(mesh){
                mesh.rotation.y+=0.006
                mesh.rotation.x+=0.006
                mesh.rotation.z+=0.006
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

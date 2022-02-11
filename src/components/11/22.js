import {useEffect, useRef} from "react";
import * as THREE from 'three'
import * as dat from 'dat.gui'
import {Stats} from '../../utils/stats'
import '../../utils/OrbitControls'
import '../../utils/GLTFLoader'

export default function Index (){
    let webglOutput=useRef(null)
    let statsDom=useRef(null)

    const webglRender=()=>{

        let stats=initStats()
        let scene=new THREE.Scene()
        let camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000)
        let renderer=new THREE.WebGLRenderer({antialias:false})
        renderer.setClearColor(new THREE.Color(0xffffff))
        renderer.setSize(window.innerWidth,window.innerHeight)

        camera.position.x=10
        camera.position.y=10
        camera.position.z=10

        camera.lookAt(scene.position)
        scene.add(camera)


        let light=new THREE.SpotLight(0xffffff)
        light.position.set(30,30,30)
        scene.add(light)
        let ambientLight=new THREE.AmbientLight('#000022')
        scene.add(ambientLight)

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
        let loader=new THREE.GLTFLoader()
        loader.load('/models/AnimatedMorphSphere.gltf',function (gltf){
            gltf.scene.traverse(function (node){
                if(node.isMesh){
                    mesh=node
                }
            })
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
        webglRender()
    },[])
    return (
        <div>
            <div ref={statsDom}></div>
            <div ref={webglOutput}></div>
        </div>

    )
}

import {useEffect, useRef} from "react";
import * as THREE from 'three'
import * as dat from 'dat.gui'
import {Stats} from '../../utils/stats'
import '../../utils/STLLoader'

export default function Index (){
    let webglOutput=useRef(null)
    let statsDom=useRef(null)

    const webglRender=()=>{

        let renderer=new THREE.WebGLRenderer({antialias:false})
        {//render
            renderer.setClearColor(new THREE.Color(0xffffff))
            renderer.setSize(window.innerWidth,window.innerHeight)
            webglOutput.current.appendChild(renderer.domElement)
        }
        let scene=new THREE.Scene()
        let camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000)


        {//camera
            camera.position.x=150
            camera.position.y=150
            camera.position.z=150

            camera.lookAt(new THREE.Vector3(0, 40, 0))
            scene.add(camera)
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
        light.position.set(150,150,150)
        scene.add(light)





        let loader=new THREE.STLLoader()
        let group=new THREE.Object3D()
        loader.load('/models/SolidHead_2_lowPoly_42k.stl',function (geometry){
            let mat=new THREE.MeshLambertMaterial({color:0x7777ff})
            group=new THREE.Mesh(geometry,mat)
            group=new THREE.Mesh(geometry,mat)
            group.rotation.x=-0.5*Math.PI
            group.scale.set(0.6,0.6,0.6)
            scene.add(group)
        },onProgress,onError)

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
            if(group){
                group.rotation.y+=0.006
            }
            requestAnimationFrame(renderScene);
            renderer.render(scene, camera);
        }
        function onProgress (xhr){
            if(xhr.lengthComputable){
                let percentComplete=xhr.loaded/xhr.total*100
                console.log(Math.round(percentComplete,2)+'% downloaded')
            }
        }
        function onError (xhr){

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

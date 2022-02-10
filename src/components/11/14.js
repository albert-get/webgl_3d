import {useEffect, useRef} from "react";
import * as THREE from 'three'
import * as dat from 'dat.gui'

export default function Index (){
    let webglOutput=useRef(null)

    const init=()=>{

        let scene=new THREE.Scene()
        let camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000)
        let renderer=new THREE.WebGLRenderer()
        renderer.setClearColor(new THREE.Color(0x000000))
        renderer.setSize(window.innerWidth,window.innerHeight)

        camera.position.x=10
        camera.position.y=10
        camera.position.z=10

        camera.lookAt(scene.position)

        let box
        function addMaterial(){
            let boxGeometry=new THREE.BoxGeometry(4,4,4)
            let array=[]
            for(let i=0;i<6;i++){
                array.push(new THREE.MeshBasicMaterial({color:0xffffff*Math.random()}))
            }
            let boxMaterial=new THREE.MeshFaceMaterial(array)
            box=new THREE.Mesh(boxGeometry,boxMaterial)
            scene.add(box)
            boxMaterial.wireframe=true
            let spotLight=new THREE.SpotLight('#ffffff')
            spotLight.position.set(30,30,30)
            scene.add(spotLight)
        }
        addMaterial()


        webglOutput.current.appendChild(renderer.domElement)
        window.addEventListener('resize',onResize,false)
        function onResize(){
            renderer.setSize(window.innerWidth,window.innerHeight)
            camera.aspect=(window.innerWidth/window.innerHeight)
            camera.updateProjectionMatrix()
        }
        renderScene()

        function renderScene() {
            box.rotation.y+=0.02
            requestAnimationFrame(renderScene);
            renderer.render(scene, camera);
        }
    }


    useEffect(()=>{
        init()
    },[])
    return (
        <div ref={webglOutput}></div>
    )
}

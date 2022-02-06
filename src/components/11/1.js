import {useEffect, useRef} from "react";
import * as THREE from 'three'

export default function Index (){
    let webglOutput=useRef(null)
    const init=()=>{
        let scene=new THREE.Scene()
        let camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000)
        let renderer=new THREE.WebGLRenderer()
        renderer.setClearColor(new THREE.Color(0xffffff))
        renderer.setSize(window.innerWidth,window.innerHeight)
        let axes=new THREE.AxesHelper(6)
        scene.add(axes)
        let sphereGeometry=new THREE.SphereGeometry(4,20,20)
        let sphereMaterial=new THREE.MeshBasicMaterial({color:0x000000,wireframe:true})
        let sphere=new THREE.Mesh(sphereGeometry,sphereMaterial)
        sphere.position.x=0
        sphere.position.y=0
        sphere.position.z=0
        scene.add(sphere)
        camera.position.x=10
        camera.position.y=10
        camera.position.z=10
        camera.lookAt(scene.position)
        webglOutput.current.appendChild(renderer.domElement)
        function renderScene() {
            sphere.rotation.y += 0.02;
            requestAnimationFrame(renderScene);
            renderer.render(scene, camera);
        }
        renderScene()
    }

    useEffect(()=>{
        init()
    },[])
    return (
        <div ref={webglOutput}></div>
    )
}

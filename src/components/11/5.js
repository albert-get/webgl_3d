import {useEffect, useRef} from "react";
import * as THREE from 'three'
import * as dat from 'dat.gui'

export default function Index (){
    let webglOutput=useRef(null)
    let scene=null
    let renderer=null
    let background=null
    let mesh=null
    let camera=null
    const init=()=>{
        scene=new THREE.Scene()
        scene.add(new THREE.AmbientLight(0x222244))
        renderer=new THREE.WebGLRenderer()
        renderer.setPixelRatio(window.devicePixelRatio)
        renderer.setSize(window.innerWidth,window.innerHeight)
        renderer.shadowMap.enabled=true
        webglOutput.current.appendChild(renderer.domElement)

        let geometry=new THREE.PlaneBufferGeometry(100,100)
        let material=new THREE.MeshPhongMaterial({color:0xffffff})
        background=new THREE.Mesh(geometry,material)
        background.receiveShadow=true
        background.position.set(0,0,-1.5)
        scene.add(background)

        let boxLength=1.0
        let boxGeometry=new THREE.BoxGeometry(boxLength,boxLength,boxLength)
        let boxMaterial=new THREE.MeshPhongMaterial({color:0x00ffff})
        mesh=new THREE.Mesh(boxGeometry,boxMaterial)
        mesh.castShadow=true
        scene.add(mesh)
        let count=2
        let size=1/count
        let ratio=window.innerWidth/window.innerHeight
        let cameras=[]
        for(let i=0;i<count;i++){
            for(let j=0;j<count;j++){
                let subCamera=new THREE.PerspectiveCamera(45,ratio,0.1,100)
                subCamera.bounds=new THREE.Vector4(i/count,j/count,size,size)
                subCamera.position.x=(j/count)-0.5
                subCamera.position.y=0.5-(i/count)
                subCamera.position.z=3.5
                subCamera.lookAt(new THREE.Vector3())
                subCamera.updateMatrixWorld()
                cameras.push(subCamera)
            }
        }
        camera=new THREE.ArrayCamera(cameras)
        let directionalLightColor='#ffffff'
        let directionalLight=new THREE.DirectionalLight(directionalLightColor)
        directionalLight.castShadow=true
        directionalLight.position.set(0.5,0.5,1)
        directionalLight.intensity=0.8
        directionalLight.shadow.mapSize.height=1024
        directionalLight.shadow.mapSize.width=1024
        scene.add(directionalLight)
        window.addEventListener('resize',onResize,false)
        renderScene()
    }
    const onResize=()=>{
        renderer.setSize(window.innerWidth,window.innerHeight)
        camera.aspect=(window.innerWidth/window.innerHeight)
        camera.updateProjectionMatrix()
    }
    const renderScene=()=>{
        mesh.rotation.x+=0.005
        mesh.rotation.z+=0.01
        renderer.render(scene,camera)
        requestAnimationFrame(renderScene)
    }

    useEffect(()=>{
        init()
    },[])
    return (
        <div ref={webglOutput}></div>
    )
}

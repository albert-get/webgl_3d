import {useEffect, useRef} from "react";
import * as THREE from 'three'
import * as dat from 'dat.gui'

export default function Index (){
    let webglOutput=useRef(null)

    const init=()=>{
        let material
        let spotLight
        let rectLight
        let ambientLight
        let matStdParams
        let rectLightHelper
        let param={}
        let scene=new THREE.Scene()
        let camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000)
        let renderer=new THREE.WebGLRenderer({antialias:true})
        renderer.setClearColor(new THREE.Color(0x000000))
        renderer.setSize(window.innerWidth,window.innerHeight)
        renderer.shadowMap.enabled = true;
        let planeGeometry=new THREE.PlaneGeometry(100,100)
        let planeMaterial=new THREE.MeshStandardMaterial({color:0xffffff})
        let plane=new THREE.Mesh(planeGeometry,planeMaterial)
        plane.rotation.x=-0.5*Math.PI
        plane.position.x=-15
        plane.position.y=0
        plane.position.z=0
        plane.receiveShadow=true
        scene.add(plane)

        camera.position.x=20
        camera.position.y=15
        camera.position.z=20

        camera.lookAt(new THREE.Vector3())
        scene.add(camera)
        let radius=30
        let LightAngle=0
        let LightThete=Math.PI/180
        addGeometry()
        addLight()
        addGUI()
        renderScene()
        webglOutput.current.appendChild(renderer.domElement)
        window.addEventListener('resize',onResize,false)
        function onResize(){
            renderer.setSize(window.innerWidth,window.innerHeight)
            camera.aspect=(window.innerWidth/window.innerHeight)
            camera.updateProjectionMatrix()
        }
        function addGUI(){

            let gui=new dat.GUI({width:300})
            gui.open()
            param={
                '光源宽度':rectLight.width,
                '光源高度':rectLight.height,
                '光源颜色':rectLight.color.getHex(),
                '光源强度':rectLight.intensity,
                '环境光强度':ambientLight.intensity,
                '平滑度':material.roughness,
                '金属光泽':material.metalness
            }
            let lightFolder=gui.addFolder('光源设置')
            lightFolder.add(param,'光源宽度',0.1,50).onChange(function (val){
                rectLight.width=val
            })
            lightFolder.add(param,'光源高度',0.1,50).onChange(function (val){
                rectLight.height=val
            })
            lightFolder.addColor(param,'光源颜色').onChange(function (val){
                rectLight.color.setHex(val)
            })
            lightFolder.add(param,'光源强度',0.0,10).onChange(function (val){
                rectLight.intensity=val
            })
            lightFolder.add(param,'环境光强度',0.0,1).step(0.01).onChange(function (val){
                ambientLight.intensity=val
            })
            lightFolder.open()
            let standardFolder=gui.addFolder('材质设置')
            standardFolder.add(param,'平滑度',0.0,1.0).step(0.01).onChange(function (val){
                material.roughness=val
            })
            standardFolder.add(param,'金属光泽',0.0,1.0).step(0.01).onChange(function (val){
                material.metalness=val
            })
            standardFolder.open()

        }
        function addGeometry(){
            matStdParams={
                roughness:0.044676705160855,
                metalness:0.2,
                color:'#b33333'
            }
            let geometryArray=[]
            geometryArray.push(new THREE.BoxGeometry(4,4,4))
            geometryArray.push(new THREE.CylinderGeometry(1,4,4))
            geometryArray.push(new THREE.SphereGeometry(2))
            geometryArray.push(new THREE.IcosahedronGeometry(4))
            geometryArray.push(new THREE.OctahedronGeometry(3))
            geometryArray.push(new THREE.TetrahedronGeometry(3))
            geometryArray.push(new THREE.TorusGeometry(3,1,10,10))
            geometryArray.push(new THREE.TorusKnotGeometry(3,0.5,50,20))
            material=new THREE.MeshStandardMaterial(matStdParams)
            for(let i=0,l=geometryArray.length;i<l;i++){
                let mesh=new THREE.Mesh(geometryArray[i],material)
                mesh.castShadow=true
                mesh.receiveShadow=true
                mesh.position.x=-24+Math.floor(i/2)*10
                mesh.position.y=7
                mesh.position.z=(i%2===0)?-7:7
                scene.add(mesh)
            }
        }
        function addLight(){
            let ambiColor='#cccccc'
            ambientLight=new THREE.AmbientLight(ambiColor)
            scene.add(ambientLight)
            rectLight=new THREE.RectAreaLight('#ffffff',2,20,20)
            rectLight.position.set(-10,5,-10)
            rectLight.rotation.x=-Math.PI
            scene.add(rectLight)
        }

        function renderScene() {
            LightAngle+=1
            rectLight.rotation.y-=LightThete
            rectLight.position.x=radius*Math.sin(LightAngle/180*Math.PI)
            rectLight.position.z=radius*Math.cos(LightAngle/180*Math.PI)
            rectLight.updateMatrixWorld()
            camera.position.x=(radius+10)*Math.sin(LightAngle/180*Math.PI)
            camera.position.z=(radius+10)*Math.cos(LightAngle/180*Math.PI)
            camera.lookAt(new THREE.Vector3())
            camera.updateProjectionMatrix()
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

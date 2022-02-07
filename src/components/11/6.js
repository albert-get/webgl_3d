import {useEffect, useRef} from "react";
import * as THREE from 'three'
import * as dat from 'dat.gui'

export default function Index (){
    let webglOutput=useRef(null)
    const init=()=>{
        let scene=new THREE.Scene()
        let renderer=new THREE.WebGLRenderer()
        renderer.setClearColor(new THREE.Color(0x000000))
        renderer.setSize(window.innerWidth,window.innerHeight)
        let planeGeometry=new THREE.PlaneGeometry(60,20)
        let planeMaterial=new THREE.MeshBasicMaterial({color:0xffffff})
        let plane=new THREE.Mesh(planeGeometry,planeMaterial)
        plane.rotation.x=-0.5*Math.PI
        plane.position.x=-10
        plane.position.y=-5
        plane.position.z=-2
        scene.add(plane)
        let camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000)
        camera.position.x=30
        camera.position.y=30
        camera.position.z=30
        camera.lookAt(scene.position)
        let radius=50
        let pointLightAngle=0
        function addGeometry(){
            let geometryArray=[]
            geometryArray.push(new THREE.BoxGeometry(4,4,4))
            geometryArray.push(new THREE.CylinderGeometry(1,4,4))
            geometryArray.push(new THREE.SphereGeometry(2))
            geometryArray.push(new THREE.IcosahedronGeometry(4))
            geometryArray.push(new THREE.OctahedronGeometry(3))
            geometryArray.push(new THREE.TetrahedronGeometry(3))
            geometryArray.push(new THREE.TorusGeometry(3,1,10,10))
            geometryArray.push(new THREE.TorusKnotGeometry(3,0.5,50,20))
            geometryArray.push(new THREE.PlaneGeometry(4,2))
            geometryArray.push(new THREE.CircleGeometry(4,18))
            let material=new THREE.MeshPhongMaterial({color:0xff0000})
            for(let i=0,l=geometryArray.length;i<l;i++){
                let mesh=new THREE.Mesh(geometryArray[i],material)
                mesh.position.x=-24+Math.floor(i/2)*10
                mesh.position.y=0
                mesh.position.z=(i%2===0)?-4:4
                scene.add(mesh)
            }
        }
        addGeometry()
        let pointColor='#ccffcc'
        let pointLight=new THREE.PointLight(pointColor)
        function addLightAndGui(){

            pointLight.position.x=0
            pointLight.position.y=30
            pointLight.position.z=0
            scene.add(pointLight)
            let controls=new function (){
                this.pointColor=pointColor
                this.intensity=1
                this.distance=100
                this.invisible=false
            }
            let gui=new dat.GUI()
            gui.addColor(controls,'pointColor','点光源颜色').onChange(function (e){
                pointLight.color=new THREE.Color(e)
            })
            gui.add(controls,'intensity',0,3,'光照强度').onChange(function (e){
                pointLight.intensity=e
            })
            gui.add(controls,'distance',0,200,'照射的最大距离').onChange(function (e){
                pointLight.distance=e
            })
            gui.add(controls,'invisible','是否关闭光源').onChange(function (e){
                pointLight.visible=!e
            })
        }
        addLightAndGui()
        webglOutput.current.appendChild(renderer.domElement)
        function renderScene() {
            pointLightAngle+=1
            pointLight.position.x=radius*Math.sin(pointLightAngle/180*Math.PI)
            pointLight.position.z=radius*Math.cos(pointLightAngle/180*Math.PI)
            renderer.render(scene, camera);
            requestAnimationFrame(renderScene);
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

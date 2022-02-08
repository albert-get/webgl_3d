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
        let planeGeometry=new THREE.PlaneGeometry(60,40)
        let planeMaterial=new THREE.MeshPhongMaterial({color:0xffffff})
        let plane=new THREE.Mesh(planeGeometry,planeMaterial)
        plane.rotation.x=-0.5*Math.PI
        plane.position.x=-10
        plane.position.y=-5
        plane.position.z=-2
        scene.add(plane)

        camera.position.x=40
        camera.position.y=40
        camera.position.z=40
        camera.lookAt(scene.position)
        let radius=20
        let LightAngle=0
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
            let material=new THREE.MeshPhongMaterial({color:0xff0000})
            for(let i=0,l=geometryArray.length;i<l;i++){
                let mesh=new THREE.Mesh(geometryArray[i],material)
                mesh.position.x=-24+Math.floor(i/2)*10
                mesh.position.y=0
                mesh.position.z=(i%2===0)?-7:7
                scene.add(mesh)
            }
        }
        addGeometry()
        let spotLight
        function addLightAndGui(){
            let ambiColor='#383845'
            let ambientLight=new THREE.AmbientLight(ambiColor)
            scene.add(ambientLight)
            let spotLightColor='#8ba98b'
            spotLight=new THREE.SpotLight(spotLightColor)
            spotLight.position.set(0,40,0)
            spotLight.target=plane
            spotLight.castShadow=true
            spotLight.shadow.mapSize.width=2048
            spotLight.shadow.mapSize.height=2048
            spotLight.shadow.camera.near=0.1
            spotLight.shadow.camera.far=100
            spotLight.shadow.camera.fov=60
            spotLight.angle=0.4
            scene.add(spotLight)
            let cameraHelper=new THREE.CameraHelper(spotLight.shadow.camera)
            scene.add(cameraHelper)
            let controls=new function (){
                this.ambientColor=ambiColor
                this.spotLightColor=spotLightColor
                this.castShadow=true
                this.cameraHelperVisible=false
                this.angle=spotLight.angle
            }
            let gui=new dat.GUI()
            gui.addColor(controls, 'ambientColor','环境光颜色').onChange(function (e) {
                ambientLight.color = new THREE.Color(e);
            });
            gui.addColor(controls,'spotLightColor','聚光灯颜色').onChange(function (e){
                spotLight.color=new THREE.Color(e)
            })
            gui.add(controls,'castShadow','是否关闭阴影').onChange(function (e){
                spotLight.castShadow=e
            })
            gui.add(controls,'cameraHelperVisible','投影范围可见').onChange(function (e){
                cameraHelper.visible=e
            })
            gui.add(controls, 'angle',0,1,'光柱宽度').onChange(function (e) {
                spotLight.angle=e;
            });
        }
        addLightAndGui()
        webglOutput.current.appendChild(renderer.domElement)
        function renderScene() {
            LightAngle+=1
            spotLight.position.x=radius*Math.sin(LightAngle/180*Math.PI)
            spotLight.position.z=radius*Math.cos(LightAngle/180*Math.PI)

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

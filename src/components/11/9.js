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
        renderer.shadowMap.enabled = true;
        let planeGeometry=new THREE.PlaneGeometry(60,40)
        let planeMaterial=new THREE.MeshPhongMaterial({color:0xffffff})
        let plane=new THREE.Mesh(planeGeometry,planeMaterial)
        plane.rotation.x=-0.5*Math.PI
        plane.position.x=-10
        plane.position.y=-5
        plane.position.z=-2
        plane.receiveShadow=true
        scene.add(plane)

        camera.position.x=40
        camera.position.y=40
        camera.position.z=40
        camera.lookAt(scene.position)
        let radius=50
        let LightAngle=0
        let directionalLight
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
                mesh.castShadow=true
                mesh.position.x=-24+Math.floor(i/2)*10
                mesh.position.y=0
                mesh.position.z=(i%2===0)?-7:7
                scene.add(mesh)
            }
        }
        addGeometry()
        function addLightAndGui(){
            let ambiColor='#383845'
            let ambientLight=new THREE.AmbientLight(ambiColor)
            scene.add(ambientLight)
            let directionalLightColor='#ffffff'
            directionalLight=new THREE.DirectionalLight(directionalLightColor)
            directionalLight.position.set(0,60,0)
            directionalLight.target=plane
            directionalLight.castShadow=true
            directionalLight.shadow.mapSize.width=1024
            directionalLight.shadow.mapSize.height=1024
            directionalLight.shadow.camera.near=2
            directionalLight.shadow.camera.far=200
            directionalLight.shadow.camera.left=-50
            directionalLight.shadow.camera.right=50
            directionalLight.shadow.camera.top=50
            directionalLight.shadow.camera.bottom=-50
            directionalLight.intensity=0.6
            scene.add(directionalLight)
            let cameraHelper=new THREE.CameraHelper(directionalLight.shadow.camera)
            scene.add(cameraHelper)
            let controls=new function (){
                this.directColor=directionalLightColor
                this.castShadow=true
                this.cameraHelperVisible=false
            }
            let gui=new dat.GUI()
            gui.addColor(controls, 'directColor','平行光颜色').onChange(function (e) {
                directionalLight.color = new THREE.Color(e);
            });

            gui.add(controls,'castShadow','是否开启阴影').onChange(function (e){
                directionalLight.castShadow=e
            })
            gui.add(controls,'cameraHelperVisible','是否显示投影范围').onChange(function (e){
                cameraHelper.visible=e
            })

        }
        addLightAndGui()
        webglOutput.current.appendChild(renderer.domElement)
        function renderScene() {
            LightAngle+=1
            directionalLight.position.x=radius*Math.sin(LightAngle/180*Math.PI)
            directionalLight.position.z=radius*Math.cos(LightAngle/180*Math.PI)

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

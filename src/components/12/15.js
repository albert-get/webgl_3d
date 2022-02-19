import {useEffect, useRef, useState} from "react";
import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'
import * as dat from 'dat.gui'
import {Stats} from '../../utils/stats'
import '../../utils/OrbitControls'
import '../../utils/Water2'
import '../../utils/Refractor'
import '../../utils/Reflector'


export default function Index (){
    let webglOutput=useRef(null)

    let stats
    let container
    let water
    let scene
    let renderer
    let camera
    let dirLight
    let sphere
    let sphereAngle=0

    function init(){
        initScene()
        addMesh()
        setSkybox()
        addLight()
        addControls()
        addSupport()
        renderScene()

        webglOutput.current.appendChild(renderer.domElement)
        window.addEventListener('resize',onWindowResize,false)
    }
    function addSupport(){
        stats=new Stats()
        stats.domElement.style.position='fixed'
        webglOutput.current.appendChild(stats.domElement)
    }
    function addLight(){
        let target=new THREE.Object3D()
        // target.position=new THREE.Vector3(0,0,0)
        let pointColor='#bbbbbb'
        dirLight=new THREE.DirectionalLight(pointColor)
        dirLight.position.set(0,50,50)
        dirLight.castShadow=true
        dirLight.shadow.camera.near=0.1
        dirLight.shadow.camera.far=100
        dirLight.shadow.camera.top=200
        dirLight.shadow.camera.bottom=0
        dirLight.shadow.MapWidth=2048
        dirLight.shadow.MapHeight=2048

        let dirLight0=dirLight.clone()
        dirLight0.position.set(0,50,-50)
        scene.add(dirLight0)
        scene.add(dirLight)

        let ambientLight=new THREE.AmbientLight('#ffffff')
        scene.add(ambientLight)
    }
    function addControls(){
        let controls=new THREE.OrbitControls(camera,renderer.domElement)
        controls.enablePan=true
        controls.enableZoom=true
        controls.maxPolarAngle=Math.PI*4/9
    }
    function onWindowResize(){
        let width=window.innerWidth
        let height=window.innerHeight
        camera.aspect=width/height
        camera.updateProjectionMatrix()
        renderer.setSize(width,height)
    }
    function initScene(){
        scene=new THREE.Scene()
        renderer=new THREE.WebGLRenderer({antialias:true})
        renderer.setClearColor(new THREE.Color(0x979797))
        renderer.setSize(window.innerWidth,window.innerHeight)
        camera=new THREE.PerspectiveCamera(90,window.innerWidth/window.innerHeight,0.1,5000)
        camera.position.set(8,3,0)
        camera.lookAt(scene.position)
    }
    function addMesh(){
        let geometry=new THREE.IcosahedronGeometry(2,1)
        for(let i=0,j=geometry.faces.length;i<j;i++){
            geometry.faces[i].color.setHex(Math.random()*0xffffff)
        }
        let material=new THREE.MeshStandardMaterial({
            vertexColors:THREE.FaceColors,
            roughness:0.0,
            flatShading:true
        })
        sphere=new THREE.Mesh(geometry,material)
        scene.add(sphere)

        let groundGeometry=new THREE.PlaneBufferGeometry(20,20)
        let groundMaterial=new THREE.MeshStandardMaterial({roughness:0.8,metalness:0.4})
        let ground=new THREE.Mesh(groundGeometry,groundMaterial)
        ground.rotation.x=Math.PI*-0.5
        let textureLoader=new THREE.TextureLoader()
        textureLoader.load('/img/teture.png',function (map){
            map.wrapS=THREE.RepeatWrapping
            map.wrapT=THREE.RepeatWrapping
            map.anisotropy=16
            map.repeat.set(5,5)
            groundMaterial.map=map
            scene.add(ground)
        })
        let waterGeometry=new THREE.PlaneBufferGeometry(20,20)
        water=new THREE.Water(waterGeometry,{
            color:'#ffffff',
            scale:0,
            flowDirection:new THREE.Vector2(4,4),
            textureWidth:1024,
            textureHeight:1024,
            reflectivity:0.5
        })
        water.position.y=1
        water.rotation.x=Math.PI*-0.5
        scene.add(water)
    }
    function setSkybox(){
        let cubeTexTureLoader=new THREE.CubeTextureLoader()
        cubeTexTureLoader.setPath('/img/')
        let cubeMap=cubeTexTureLoader.load([
            'skycubemap_left.jpg', 'skycubemap_right.jpg',          //左面 右面
            'skycubemap_up.jpg', 'skycubemap_down.jpg',             //上面  下面
            'skycubemap_back.jpg', 'skycubemap_front.jpg',          //后面  前面
        ])
        let cubeShader=THREE.ShaderLib['cube']
        cubeShader.uniforms['tCube'].value=cubeMap

        let skyBoxMaterial=new THREE.ShaderMaterial({
            fragmentShader:cubeShader.fragmentShader,
            vertexShader:cubeShader.vertexShader,
            uniforms:cubeShader.uniforms,
            side:THREE.BackSide
        })
        let skyBoxGeometry=new THREE.BoxBufferGeometry(500,500,500)
        let skyBox=new THREE.Mesh(skyBoxGeometry,skyBoxMaterial)
        scene.add(skyBox)
    }
    function renderScene(){
        requestAnimationFrame(renderScene)
        render()
    }
    function render(){
        sphere.position.y=2+3*Math.cos(sphereAngle)
        sphereAngle+=0.02
        stats.update()
        renderer.render(scene,camera)
    }


    useEffect(()=>{
        init()
    },[])
    return (
        <div style={{width:'100vw'}}>
            <div ref={webglOutput}></div>

        </div>
    )
}

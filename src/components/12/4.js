import {useEffect, useRef, useState} from "react";
import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'
import * as dat from 'dat.gui'
import {Stats} from '../../utils/stats'
import Detector from '../../utils/Detector'
import '../../utils/OrbitControls'
import '../../utils/OBJLoader'
import '../../utils/DecalGeometry'


export default function Index (){
    let webglOutput=useRef(null)
    let statsDom=useRef(null)



    const webglRender=()=>{
        let pm
        let cft
        let ch
        let qt
        let yh
        let scene
        let renderer
        let camera
        let mesh
        let material
        let blendEquation=["AddEquation","SubtractEquation", "ReverseSubtractEquation","MinEquation","MaxEquation"]
        let src=[ "ZeroFactor", "OneFactor", "SrcColorFactor", "OneMinusSrcColorFactor", "SrcAlphaFactor", "OneMinusSrcAlphaFactor", "DstAlphaFactor", "OneMinusDstAlphaFactor", "DstColorFactor", "OneMinusDstColorFactor", "SrcAlphaSaturateFactor" ]
        let dst=[ "ZeroFactor", "OneFactor", "SrcColorFactor", "OneMinusSrcColorFactor", "SrcAlphaFactor", "OneMinusSrcAlphaFactor", "DstAlphaFactor", "OneMinusDstAlphaFactor", "DstColorFactor", "OneMinusDstColorFactor"]
        let blending='CustomBlending'
        function init(){
            initScene()
            addMesh()
            addLight()
            addGui()
            webglOutput.current.appendChild(renderer.domElement)
            window.addEventListener('resize',onWindowResize,false)
            window.addEventListener('mousedown',mouseMove)
            renderScene()
        }
        function addGui(){
            let gui=new dat.GUI({width:300})
            gui.open()
            let myTitle=gui.addFolder('混合设置')
            let controls=new function (e){
                this.srcType=src[4]
                this.dstType=dst[5]
                this.blendEquation=blendEquation[0]
            }
            let srcType=myTitle.add(controls,'srcType',src)
            let dstType=myTitle.add(controls,'dstType',dst)
            let blendEquationType=myTitle.add(controls,'blendEquation',blendEquation)
            blendEquationType.onChange(function (e){
                material.blednEqutaion=THREE[e]
            })
            srcType.onChange(function (e){
                material.blendSrc=THREE[e]
            })
            dstType.onChange(function (e){
                material.blendDst=THREE[e]
            })

        }
        function addMesh(){
            let texture1=new THREE.TextureLoader().load('/images/lgq.png')
            material=new THREE.MeshLambertMaterial({
                map:texture1,
                transparent:true,
                blending:THREE[blending],
                blendSrc:THREE[src[4]],
                blendDst:THREE[dst[5]],
                blendEquation:THREE.AddEquation,
                side:THREE.DoubleSide
            })
            let geometry=new THREE.PlaneGeometry(10,10)
            mesh=new THREE.Mesh(geometry,material)
            mesh.position.y=10
            mesh.position.z=20
            scene.add(mesh)

            let objLoader=new THREE.OBJLoader()
            objLoader.load('/object/pm.obj',function (object){
                object.receiveShadow=true
                pm=object.clone()
                pm.position.x=0
                pm.position.y=0
                pm.position.z=0
                scene.add(pm)
            })
            objLoader.load( '/object/cft.obj', function ( object ) {
                object.receiveShadow=true;//接受平面阴影
                cft=object.clone();
                cft.position.x=0;
                cft.position.y=0;
                cft.position.z=-10;
                scene.add(cft);
            });
            objLoader.load('/object/ch.obj',function (object){
                object.receiveShadow=true
                ch=object.clone()
                ch.position.x=0
                ch.position.y=0
                ch.position.z=10
                scene.add(ch)
            })
            objLoader.load('/object/qt.obj',function (object){
                object.receiveShadow=true
                qt=object.clone()
                qt.position.x=-10
                qt.position.y=0
                qt.position.z=0
                scene.add(qt)
            })
            objLoader.load('/object/yh.obj',function (object){
                object.receiveShadow=true
                yh=object.clone()
                yh.position.x=10
                yh.position.y=0
                yh.position.z=0
                scene.add(yh)
            })
        }
        function addLight(){
            let spotLight=new THREE.DirectionalLight(0x999999)
            spotLight.position.set(0,100,100)
            scene.add(spotLight)
            let ambientLight=new THREE.AmbientLight(0x404040)
            scene.add(ambientLight)
        }
        function mouseMove(event){
            if(!mesh) {
                return
            }else{
                let x,y
                if(event.changedTouches){
                    x=event.changedTouches[0].pageX
                    y=event.changedTouches[0].pageY
                }else{
                    x=event.clientX
                    y=event.clientY
                }
                let temp=2
                if(x<window.innerWidth/3){
                    mesh.position.x=mesh.position.x-temp
                }else if(x>window.innerWidth/3*2){
                    mesh.position.x=mesh.position.x+temp
                }else if(y>window.innerHeight/2){
                    mesh.position.y=mesh.position.y-temp
                }else if(y<window.innerHeight/2){
                    mesh.position.y=mesh.position.y+temp
                }
            }
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
            renderer=new THREE.WebGLRenderer({antialias:false})
            renderer.setClearColor(new THREE.Color(0x666666))
            renderer.setSize(window.innerWidth,window.innerHeight)
            camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000)
            camera.position.x=0
            camera.position.y=20
            camera.position.z=50
            camera.lookAt(scene.position)
        }
        function renderScene(){
            renderer.render(scene,camera)
            requestAnimationFrame(renderScene)
        }
        init()
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

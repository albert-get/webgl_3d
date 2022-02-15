import {useEffect, useRef, useState} from "react";
import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'
import * as dat from 'dat.gui'
import {Stats} from '../../utils/stats'
import Detector from '../../utils/Detector'
import '../../utils/OrbitControls'

const styleCanvas={
    position:'absolute',
    top:'10%',
    right:'80%',
    zIndex:6000
}

export default function Index (){
    let [active,setActive]=useState('0')
    let webglOutput=useRef(null)
    let statsDom=useRef(null)
    let canvas0=useRef(null)
    let canvas1=useRef(null)
    let canvas2=useRef(null)
    let canvas3=useRef(null)
    let canvas4=useRef(null)
    let canvas5=useRef(null)


    const webglRender=()=>{
        {
            if(!Detector.webgl){
                Detector.addGetWebGLMessage()
                return
            }
        }
        let drawingCanvas=[canvas0,canvas1,canvas2,canvas3,canvas4,canvas5]
        let canvas=new Array(6);
        let renderer=new THREE.WebGLRenderer({antialias:false})
        {//render
            renderer.setClearColor(new THREE.Color(0x000000))
            renderer.setSize(window.innerWidth,window.innerHeight)
            renderer.setPixelRatio(window.devicePixelRatio)
            webglOutput.current.appendChild(renderer.domElement)
        }
        let scene=new THREE.Scene()
        let camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000)

        {//camera
            // camera.position.x=0
            // camera.position.y=100
            camera.position.z=700

            // camera.lookAt(new THREE.Vector3(0, 0, 0))
        }


        {
            let spotLight=new THREE.SpotLight('#ffffff')
            spotLight.position.set(camera.position)
            scene.add(spotLight)
            let ambientLight=new THREE.AmbientLight(0x404040)
            scene.add(ambientLight)
        }
        let ray=new THREE.Raycaster();
        function getColor(){//随机颜色方法
            var colorElements = "0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f";
            var colorArray = colorElements.split(",");
            var color ="#";
            for(var i =0;i<6;i++){
                color+=colorArray[Math.floor(Math.random()*16)];
            }
            return color;
        }
        let mesh=new Array(6);
        let material=new Array(6);
        let rgbVector3Array=new Array(6);
        {
            let meshLength=200
            for(let i=0;i<material.length;i++){
                rgbVector3Array[i]=getColor()
                material[i]=new THREE.MeshBasicMaterial({color:rgbVector3Array[i]})
                material[i].side=THREE.DoubleSide
                mesh[i]=new THREE.Mesh(new THREE.PlaneGeometry(meshLength,meshLength))
            }
            mesh[0].position.x=0;
            mesh[0].position.y=0;
            mesh[0].position.z=0;
            mesh[0].name='0';
            scene.add(mesh[0]);
            mesh[1].position.x=0;
            mesh[1].position.y=0;
            mesh[1].position.z=-200;
            mesh[1].name='1';
            scene.add(mesh[1]);
            mesh[3].rotation.x=-Math.PI/2;
            mesh[3].position.x=0;
            mesh[3].position.y=100;
            mesh[3].position.z=-100;
            mesh[3].name='3';
            scene.add(mesh[3]);
            mesh[4].rotation.x=-Math.PI/2;
            mesh[4].position.x=0;
            mesh[4].position.y=-100;
            mesh[4].position.z=-100;
            mesh[4].name='4';
            scene.add(mesh[4]);
            mesh[5].rotation.y=-Math.PI/2;
            mesh[5].position.x=-100;
            mesh[5].position.y=0;
            mesh[5].position.z=-100;
            mesh[5].name='5';
            scene.add(mesh[5]);
            mesh[2].rotation.y=-Math.PI/2;
            mesh[2].position.x=100;
            mesh[2].position.y=0;
            mesh[2].position.z=-100;
            mesh[2].name='2';
            scene.add(mesh[2]);
        }


        let moveFlag=false
        let paint=false
        {
            let controls=new THREE.OrbitControls(camera,renderer.domElement)
            controls.addEventListener('change',renderScene)
            controls.minDistance=3
            controls.maxDistance=1000
            controls.enablePan=true
            controls.zoomSpeed=3.0
            controls.addEventListener('change',function (){
                moveFlag=true
            })
            controls.addEventListener('mousedown',function (){
                moveFlag=false
            },false)
            window.addEventListener('mouseup',function (){
                mouseCollect()
            })
            setTimeout(function (){
                window.addEventListener('mousemove',mouseMove)
                window.addEventListener('touchmove',mouseMove)
            },70)
        }
        let mousePoint=new THREE.Vector2();
        let startPosition=new THREE.Vector2()

        function mouseMove(event){
            if(!mesh){
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
                mousePoint.x=(x/window.innerWidth)*2-1
                mousePoint.y=-(y/window.innerHeight)*2+1
            }
        }
        function mouseCollect(){
            ray.setFromCamera(mousePoint,camera)
            let interSection=ray.intersectObjects(scene.children)
            if(interSection.length>0){
                let name=interSection[0].object.name
                setActive(name);
            }
        }
        {
            drawingCanvas.forEach((v)=>{
                v.current.addEventListener('mousedown',function (e){
                    paint=true
                    startPosition.set(e.offsetX,e.offsetY)
                })
                v.current.addEventListener('mousemove',function (e){
                    if(paint){
                        draw(canvas[active],e.offsetX,e.offsetY,active)
                    }
                })
                v.current.addEventListener('mouseleave',function (e){
                    paint=false
                })
            })
            for(let i=0;i<6;i++) {

                canvas[i]= drawingCanvas[i].current.getContext( '2d' );
                canvas[i].fillStyle = rgbVector3Array[i];
                //绘制填充矩形
                canvas[i].fillRect( 0, 0, 256, 256 );
                //将canvas的内容作为纹理添加到材质中
                material[i].map = new THREE.Texture( canvas[i] );
                //更新纹理图时自动获取canvas内容
                material[i].map.needsUpdate = true;
            }


        }
        function draw(drawContent,x,y,i){
            drawContent.moveTo(startPosition.x,startPosition.y)
            drawContent.strokeStyle='#000000'
            drawContent.lineTo(x,y)
            drawContent.stroke()
            startPosition.set(x,y)
            material[i].map.needsUpdate=true
        }


        {
            window.addEventListener('resize',onResize,false)
            function onResize(){
                renderer.setSize(window.innerWidth,window.innerHeight)
                camera.aspect=(window.innerWidth/window.innerHeight)
                camera.updateProjectionMatrix()
            }
        }
        let stats=new Stats()
        {
            stats.setMode(0)
            stats.domElement.style.position='absolute'
            stats.domElement.style.left='0px'
            stats.domElement.style.top='0px'
            statsDom.current.appendChild(stats.domElement)
        }
        let clock=new THREE.Clock()
        function renderScene() {

            stats.update()

            requestAnimationFrame(renderScene);
            renderer.render(scene, camera);
        }

        renderScene()
    }


    useEffect(()=>{
        webglRender()
    },[])
    return (
        <div>
            <div ref={statsDom}></div>
            <div ref={webglOutput}></div>
            <canvas ref={canvas0} style={{display:active==='0'?'block':'none',...styleCanvas}} height="256" width="256"></canvas>
            <canvas ref={canvas1} style={{display:active==='1'?'block':'none',...styleCanvas}} height="256" width="256"></canvas>
            <canvas ref={canvas2} style={{display:active==='2'?'block':'none',...styleCanvas}} height="256" width="256"></canvas>
            <canvas ref={canvas3} style={{display:active==='3'?'block':'none',...styleCanvas}} height="256" width="256"></canvas>
            <canvas ref={canvas4} style={{display:active==='4'?'block':'none',...styleCanvas}} height="256" width="256"></canvas>
            <canvas ref={canvas5} style={{display:active==='5'?'block':'none',...styleCanvas}} height="256" width="256"></canvas>
        </div>

    )
}

import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import {useEffect, useRef} from "react";
import {addMesh,createBoxSky} from '../../babylon/util'


function Index(){
    let canvas=useRef(null)

    function init(){
        let engine=new BABYLON.Engine(canvas.current,true)
        engine.setSize(window.innerWidth,window.innerHeight)
        function createScene(){
            let scene=new BABYLON.Scene(engine)
            let camera=new BABYLON.ArcRotateCamera('camera', 0, Math.PI/2, 12, new BABYLON.Vector3(0,0,0),scene)
            camera.attachControl(canvas.current,true)

            //顶点着色器
            BABYLON.Effect.ShadersStore["customVertexShader"]=

                "in vec3 position;\r\n"+
                "in vec3 normal;\r\n"+

                "uniform mat4 worldViewProjection;\r\n"+

                "out vec4 vPosition;\r\n"+
                "out vec3 vNormal;\r\n"+

                "void main() {\r\n"+

                "    vec4 p = vec4( position, 1. );\r\n"+

                "    vPosition = p;\r\n"+
                "    vNormal = normal;\r\n"+

                "    gl_Position = worldViewProjection * p;\r\n"+

                "}\r\n";

            //片元着色器
            BABYLON.Effect.ShadersStore["customFragmentShader"]=

                "precision highp float;\r\n"+

                "uniform mat4 worldView;\r\n"+

                "in vec4 vPosition;\r\n"+

                "in vec3 vNormal;\r\n"+

                "uniform sampler2D refSampler;\r\n"+

                "void main() {\r\n"+

                "    vec3 e = normalize( vec3( worldView * vPosition ) );\r\n"+
                "    vec3 n = normalize( worldView * vec4(vNormal, 0.0) ).xyz;\r\n"+

                "    vec3 r = reflect( e, n );\r\n"+
                "    float m = 2. * sqrt(\r\n"+
                "        pow( r.x, 2. ) +\r\n"+
                "        pow( r.y, 2. ) +\r\n"+
                "        pow( r.z + 1., 2. )\r\n"+
                "    );\r\n"+
                "    vec2 vN = r.xy / m + .5;\r\n"+

                "    vec3 base = texture2D( refSampler, vN).rgb;\r\n"+

                "    glFragColor = vec4( base, 1. );\r\n"+
                "}\r\n";

            let shaderMaterial=new BABYLON.ShaderMaterial('shader',scene,{
                vertex:'custom',
                fragment:'custom'
            },{
                attributes:['position','normal'],
                uniforms:['world','worldView','worldViewProjection','view','projection']
            })
            let refTexture=new BABYLON.Texture('/textures/ref.jpg',scene)
            refTexture.wrapU=BABYLON.Texture.CLAMP_ADDRESSMODE
            refTexture.wrapV=BABYLON.Texture.CLAMP_ADDRESSMODE

            shaderMaterial.setTexture('refSampler',refTexture)
            shaderMaterial.backFaceCulling=false
            let mesh=BABYLON.Mesh.CreateTorusKnot('mesh',2,0.5,128,64,2,3,scene)
            mesh.material=shaderMaterial
            let angle=0
            scene.onBeforeRenderObservable.add(()=>{
                angle+=0.01
                mesh.rotation.set(0,angle,0)
            })
            return scene
        }

        let scene=createScene()
        engine.runRenderLoop(function (){
            if(scene){
                scene.render()
            }
        })
        window.addEventListener('resize',function (){
            engine.setSize(window.innerWidth,window.innerHeight)
        })
    }
    useEffect(()=>{
        init()
    })

    return (
        <>
            <canvas ref={canvas}/>
        </>
    )
}

export default Index

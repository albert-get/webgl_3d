import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import {useEffect, useRef} from "react";
import 'babylonjs-loaders'


function Index(){
    let canvas=useRef(null)

    function init(){
        let engine=new BABYLON.Engine(canvas.current,true)
        engine.setSize(window.innerWidth,window.innerHeight)

        function createScene(){
            let scene=new BABYLON.Scene(engine)

            let light=new BABYLON.PointLight('light',new BABYLON.Vector3(-20,20,20),scene)
            light.diffuse=new BABYLON.Color3(1,Math.random(),Math.random())
            light.range=100
            light.intensity=1.1

            let camera=new BABYLON.ArcRotateCamera('camera',1,0.8,8,new BABYLON.Vector3.Zero(),scene)
            camera.attachControl(canvas.current,true)
            let spriteManagerTrees=new BABYLON.SpriteManager('treesManager','/textures/paln1.png',800,900,scene)
            for(let i=0;i<2000;i++){
                let tree=new BABYLON.Sprite('tree'+i,spriteManagerTrees)
                tree.position.x=Math.random()*100-50
                tree.position.z=Math.random()*100-50
                tree.isPickable=true
                if(Math.round(Math.random()*5)===0){
                    tree.angle=Math.PI*90/180
                    tree.position.y=-0.3
                }
            }

            let spriteManagerPlayer=new BABYLON.SpriteManager('playerManager','/textures/player.png',2,64,scene)
            let player=new BABYLON.Sprite('player',spriteManagerPlayer)
            player.playAnimation(0,40,true,100)
            player.position.y=-0.3
            player.size=0.3
            player.isPickable=true

            let player2=new BABYLON.Sprite('player2',spriteManagerPlayer)
            player2.stopAnimation()
            player2.cellIndex=3
            player2.position.y=-0.3
            player2.position.x=1
            player2.size=0.3
            player2.invertU=-1
            player2.isPickable=true

            spriteManagerTrees.isPickable=true
            spriteManagerPlayer.isPickable=true
            scene.onPointerDown=function (evt){
                let pickResult=scene.pickSprite(this.pointerX,this.pointerY)
                if(pickResult.hit){
                    pickResult.pickedSprite.angle+=0.5
                }
            }

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

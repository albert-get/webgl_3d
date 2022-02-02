import Script from 'next/script'
import {useEffect, useRef, useState} from "react";


export default function Index () {
    const canvas = useRef(null)

    useEffect(()=>{
        window.onload=()=>{
            let textId
            let textIdD
            let currText
            let textsize=new Array(3)
            let trIndex
            window.currentYAngle=0;
            window.currentXAngle=0;
            let incAngle=0.5;
            let lastClickX,lastClickY;
            let ismoved=false;
            document.onmousedown=event=>{
                lastClickX=event.clientX;
                lastClickY=event.clientY;
                ismoved=true;
            };
            document.onmouseup=event=>{
                ismoved=false;
                lastClickX=event.clientX;
                lastClickY=event.clientY;
            };
            document.onmousemove = event=>{
                let x=event.clientX,y=event.clientY;
                if(ismoved)
                {
                    window.currentYAngle=window.currentYAngle+(x-lastClickX)*incAngle;
                    window.currentXAngle=window.currentXAngle+(y-lastClickY)*incAngle;
                }
                lastClickX=x;
                lastClickY=y;
            };
            function start()
            {
                gl = canvas.current.getContext('webgl2', { antialias: true });
                if (!gl)
                {
                    alert("创建GLES上下文失败，不支持webGL2.0!");
                    return;
                }

                gl.viewport(0, 0, canvas.current.width, canvas.current.height);
                gl.clearColor(0.0,0.0,0.0,1.0);
                ms.setInitStack();
                ms.setCamera(0,0,-2,0,0,0,0,1,0);
                ms.setProjectFrustum(-1.5,1.5,-1,1,1,100);
                gl.enable(gl.DEPTH_TEST);
                let array =[{
                    type:'vertex',
                    text:`#version 300 es
uniform mat4 uMVPMatrix; //总变换矩阵
in vec3 aPosition;  //顶点位置
in vec2 aTexCoor;    //顶点纹理坐标
out vec2 vTextureCoord;  //用于传递给片元着色器的out变量
void main()
{
   gl_Position = uMVPMatrix * vec4(aPosition,1); //根据总变换矩阵计算此次绘制此顶点位置
   vTextureCoord = aTexCoor;//将接收的纹理坐标传递给片元着色器
}`
                },{
                    type: 'fragment',
                    text:`#version 300 es
precision mediump float;
uniform sampler2D sTexture;//纹理内容数据
in vec2 vTextureCoord; //接收从顶点着色器过来的参数
out vec4 fragColor;

void main()
{
   //进行纹理采样
   fragColor = texture(sTexture, vTextureCoord);
}`
                }];
                shaderProgArray[0] = loadShaderSerial(gl,array[0], array[1]);
                textsize[0]=new TextureRect(gl,shaderProgArray[0],1,1);
                textsize[1]=new TextureRect(gl,shaderProgArray[0],4,2);
                textsize[2]=new TextureRect(gl,shaderProgArray[0],4,4);
                trIndex=0;
                textId=loadImageTexture(gl, "/pic/robot.png",false);     //截取拉伸方式
                textIdD=loadImageTexture(gl, "/pic/robot.png",true);		//重复拉伸方式
                currText=textId;
                setTimeout(()=>{
                    render()
                },100)
            }
            function render(){
                drawFrame()
                requestAnimationFrame(render)
            }
            function drawFrame()
            {
                if(!textsize[trIndex])
                {
                    console.log("加载未完成！");//提示信息
                    return;
                }
                //清除着色缓冲与深度缓冲
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                //保护现场
                ms.pushMatrix();
                ms.scale(0.3,0.3,0.3)
                //绘制物体
                ms.translate(5.5,2,0);
                textsize[trIndex].drawSelf(ms,currText);
                //恢复现场
                ms.popMatrix();
            }

            start();

        }
    },[])

    return (
        <div>
            <>
                <Script type="text/javascript" src="/js/Matrix.js"></Script>
                <Script type="text/javascript" src="/js/MatrixState3.js"></Script>
                <Script type="text/javascript" src="/js/GLUtil3.js"></Script>
                <Script type="text/javascript" src="/js/FrameGlobalVar2.js"></Script>
                <Script type="text/javascript" src="/js/Onclick.js"></Script>
                <Script type="text/javascript" src="/js/TextureRect.js"></Script>
            </>
            <div>
                {/*拉&nbsp;&nbsp;&nbsp;伸&nbsp;&nbsp;&nbsp;方&nbsp;&nbsp;&nbsp;式：*/}
                {/*<input type="radio" name="stretching" value="EDGE" onClick="getRadio2()"*/}
                {/*       checked="checked"/>EDGE    &nbsp;&nbsp;&nbsp;*/}
                {/*<input type="radio" name="stretching" value="REPEAT" onClick="getRadio2()"/>REPEAT&nbsp;&nbsp;&nbsp;*/}
                {/*<br></br>*/}
                {/*纹理&nbsp;坐标&nbsp;尺寸：*/}
                {/*<input type="radio" name="size" value="1X1" onClick="getRadio1()"*/}
                {/*       checked="checked"/>1X1    &nbsp;&nbsp;&nbsp;*/}
                {/*<input type="radio" name="size" value="4X2" onClick="getRadio1()"/>4X2    &nbsp;&nbsp;&nbsp;*/}
                {/*<input type="radio" name="size" value="4X4" onClick="getRadio1()"/>4X4    &nbsp;&nbsp;&nbsp;*/}
                {/*<br></br>*/}
            </div>
            <canvas height="800" width="1200" ref={canvas}>
                若看到这个文字，说明浏览器不支持WebGL 2.0!
            </canvas>
        </div>
    )
}

import Script from 'next/script'
import {useEffect, useRef, useState} from "react";


export default function Index () {
    const canvas = useRef(null)

    useEffect(()=>{
        window.onload=()=>{
            let gl;
            let ms=new MatrixState();
            let cr;
            let shaderProgArray=new Array();
            window.shaderProgArray = shaderProgArray
            let currentYAngle=0;
            let currentXAngle=0;
            let incAngle=0.5;
            let lastClickX,lastClickY;
            let ismoved=false;
            document.onmousedown=event=>{
                let x=event.clientX;
                let y=event.clientY;
                let rect= (event.target||event.srcElement).getBoundingClientRect();
                if(rect.left<=x&&x<rect.right&&rect.top<=y&&y<rect.bottom)
                {
                    ismoved=true;
                    lastClickX=x;
                    lastClickY=y;
                }
            };
            document.onmouseup=event=>{ismoved=false;};
            document.onmousemove = event=>{
                let x=event.clientX,y=event.clientY;
                if(ismoved)
                {
                    currentYAngle=currentYAngle+(x-lastClickX)*incAngle;
                    currentXAngle=currentXAngle+(y-lastClickY)*incAngle;
                }
                lastClickX=x;
                lastClickY=y;
            };
            function start()
            {
                gl = canvas.current.getContext('webgl2', { antialias: true });
                window.gl= gl
                if (!gl)
                {
                    alert("创建GLES上下文失败，不支持webGL2.0!");
                    return;
                }
                gl.viewport(0, 0, canvas.current.width, canvas.current.height);
                gl.clearColor(0.0,0.0,0.0,1.0);
                ms.setInitStack();
                ms.setCamera(-16,8,45,0,0,0,0,1.0,0.0);
                ms.setProjectOrtho(-1.5,1.5,-1,1,1,100);
                gl.enable(gl.DEPTH_TEST);

                let array =[{
                    type:'vertex',
                    text:`#version 300 es
uniform mat4 uMVPMatrix; //总变换矩阵
uniform mat4 uMMatrix; //变换矩阵
in vec3 aPosition;  //顶点位置
in vec4 aColor;    //顶点颜色
out vec4 vColor;  //用于传递给片元着色器的颜色
out vec3 vPosition;//用于传递给片元着色器的顶点位置
void main(){
   gl_Position = uMVPMatrix * vec4(aPosition,1); //根据总变换矩阵计算此次绘制此顶点位置
   vColor = aColor;//将接收的颜色传递给片元着色器
   vPosition=(uMMatrix * vec4(aPosition,1)).xyz;//计算出此顶点变换后的位置传递给片元着色器
}`
                },{
                    type: 'fragment',
                    text:`#version 300 es
precision mediump float;
in  vec4 vColor; //接收从顶点着色器过来的参数
in vec3 vPosition;//接收从顶点着色器过来的顶点位置
out vec4 fragColor;//输出到的片元颜色
void main() {
   vec4 finalColor=vColor;
   mat4 mm=mat4(0.9396926,-0.34202012,0.0,0.0,  0.34202012,0.9396926,0.0,0.0,
   \t\t\t0.0,0.0,1.0,0.0,  0.0,0.0,0.0,1.0);//绕z轴转20度的旋转变换矩阵
   vec4 tPosition=mm*vec4(vPosition,1);//将顶点坐标绕z轴转20度
   if(mod(tPosition.x+100.0,0.4)>0.3) {//计算X方向在不在红光色带范围内
     finalColor=vec4(0.4,0.0,0.0,1.0)+finalColor;//若在给最终颜色加上淡红色
   }
   fragColor = finalColor;//给此片元颜色值
}`
                }];
                shaderProgArray[0] = loadShaderSerial(gl,array[0], array[1]);
                cr=new ColorRect(gl,shaderProgArray[0])
                setInterval(drawFrame,20);
            }
            function drawFrame()
            {
                if(!cr)
                {
                    console.log("加载未完成！");
                    return;
                }
                let mode ='2'
                if(mode==='1'){
                    ms.setProjectOrtho(-1.5*0.7,1.5*0.7,-1,1,1,100);
                }else if(mode ==='2'){
                    ms.setProjectOrtho(-1.5,1.5,-1,1,1,100);
                }
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                ms.pushMatrix();
                ms.translate(0.4,0.5,0);
                ms.rotate(currentYAngle,0,1,0);
                ms.rotate(currentXAngle,1,0,0);
                cr.drawSelf(ms,cr);
                ms.popMatrix();
                ms.pushMatrix();
                ms.translate(-0.8,0.5,0);
                drawSelfCube(ms,cr);
                ms.popMatrix();
            }

            start();

        }
    },[])

    return (
        <div>
            <>
                <Script type="text/javascript" src="/js/Matrix.js"></Script>
                <Script type="text/javascript" src="/js/MatrixState.js"></Script>
                <Script type="text/javascript" src="/js/GLUtil.js"></Script>
                <Script type="text/javascript" src="/js/Cube2.js"></Script>
                <Script type="text/javascript" src="/js/ColorRect.js"></Script>
            </>

            <canvas height="800" width="1200" ref={canvas}>
                若看到这个文字，说明浏览器不支持WebGL 2.0!
            </canvas>
        </div>
    )
}
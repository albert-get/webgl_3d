import Script from 'next/script'
import {useEffect, useRef, useState} from "react";


export default function Index () {
    const canvas = useRef(null)

    useEffect(()=>{
        window.onload=()=>{
            let gl;
            let ms=new MatrixState();
            let ball;
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
                if(event.target.tagName=="CANVAS")
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
                canvas.current.addEventListener('touchstart', function(event) {
                    event.preventDefault();// 阻止浏览器默认事件，重要
                    ismoved=true;
                });
                canvas.current.addEventListener('touchmove', function(event) {
                    event.preventDefault();// 阻止浏览器默认事件，重要
                    if(ismoved)
                    {
                        var touch = event.touches[0]; //获取第一个触点
                        var X = Number(touch.pageX);//页面触点X坐标
                        var Y = Number(touch.pageY);//页面触点X坐标
                        currentYAngle=currentYAngle+(X-lastClickX)*incAngle;
                        currentXAngle=currentXAngle+(Y-lastClickY)*incAngle;
                    }
                    lastClickX=X;
                    lastClickY=Y;
                });
                canvas.current.addEventListener('touchend', function(event) {
                    event.preventDefault();// 阻止浏览器默认事件，重要
                    ismoved=false;
                });
                gl.viewport(0, 0, canvas.current.width, canvas.current.height);
                gl.clearColor(0.0,0.0,0.0,1.0);
                ms.setInitStack();
                ms.setCamera(0,0,-2,0,0,0,0,1,0);
                ms.setProjectOrtho(-1.5,1.5,-1,1,1,100);
                gl.enable(gl.DEPTH_TEST);

                let array =[{
                    type:'vertex',
                    text:`#version 300 es
uniform mat4 uMVPMatrix; //总变换矩阵
in vec3 aPosition;  //顶点位置
out vec3 vPosition;//用于传递给片元着色器的顶点位置
out vec4 vAmbient;//用于传递给片元着色器的环境光分量
void main()
{
   //根据总变换矩阵计算此次绘制此顶点位置
   gl_Position = uMVPMatrix * vec4(aPosition,1);
   //将顶点的位置传给片元着色器
   vPosition = aPosition;//将原始顶点位置传递给片元着色器
   //将环境光强度传给片元着色器
   vAmbient = vec4(0.8,0.8,0.8,1.0);
}`
                },{
                    type: 'fragment',
                    text:`#version 300 es
precision mediump float;
uniform float uR;
in vec2 mcLongLat;//接收从顶点着色器过来的参数
in vec3 vPosition;//接收从顶点着色器过来的顶点位置
in vec4 vAmbient;//接收从顶点着色器过来的环境光强度
out vec4 fragColor;//输出的片元颜色
void main()
{
   vec3 color;
   float n = 8.0;//外接立方体每个坐标轴方向切分的份数
   float span = 2.0*uR/n;//每一份的尺寸（小方块的边长）
   int i = int((vPosition.x + uR)/span);//当前片元位置小方块的行数
   int j = int((vPosition.y + uR)/span);//当前片元位置小方块的层数
   int k = int((vPosition.z + uR)/span);//当前片元位置小方块的列数
    //计算当前片元行数、层数、列数的和并对2取模
   int whichColor = int(mod(float(i+j+k),2.0));
   if(whichColor==1) {//奇数时为红色
   \t\tcolor = vec3(0.678,0.231,0.129);//红色
   }
   else {//偶数时为白色
   \t\tcolor = vec3(1.0,1.0,1.0);//白色
   }
//最终颜色
   vec4 finalColor=vec4(color,1.0);
\t//根据环境光强度计算最终片元颜色值
   fragColor=finalColor*vAmbient;
}`
                }];
                shaderProgArray[0] = loadShaderSerial(gl,array[0], array[1]);
                ball=new Ball(gl,shaderProgArray[0],0.5)
                setInterval(drawFrame,20);
            }
            function drawFrame()
            {
                if(!ball)
                {
                    console.log("加载未完成！");
                    return;
                }

                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                ms.pushMatrix();
                ms.pushMatrix();
                ms.translate(-0.6,0,0);
                ms.rotate(currentYAngle,0,1,0);
                ms.rotate(currentXAngle,1,0,0);
                ball.drawSelf(ms);
                ms.popMatrix();
                ms.pushMatrix();
                ms.translate(0.6,0,0);
                ms.rotate(currentYAngle,0,1,0);
                ms.rotate(currentXAngle,1,0,0);
                ball.drawSelf(ms);
                ms.popMatrix();
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
                <Script type="text/javascript" src="/js/Ball.js"></Script>
            </>

            <canvas height="800" width="1200" ref={canvas}>
                若看到这个文字，说明浏览器不支持WebGL 2.0!
            </canvas>
        </div>
    )
}
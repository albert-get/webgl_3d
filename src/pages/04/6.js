import Script from 'next/script'
import {useEffect, useRef, useState} from "react";

let type='1'
let setType=(t)=>{
    type=t
}
export default function Index () {
    const canvas = useRef(null)

    useEffect(()=>{
        window.onload=()=>{
            let gl;
            let ms=new MatrixState();
            let ooTri;
            let shaderProgArray=new Array();
            window.shaderProgArray = shaderProgArray
            let currentYAngle=0;
            let currentXAngle=0;
            let currentMode ;
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
layout (location = 0) in vec3 aPosition;  //顶点位置
layout (location = 1) in vec4 aColor;    //顶点颜色
out  vec4 vColor;  //用于传递给片元着色器的变量

void main()
{
   gl_Position = uMVPMatrix * vec4(aPosition,1); //根据总变换矩阵计算此次绘制此顶点位置
   vColor = aColor;//将接收的颜色传递给片元着色器
}`
                },{
                    type: 'fragment',
                    text:`#version 300 es
precision mediump float;
in  vec4 vColor; //接收从顶点着色器过来的参数
out vec4 fragColor;//输出到的片元颜色
void main()
{
   fragColor = vColor;//给此片元颜色值
}`
                }];
                shaderProgArray[0] = loadShaderSerial(gl,array[0], array[1]);
                ooTri=new PointOrLines(gl,shaderProgArray[0]);
                setInterval(drawFrame,20);
            }
            function drawFrame()
            {
                if(!ooTri)
                {
                    console.log("加载未完成！");
                    return;
                }
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                currentMode=type;
                ms.pushMatrix();
                ms.translate(-1,0.3,0);
                ms.rotate(currentYAngle,0,1,0);
                ms.rotate(currentXAngle,1,0,0);
                ooTri.drawSelf(ms,currentMode);
                ms.popMatrix();
            }

            start();

        }
    },[])
    const changeMode =(e)=>{
        if(e.target.checked){
            setType(e.target.value)
        }
    }
    return (
        <div>
            <>
                <Script type="text/javascript" src="/js/Matrix.js"></Script>
                <Script type="text/javascript" src="/js/MatrixState.js"></Script>
                <Script type="text/javascript" src="/js/GLUtil.js"></Script>
                <Script type="text/javascript" src="/js/PointOrLines.js"></Script>
            </>
            <div>
                <input type="radio" name="userid" value="1"  onChange={changeMode} />GL_POINTS
                <input type="radio" name="userid" value="2"  onChange={changeMode}/>GL_LINES
                <input type="radio" name="userid" value="3"  onChange={changeMode}/>GL_LINE_STRIP
                <input type="radio" name="userid" value="4"  onChange={changeMode}/>GL_LINE_LOOP
            </div>
            <canvas height="800" width="1200" ref={canvas}>
                若看到这个文字，说明浏览器不支持WebGL 2.0!
            </canvas>
        </div>
    )
}
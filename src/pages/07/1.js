import Script from 'next/script'
import {useEffect, useRef, useState} from "react";


export default function Index () {
    const canvas = useRef(null)
    const webgl=()=>{
        let currentYAngle=0;
        let currentXAngle=0;
        let incAngle=0.5
        let lastClickX,lastClickY
        let ismoved=false
        document.onmousedown = function(event) {
            var x=event.clientX;
            var y=event.clientY;
            //如果鼠标在<canvas>内开始移动
            var rect= (event.target||event.srcElement).getBoundingClientRect();
            if(rect.left<=x&&x<rect.right&&rect.top<=y&&y<rect.bottom)
            {
                ismoved=true;
                lastClickX=x;
                lastClickY=y;
            }
        }
        //鼠标移动
        document.onmousemove = function(event) {
            var x=event.clientX,y=event.clientY;
            if(ismoved)
            {
                currentYAngle=currentYAngle+(x-lastClickX)*incAngle;
                currentXAngle=currentXAngle+(y-lastClickY)*incAngle;
            }
            lastClickX=x;
            lastClickY=y;
        }
        //鼠标抬起
        document.onmouseup = function(event) {
            ismoved=false;
        }
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
            ms.setCamera(0,60,50,0,0,0,0,1,0);
            ms.setProjectFrustum(-1.5,1.5,-1,1,3,200);
            gl.enable(gl.DEPTH_TEST);
            let array =[{
                type:'vertex',
                text:`#version 300 es
uniform mat4 uMVPMatrix; //总变换矩阵
in vec3 aPosition;  //从渲染管线接收的顶点位置
out vec3 vPosition;  //用于传递给片元着色器的顶点位置
void main() {
   gl_Position = uMVPMatrix * vec4(aPosition,1); //根据总变换矩阵计算此次绘制此顶点的位置
   vPosition=aPosition;//将顶点位置传递给片元着色器
}`
            },{
                type: 'fragment',
                text:`#version 300 es
precision mediump float;//给出默认浮点精度
in  vec3 vPosition;  //从顶点着色器接收的顶点位置
out vec4 fragColor;//最终片元颜色
void main() {
   vec4 bColor=vec4(0.678,0.231,0.129,1.0);//条纹的颜色(深红色)
   vec4 mColor=vec4(0.763,0.657,0.614,1.0);//间隔区域的颜色(淡红色)
   float y=vPosition.y;//提取顶点的y坐标值
   y=mod((y+100.0)*4.0,4.0);//折算出区间值
   if(y>1.8) {//当区间值大于指定值时
     fragColor = bColor;//设置片元颜色为条纹的颜色
   } else {//当区间值不大于指定值时
     fragColor = mColor;//设置片元颜色为间隔区域的颜色
}}`
            }];
            shaderProgArray[0] = loadShaderSerial(gl,array[0], array[1]);
            //着色器加载完了加载绘制者
            loadObjFile("/obj/ch.obj");

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
            //若还没有加载完则不绘制
            if(!ooTri) {return;}
            //清除着色缓冲与深度缓冲
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            //保护现场
            ms.pushMatrix();
            //执行绕Y轴旋转
            ms.rotate(currentYAngle,0,1,0);
            //执行绕X轴旋转
            ms.rotate(currentXAngle,1,0,0);
            //绘制茶壶
            ooTri.drawSelf(ms);
            //恢复现场
            ms.popMatrix();
        }

        start();

    }
    useEffect(()=>{
        setTimeout(()=>{
            webgl()
        },1000)
    },[])

    return (
        <div>
            <>
                <Script type="text/javascript" src="/js/Matrix.js"></Script>
                <Script type="text/javascript" src="/js/MatrixState3.js"></Script>
                <Script type="text/javascript" src="/js/FrameGlobalVar3.js"></Script>
                <Script type="text/javascript" src="/js/GLUtil6.js"></Script>

                <Script type="text/javascript" src="/js/LoadObjUtil.js"></Script>
                <Script type="text/javascript" src="/js/ObjObject.js"></Script>

                <Script type="text/javascript" src="/js/GlobalVar.js"></Script>
                <Script type="text/javascript" src="/js/loadBall.js"></Script>
            </>
            <div>
            </div>
            <canvas height="800" width="1200" ref={canvas}>
                若看到这个文字，说明浏览器不支持WebGL 2.0!
            </canvas>
        </div>
    )
}

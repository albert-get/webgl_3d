import Script from 'next/script'
import {useEffect, useRef} from "react";


export default function Index () {
    const canvas = useRef(null)
    useEffect(()=>{
        window.onload=()=>{
            let gl;
            let ms=new MatrixState();
            let ooTri=new Array(6);
            let shaderProgArray=new Array();
            window.shaderProgArray = shaderProgArray
            let currentYAngle=0;
            let currentXAngle=0;
            let incAngle=0.5;
            let lastClickX,lastClickY;
            let ismoved=false;
            document.onmousedown=ev => {
                let x=ev.clientX;
                let y=ev.clientY;
                let rect=(ev.target||ev.srcElement).getBoundingClientRect();
                if (rect.left<=x&&x<rect.right&&rect.top<=y&&y<rect.bottom){
                    ismoved=true;
                    lastClickX=x;
                    lastClickY=y;
                }
            }
            document.onmouseup=ev => {
                ismoved=false;
            }
            document.onmousemove=ev => {
                let x=ev.clientX;
                let y=ev.clientY;
                if (ismoved){
                    currentYAngle=currentYAngle+(x-lastClickX)*incAngle;
                    currentXAngle=currentXAngle+(y-lastClickY)*incAngle;
                }
                lastClickX=x;
                lastClickY=y;
            }
            function start(){
                gl=canvas.current.getContext('webgl2', { antialias: true });
                window.gl= gl
                if (!gl){
                    alert('创建GLES上下文失败，不支持webGL2.0!');
                    return;
                }
                gl.viewport(0,0,canvas.current.width,canvas.current.height);
                gl.clearColor(0.0,0.0,0.0,1.0);
                ms.setInitStack();
                ms.setCamera(0,0,-5,0,0,0,0,1,0);
                ms.setProjectFrustum(-1.5,1.5,-1,1,1,100);
                gl.enable(gl.DEPTH_TEST);
                let array =[{
                    type:'vertex',
                    text:`#version 300 es
uniform mat4 uMVPMatrix; //总变换矩阵
in vec3 aPosition;  //顶点位置
in vec4 aColor;    //顶点颜色
out  vec4 aaColor;  //用于传递给片元着色器的变量
void main()
{
   gl_Position = uMVPMatrix * vec4(aPosition,1); //根据总变换矩阵计算此次绘制此顶点位置
   aaColor = aColor;//将接收的颜色传递给片元着色器
}`
                },{
                    type: 'fragment',
                    text:`#version 300 es
precision mediump float;
in vec4 aaColor; //接收从顶点着色器过来的参数
out vec4 fragColor;//输出到的片元颜色
void main()
{
   fragColor = aaColor;//给此片元颜色值
}`
                }];
                shaderProgArray[0] = loadShaderSerial(gl,array[0], array[1]);
                for (let i=0;i<6;i++){
                    ooTri[i]=new SixPointedStar(gl,shaderProgArray[0],-0.6*i);
                }
                setInterval(drawFrame,20);
            }
            function drawFrame(){
                if (!ooTri[5]){
                    console.log("加载未完成！");
                    return;
                }
                gl.clear(gl.COLOR_BUFFER_BIT,gl.DEPTH_BUFFER_BIT);
                ms.pushMatrix();
                ms.rotate(currentYAngle,0,1,0);
                ms.rotate(currentXAngle,1,0,0);
                for (let i=0;i<6;i++){
                    ooTri[i].drawSelf(ms)
                }
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
                <Script type="text/javascript" src="/js/SixPointedStar.js"></Script>
            </>
            <canvas height="800" width="1200" ref={canvas}>
                若看到这个文字，说明浏览器不支持WebGL 2.0!
            </canvas>
        </div>
    )
}
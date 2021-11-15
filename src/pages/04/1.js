import {useEffect, useRef} from "react";
import Script from 'next/script'

export default function Index () {
    const canvas = useRef(null)
    useEffect(()=>{
        window.onload=()=>{
            //GLES上下文
            var gl;
            //变换矩阵管理类对象
            var ms=new MatrixState();
            //要绘制的3D物体
            var ooTri = new Array(6);
            //着色器程序列表，集中管理
            var shaderProgArray=new Array();
            window.shaderProgArray = shaderProgArray
            //绕y轴旋转角度
            var currentYAngle=0;
            //绕x轴旋转角度
            var currentXAngle=0;
            //旋转角度步长值
            var incAngle=0.5;
            //上次触控点X,Y坐标
            var lastClickX,lastClickY;
            var ismoved=false;//是否移动标志位
            //鼠标按下的监听
            document.onmousedown=function(event)
            {
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
            };
            //鼠标抬起的监听
            document.onmouseup=function(event){ismoved=false;};
            //鼠标移动时的监听
            document.onmousemove = function(event)
            {
                var x=event.clientX,y=event.clientY;
                if(ismoved)
                {
                    currentYAngle=currentYAngle+(x-lastClickX)*incAngle;
                    currentXAngle=currentXAngle+(y-lastClickY)*incAngle;
                }
                lastClickX=x;
                lastClickY=y;
            };
            //初始化的方法
            function start()
            {

                gl = canvas.current.getContext('webgl2', { antialias: true })
                window.gl= gl
                if (!gl) //若获取GL上下文失败
                {
                    alert("创建GLES上下文失败，不支持webGL2.0!");//显示错误提示信息
                    return;
                }

                //设置视口
                gl.viewport(0, 0, canvas.current.width, canvas.current.height);
                //设置屏幕背景色RGBA
                gl.clearColor(0.0,0.0,0.0,1.0);
                //初始化变换矩阵
                ms.setInitStack();
                //设置摄像机
                ms.setCamera(0,0,-5,0,0,0,0,1,0);
                //设置投影参数
                ms.setProjectOrtho(-1.5,1.5,-1,1,1,100);
                gl.enable(gl.DEPTH_TEST);//开启深度检测


                const array =[{
                    type: 'vertex',
                    text: `#version 300 es
uniform mat4 uMVPMatrix; //总变换矩阵
in vec3 aPosition;  //顶点位置
in vec4 aColor;    //顶点颜色
out  vec4 aaColor;  //用于传递给片元着色器的变量
void main()
{
   gl_Position = uMVPMatrix * vec4(aPosition,1); //根据总变换矩阵计算此次绘制此顶点位置
   aaColor = aColor;//将接收的颜色传递给片元着色器
}
                    `
                },{
                    type: 'fragment',
                    text: `#version 300 es
precision mediump float;
in vec4 aaColor; //接收从顶点着色器过来的参数
out vec4 fragColor;//输出到的片元颜色
void main()
{
   fragColor = aaColor;//给此片元颜色值
}
                    `
                }]
                shaderProgArray[0] = loadShaderSerial(gl,array[0], array[1]);
                for(var i=0;i<6;i++)
                {
                    ooTri[i]=new SixPointedStar(gl,shaderProgArray[0],-0.3*i);//创建三角形绘制对象
                }
                //定时绘制画面
                setInterval(drawFrame,16.6);
            }
            function drawFrame()
            {
                if(!ooTri[5])
                {
                    console.log("加载未完成！");//提示信息
                    return;
                }
                //清除着色缓冲与深度缓冲
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                //保护现场
                ms.pushMatrix();
                //执行平移
                ms.translate(0,0,0);
                //执行绕Y轴旋转
                ms.rotate(currentYAngle,0,1,0);
                //执行绕X轴旋转
                ms.rotate(currentXAngle,-1,0,0);
                //绘制物体
                for(var j=0;j<6;j++)
                {
                    ooTri[j].drawSelf(ms);
                }
                //恢复现场
                ms.popMatrix();
            }
            start()
        }

    },[])
    return (
        <div>
            <>
                <Script type="text/javascript" src="/js/GLUtil.js"></Script>
                <Script type="text/javascript" src="/js/Matrix.js"></Script>
                <Script type="text/javascript" src="/js/MatrixState.js"></Script>
                <Script type="text/javascript" src="/js/Triangle.js"></Script>
                <Script type="text/javascript" src="/js/SixPointedStar.js"></Script>
            </>
            <canvas ref={canvas} id="canvasOne"  height="800" width="1200">若看到这个文字，说明浏览器不支持WebGL!</canvas>
        </div>
    )
}
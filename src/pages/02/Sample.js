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
            var ooTri;
            //着色器程序列表，集中管理
            var shaderProgArray=new Array();
            window.shaderProgArray = shaderProgArray
            var currentAngle;
            var incAngle;
            //初始化的方法
            function start()
            {
//            //获取3D Canvas
//            var canvas = document.getElementById('bncanvas');
//            //获取GL上下文
//            gl = canvas.getContext('webgl2', { antialias: true });
//             gl = initWebGLCanvas("bncanvas");
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
//            ms.setCamera(0,0,17,0,0,0,0,1,0);//立方体摄像机位置
                ms.setCamera(0,0,-5,0,0,0,0,1,0);//三角形摄像机位置
                //设置投影参数
                ms.setProjectFrustum(-1.5,1.5,-1,1,1,100);
                gl.enable(gl.DEPTH_TEST);//开启深度检测

                //加载着色器程序
                // loadShaderFile("/2_1/shader/vtrtex.bns",0);
                // loadShaderFile("/2_1/shader/fragment.bns",0);

                const array =[{
                    type: 'vertex',
                    text: `#version 300 es
uniform mat4 uMVPMatrix; //总变换矩阵
layout (location = 0) in vec3 aPosition;  //顶点位置
layout (location = 1) in vec4 aColor;    //顶点颜色
out  vec4 vColor;  //用于传递给片元着色器的变量

void main()
{
   gl_Position = uMVPMatrix * vec4(aPosition,1); //根据总变换矩阵计算此次绘制此顶点位置
   vColor = aColor;//将接收的颜色传递给片元着色器
}
                    `
                },{
                    type: 'fragment',
                    text: `#version 300 es
precision mediump float;
in  vec4 vColor; //接收从顶点着色器过来的参数
out vec4 fragColor;//输出到的片元颜色
void main()
{
   fragColor = vColor;//给此片元颜色值
}
                    `
                }]
                shaderProgArray[0] = loadShaderSerial(gl,array[0], array[1]);
                if(shaderProgArray[0])//如果着色器已加载完毕
                {
                    ooTri=new Triangle(gl,shaderProgArray[0]);//创建三角形绘制对象
                }
                else
                {
                    //延长时间，时间太短了还是没有加载完成
                    setTimeout(function(){ooTri=new Triangle(gl,shaderProgArray[0]);},900);
                    //休息90ms后再执行
                }
                //初始化旋转角度
                currentAngle = 0;
                //初始化角度步进值
                incAngle = 0.4;
                //定时绘制画面
                setInterval(drawFrame,16.6);
            }
            //绘制一帧画面的方法
            function drawFrame()
            {
                if(!ooTri){
                    console.log("加载未完成！");//提示信息
                    return;
                }
                //清除着色缓冲与深度缓冲
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                //保护现场
                ms.pushMatrix();
                //执行旋转,即按哪个轴旋转
                ms.rotate(currentAngle,0,1,0);
                //绘制物体
                ooTri.drawSelf(ms);
                //恢复现场
                ms.popMatrix();
                //修改旋转角度
                currentAngle += incAngle;
                if (currentAngle > 360)//保证角度范围不超过360
                    currentAngle -= 360;
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
                <Script type="text/javascript" src="/js/LoadShaderUtil.js"></Script>
            </>
            <canvas ref={canvas} id="canvasOne" width="500" height="300">若看到这个文字，说明浏览器不支持WebGL!</canvas>
        </div>
    )
}
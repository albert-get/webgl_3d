import Script from 'next/script'
import {useEffect, useRef, useState} from "react";


export default function Index () {
    const canvas = useRef(null)
    const canvas1 = useRef(null)

    const webgl=()=>{
        var mon;
        var cx=0;//摄像机x坐标
        var cz=12;//摄像机z坐标
        var tx=0;//观察目标点x坐标
        var tz=0;//观察目标点z坐标
        var direction=0;//视线方向
        var Offset=15;
        var DEGREE_SPAN=(3.0/180.0*Math.PI);//摄像机每次转动的角度
        var mPreviousY;//上次的触控位置Y坐标
        var mPreviousX;//上次的触控位置X坐标
        var down=false;//是否移动标志位
        function dianji()
        {
            document.onmousedown = function(event)
            {	down=true;//按下鼠标
                mPreviousX=event.pageX;//获取触控点x坐标
                mPreviousY=event.pageY;//获取触控点y坐标
            }
            document.onmousemove = function(event)//鼠标移动
            {
                if(down)
                {
                    if(mPreviousX<canvas.current.width/2&&mPreviousY<canvas.current.height/2)
                    {Offset=Offset-0.5;}
                    else if(mPreviousX>canvas.current.width/2&&mPreviousY<canvas.current.height/2)
                    {Offset=Offset+0.5;}
                    else if(mPreviousX<canvas.current.width/2&&mPreviousY>canvas.current.height/2)
                    {direction=direction+DEGREE_SPAN;}
                    else if(mPreviousX>canvas.current.width/2&&mPreviousY>canvas.current.height/2)
                    {direction=direction-DEGREE_SPAN;}
                }
            }
            document.onmouseup = function(event)
            {
                down=false;//抬起鼠标
                mPreviousX=event.pageX;//获取触控点x坐标
                mPreviousY=event.pageY;//获取触控点y坐标
            }

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
            ms.setCamera(0,0,-2,0,0,0,0,1,0);
            ms.setProjectFrustum(-1.5,1.5,-1,1,1,100);
            gl.enable(gl.DEPTH_TEST);
            let array =[{
                type:'vertex',
                text:`#version 300 es
uniform mat4 uMVPMatrix; //总变换矩阵
in vec3 aPosition;  //顶点位置
in vec2 aTexCoor;    //顶点纹理坐标
out vec2 vTextureCoord;  //用于传递给片元着色器的变量
void main()
{
   gl_Position = uMVPMatrix * vec4(aPosition,1); //根据总变换矩阵计算此次绘制此顶点位置
   vTextureCoord = aTexCoor;//将接收的纹理坐标传递给片元着色器
}`
            },{
                type: 'fragment',
                text:`#version 300 es
precision mediump float;
in vec2 vTextureCoord; //接收从顶点着色器过来的参数
uniform sampler2D sTexture;//纹理内容数据
out vec4 fragColor;//输出到的片元颜色
void main()
{
   //给此片元从纹理中采样出颜色值
   fragColor = texture(sTexture, vTextureCoord);
}`
            }];

            shaderProgArray[0] = loadShaderSerial(gl,array[0], array[1]);

            mon=new Momnet(gl,shaderProgArray[0]);
            loadImageTexture(gl, "/pic/grass.png","grass");

            dianji();
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
            dianji();
            tx=cx-Math.sin(direction)*Offset;//观察目标点x坐标
            tz=cz-Math.cos(direction)*Offset;//观察目标点z坐标
            ms.setCamera(cx,3,cz,tx,1,tz,0,1,0);
            if(!mon||result.length==0)
            {
                console.log("加载未完成！");//提示信息
                return;
            }
            //清除着色缓冲与深度缓冲
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            //保护现场
            ms.pushMatrix();
            //绘制物体
            mon.drawSelf(ms,texMap["grass"]);
            //恢复现场
            ms.popMatrix();
        }

        let canvas2d=()=>{
            var LAND_HIGHEST=20//20;
            var LAND_HIGH_ADJUST=-2;
            window.result = new Array();
            var result1 = new Array();
            var j=0;
            var k=0;
            var ctx1 = canvas1.current.getContext('2d');
            var image = new Image();
            image.src = "/pic/land.png"
            window.colsPlusOne=null;
            window.rowsPlusOne=null;
            image.onload=function(){
                colsPlusOne=64;//image.width
                rowsPlusOne=64;//image.height
                ctx1.drawImage(image,0,0,colsPlusOne,rowsPlusOne);
                getgray();
                for(var i=0;i<rowsPlusOne;i++)
                {	result[i] = new Array();
                    for(var j=0;j<colsPlusOne;j++)
                    {result[i][j]=result1[k++];}
                }
                start();
                ctx1.clearRect(0,0,colsPlusOne,rowsPlusOne);
                return result;
            }
            function getgray(){
                var imageData = ctx1.getImageData(0,0,colsPlusOne,rowsPlusOne);
                for(var i=0;i<imageData.data.length;i+=4){
                    var r=imageData.data[i];
                    var g=imageData.data[i+1];
                    var b=imageData.data[i+2];
                    imageData.data[i+3]=255;
                    var h=(r+g+b)/3;
                    result1[j]=h*LAND_HIGHEST/255+LAND_HIGH_ADJUST;
                    j++;
                }
            }
        }
        canvas2d()
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
                <Script type="text/javascript" src="/js/GLUtil10.js"></Script>
                <Script type="text/javascript" src="/js/FrameGlobalVar2.js"></Script>
                <Script type="text/javascript" src="/js/Momnet.js"></Script>
            </>
            <canvas height="800" width="1200" ref={canvas}>
                若看到这个文字，说明浏览器不支持WebGL 2.0!
            </canvas>
            <canvas ref={canvas1} width="600" height="600">
                您的浏览器不支持canvas标签
            </canvas>
        </div>
    )
}

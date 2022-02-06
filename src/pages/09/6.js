import Script from 'next/script'
import {useEffect, useRef, useState} from "react";


export default function Index () {
    const canvas = useRef(null)

    const webgl=()=>{
        var tr;
        var cx=0;
        var cy=2;
        var cz=24;
        var  TOUCH_SCALE_FACTOR = 180/320;//角度缩放比例
        var cr=24;//摄像机半径
        var cAngle=0;
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
                var x=event.pageX,y=event.pageY;
                if(down)
                {

                    var dy = y - mPreviousY;//计算触控笔Y位移
                    var dx = x - mPreviousX;//计算触控笔X位移
                    cAngle+=dx * TOUCH_SCALE_FACTOR;
                    cx=Math.sin(Math.PI/180*cAngle)*cr;
                    cz=Math.cos(Math.PI/180*cAngle)*cr;
                    cy+=dy/10.0;
                }
                mPreviousY = y;//记录触控笔位置
                mPreviousX = x;//记录触控笔位置
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
            gl.clearColor(1.0,1.0,1.0,1.0);
            ms.setInitStack();
            ms.setProjectFrustum(-1.5,1.5,-1,1,1,1000);
            gl.enable(gl.DEPTH_TEST);
            gl.enable(gl.CULL_FACE);
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
   fragColor=texture(sTexture, vTextureCoord);
}`
            }];

            shaderProgArray[0] = loadShaderSerial(gl,array[0], array[1]);

            tr=new Tree(gl,shaderProgArray[0]);
            loadImageTexture(gl, "/pic/skycubemap_back.jpg","back");
            loadImageTexture(gl, "/pic/skycubemap_down.jpg","down");
            loadImageTexture(gl, "/pic/skycubemap_front.jpg","front");
            loadImageTexture(gl, "/pic/skycubemap_left.jpg","left");
            loadImageTexture(gl, "/pic/skycubemap_right.jpg","right");
            loadImageTexture(gl, "/pic/skycubemap_up.jpg","up");
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

            ms.setCamera(cx,cy,cz,0,0,0,0,1.0,0.0);
            if(!tr)
            {
                console.log("加载未完成！");//提示信息
                return;
            }
            //清除着色缓冲与深度缓冲
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            //保护现场
            ms.pushMatrix();
            ms.translate(0, 0, -28+0.35);
            tr.drawSelf(ms,texMap['back']);
            ms.popMatrix();
            //绘制天空盒前面
            ms.pushMatrix();
            ms.translate(0, 0, 28-0.35);
            ms.rotate(180, 0, 1, 0);
            tr.drawSelf(ms,texMap['front']);
            ms.popMatrix();
            //绘制天空盒左面
            ms.pushMatrix();
            ms.translate(-28+0.35, 0, 0);
            ms.rotate(90, 0, 1, 0);
            tr.drawSelf(ms,texMap['left']);
            ms.popMatrix();
            //绘制天空盒右面
            ms.pushMatrix();
            ms.translate(28-0.35, 0, 0);
            ms.rotate(-90, 0, 1, 0);
            tr.drawSelf(ms,texMap['right']);
            ms.popMatrix();
            //绘制天空盒下面
            ms.pushMatrix();
            ms.translate(0, -28+0.35, 0);
            ms.rotate(-90, 1, 0, 0);
            tr.drawSelf(ms,texMap['down']);
            ms.popMatrix();
            //绘制天空盒上面
            ms.pushMatrix();
            ms.translate(0, 28-0.35, 0);
            ms.rotate(90, 1, 0, 0);
            tr.drawSelf(ms,texMap['up']);
            ms.popMatrix();
        }

        start()
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
                <Script type="text/javascript" src="/js/Tree2.js"></Script>
            </>
            <canvas height="800" width="1200" ref={canvas}>
                若看到这个文字，说明浏览器不支持WebGL 2.0!
            </canvas>

        </div>
    )
}

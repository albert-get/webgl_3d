import Script from 'next/script'
import {useEffect, useRef, useState} from "react";


export default function Index () {
    const canvas = useRef(null)
    const webgl=()=>{
        window.alist=new Array()
        window.tr=null
        window.tree=null
        window.cx=0
        window.cz=15
        window.tg=null
        window.tfd=null
        window.x=5
        window.z=10
        window.yAngle=0
        window.direction=0
        window.Offset=15
        window.DEGREE_SPAN=(3.0/180.0*Math.PI);//摄像机每次转动的角度
        window.currentYAngle=0
        window.currentXAngle=0
        window.incAngle=0.5
        window.mPreviousY=null;//上次的触控位置Y坐标
        window.mPreviousX=null;//上次的触控位置X坐标
        window.down=false;//是否移动标志位
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
            gl.clearColor(1.0,1.0,1.0,1.0);
            ms.setInitStack();
            ms.setProjectFrustum(-1.5,1.5,-1,1,1,1000);
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
   fragColor=texture(sTexture, vTextureCoord);
}`
            }];

            shaderProgArray[0] = loadShaderSerial(gl,array[0], array[1]);

            tr=new Desert(gl,shaderProgArray[0]);//创建三角形绘制对象
            tfd=new Tree(gl,shaderProgArray[0]);
            tg=new TreeGroup(gl);

            loadImageTexture(gl, "/pic/desert.bmp","desert");
            loadImageTexture(gl, "/pic/tree.png","tree");

            setTimeout(()=>{
                render()
            },100)
            dianji();
        }
        function render(){
            drawFrame()
            requestAnimationFrame(render)
        }
        function drawFrame()
        {

            cx=(Math.sin(direction)*Offset);//观察目标点x坐标
            cz=(Math.cos(direction)*Offset);//观察目标点z坐标
            tg.calculateBillboardDirection();
            ms.setCamera(cx,1,cz,0,0,0,0,1,0);
            if((!tg)||(!tfd)||(!tr)||(!texMap["tree"]))
            {
                console.log("加载未完成！");//提示信息
                return;
            }
            if(alist.length==0)
            {tg.treeGroupadd(gl);}

            //重写的比较两个树木离摄像机距离的方法
            alist.sort(function compare(a,b)
            {
                var xs=a.x-cx;
                var zs=a.z-cz;
                var xo=b.x-cx;
                var zo=b.z-cz;
                var disA=Math.sqrt(xs*xs+zs*zs);
                var disB=Math.sqrt(xo*xo+zo*zo);
                return ((disA-disB)==0)?0:((disA-disB)>0)?-1:1;
            });
            //清除着色缓冲与深度缓冲
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            //保护现场
            ms.pushMatrix();
            ms.scale(0.3,0.3,0.3)
            //绘制物体
            tr.drawSelf(ms,texMap["desert"]);
            //恢复现场
            ms.popMatrix();
            gl.enable(gl.BLEND);
            //设置混合因子
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            ms.pushMatrix();
            ms.translate(0, -0.1, 0);
            tg.drawSelf(ms,texMap["tree"]);
            ms.popMatrix();
            //关闭混合
            gl.disable(gl.BLEND);
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
                <Script type="text/javascript" src="/js/GLUtil10.js"></Script>
                <Script type="text/javascript" src="/js/FrameGlobalVar2.js"></Script>
                <Script type="text/javascript" src="/js/Desert.js"></Script>
                <Script type="text/javascript" src="/js/Tree.js"></Script>
                <Script type="text/javascript" src="/js/TreeGroup.js"></Script>
                <Script type="text/javascript" src="/js/SingleTree.js"></Script>
            </>
            <canvas height="800" width="1200" ref={canvas}>
                若看到这个文字，说明浏览器不支持WebGL 2.0!
            </canvas>
        </div>
    )
}

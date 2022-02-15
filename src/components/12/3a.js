import {useEffect, useRef, useState} from "react";
import * as THREE from 'three'
import TWEEN, {update} from '@tweenjs/tween.js'
import * as dat from 'dat.gui'
import {Stats} from '../../utils/stats'
import Detector from '../../utils/Detector'
import '../../utils/OrbitControls'
import '../../utils/OBJLoader'
import PHOTONS from '../../photons'


export default function Index (){
    let webglOutput=useRef(null)

    const webglRender=()=>{
        var ParticleSystemIDs = Object.freeze( //声明各粒子系统的id
            {
                Smoke1: 1,                     //基本类型烟雾id
                Smoke2: 2,                     //动画类型烟雾id
                Flame: 3,					   //火焰id
                FlameEmbers: 4				   //火星id
            } );

        var ParticleEnvironmentIDs = Object.freeze( //声明粒子环境id
            {
                Campfire: 1
            } );

        var rendererContainer;				  	//声明渲染器
        var screenWidth, screenHeight;			//声明屏幕的宽度和高度变量
        var pointLight, ambientLight;			//声明点光源和环境光对象
        var particleSystems, loadingManager;	//声明粒子系统对象，加载管理对象
        var scene, camera, renderer, controls, stats, clock;//声明场景、摄像机、控制器等对象
        var currentEnvironmentID;				//声明当前环境id
        var smokeActive, smokeType;				//声明烟雾存活状态和类型
        var particleSystemsParent;				//声明粒子系统父类对象

        //添加监听，网页加载完毕后调用初始化场景方法
        window.addEventListener( "load", function load( event ) {

            window.removeEventListener( "load", load, false );
            init();								//初始化场景

        }, false );

        //初始化场景方法
        function init() {

            clock = new THREE.Clock();

            getScreenDimensions();				//获得场景规模方法

            initScene();						//初始化场景方法
            initGUI();							//初始化gui方法
            initListeners();					//初始化监听方法

            initLights();						//初始化灯光方法
            PHOTONS.Util.initializeLoadingManager();//初始化加载管理器
            initSceneGeometry( function() {		//初始化场景的几何信息

                initParticleSystems();			//初始化粒子系统
                startParticleSystemEnvironment ( ParticleEnvironmentIDs.Campfire );//粒子系统开启方法
                initRenderer();					//初始化渲染器
                initControls();					//初始化控制器
                initStats();					//初始化stats
                animate();						//更新动画方法

            } );

        }

        function initParticleSystems() {		//初始化粒子系统方法

            particleSystems = {};				//粒子系统对象
            initializeFlameSystem();			//初始化火焰粒子系统方法
            initializeSmokeSystem();			//初始化烟雾粒子系统方法

        }

        //初始化烟雾粒子系统方法
        function initializeSmokeSystem() {

            var _TPSV = PHOTONS.SingularVector;		//单个顶点

            smokeType = ParticleSystemIDs.Smoke1;	//设置烟雾类型

            var textureLoader = new THREE.TextureLoader();//创建纹理加载对象

            var smoke1Atlas = new PHOTONS.Atlas( textureLoader.load( '/texture/campfire/smokeparticle.png' ), true );
            //创建网格集
            var smoke2Atlas = PHOTONS.Atlas.createGridAtlas( textureLoader.load( '/texture/campfire/smokeparticles.png' ), 0.0, 1.0, 1.0, 0.0, 4.0, 4.0, false, true );

            var altVertexShader = [

                PHOTONS.ParticleSystem.Shader.VertexVars,
                "varying vec4 vPosition;",

                PHOTONS.ParticleSystem.Shader.ParticleVertexQuadPositionFunction,

                "void main()",
                "{",
                "vColor = customColor;",
                "vUV = uv;",
                "vec4 quadPos = getQuadPosition();",
                "vPosition = viewMatrix * quadPos;",
                "gl_Position = projectionMatrix * vPosition;",
                "}"

            ].join( "\n" );

            var altFragmentShader = [

                PHOTONS.ParticleSystem.Shader.FragmentVars,
                "varying vec4 vPosition;",

                THREE.ShaderChunk[ "common" ],
                THREE.ShaderChunk[ "bsdfs" ],
                THREE.ShaderChunk[ "lights_pars" ],

                "void main()",
                "{",

                "vec4 textureColor = texture2D( texture, vUV );",
                "vec4 viewPosition = -vPosition;",
                "vec3 outgoingLight = vec3( 0.0 );",
                "vec4 diffuseColor = vColor * textureColor;",

                "vec3 totalDiffuseLight = vec3( 0.0 );",

                "#if NUM_POINT_LIGHTS > 0",
                "for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {",
                "vec3 lightColor = pointLights[ i ].color;",
                "vec3 lightPosition = pointLights[ i ].position;",
                "vec3 lVector = lightPosition + viewPosition.xyz;",
                "vec3 lightDir = normalize( lVector );",
                "float attenuation = punctualLightIntensityToIrradianceFactor( length( lVector ), pointLights[ i ].distance, pointLights[ i ].decay );",
                "totalDiffuseLight += lightColor * attenuation;",
                "}",
                "#endif",

                "gl_FragColor = diffuseColor * vec4( totalDiffuseLight, 1.0 );",
                "}"

            ].join( "\n" );

            var customUniforms1 = THREE.UniformsUtils.merge( [ THREE.UniformsLib[ 'lights' ], THREE.UniformsLib[ 'ambient' ] ] );

            //创建烟雾材质
            var altMaterial1 = PHOTONS.ParticleSystem.createMaterial( altVertexShader, altFragmentShader, customUniforms1 );
            altMaterial1.lights = true;
            altMaterial1.blending = THREE.CustomBlending;					//设置材质的属性
            altMaterial1.blendSrc = THREE.SrcAlphaFactor;
            altMaterial1.blendDst = THREE.OneMinusSrcAlphaFactor;
            altMaterial1.blendEquation = THREE.AddEquation;
            altMaterial1.uniforms.texture.value = smoke1Atlas.getTexture();	//设置材质纹理

            var altMaterial2 = altMaterial1.clone();						//克隆烟雾材质
            altMaterial2.uniforms.texture.value = smoke2Atlas.getTexture();

            var particleSystemParams1 = {									//设置烟雾系统1的属性

                material: altMaterial1,										//将烟雾材质赋给烟雾1系统材质
                zSort: true,
                particleAtlas : smoke1Atlas,
                particleReleaseRate : 100,									//设置粒子的重复率
                particleLifeSpan : 3.0,										//设置粒子存活时间
                lifespan : 0												//存活时间

            };

            var particleSystemParams2 = {									//设置烟雾系统2的属性

                material: altMaterial2,
                zSort: true,
                particleAtlas : smoke2Atlas,
                particleReleaseRate : 100,
                particleLifeSpan : 3.0,
                lifespan : 0

            };

            var particleSystem1 = new PHOTONS.ParticleSystem();				//创建粒子系统对象
            particleSystem1.initialize( camera, scene, particleSystemParams1 );//初始化粒子系统

            var particleSystem2 = new PHOTONS.ParticleSystem();
            particleSystem2.initialize( camera, scene, particleSystemParams2 );

            var positionModifier = new PHOTONS.RandomModifier(
                {
                    offset: new THREE.Vector3( 0, 0, 0 ),
                    range: new THREE.Vector3( 10, 0, 10 ),
                    rangeEdgeClamp: false,
                    rangeType: PHOTONS.RangeType.Sphere
                } );

            var velocityModifier = new PHOTONS.RandomModifier(
                {
                    offset: new THREE.Vector3( 0, 75, 0 ),
                    range: new THREE.Vector3( 5, 30, 5 ),
                    rangeEdgeClamp: false,
                    rangeType: PHOTONS.RangeType.Sphere
                } );

            var accelerationModifier = new PHOTONS.RandomModifier(
                {
                    offset: new THREE.Vector3( 0, - 22, 0 ),
                    range: new THREE.Vector3( 35, 20, 35 ),
                    rangeEdgeClamp: false,
                    rangeType: PHOTONS.RangeType.Cube
                } );

            var rotationModifier = new PHOTONS.RandomModifier(
                {
                    offset: new PHOTONS.SingularVector( 0 ),
                    range: new PHOTONS.SingularVector( 360 )
                } );

            var rotationalSpeedModifier = new PHOTONS.RandomModifier(
                {
                    offset: new PHOTONS.SingularVector( 50 ),
                    range: new PHOTONS.SingularVector( 400 )
                } );

            var atlas1Modifier = new PHOTONS.EvenIntervalIndexModifier ( 1 );

            var sizeModifier = new PHOTONS.FrameSetModifier(
                new PHOTONS.FrameSet(
                    [ 0, 3 ],
                    [ new THREE.Vector2( 10, 10 ),
                        new THREE.Vector2( 40, 40 ) ],
                    false )
            );

            var alphaModifier = new PHOTONS.FrameSetModifier(
                new PHOTONS.FrameSet(
                    [ 0, 1.0, 2.0, 3.0 ],
                    [ new _TPSV( 0.0 ), new _TPSV( 0.1 ), new _TPSV( 0.075 ), new _TPSV( 0.0 ) ],
                    true
                ) );

            var colorModifier = new PHOTONS.FrameSetModifier(
                new PHOTONS.FrameSet(
                    [ 0.0, 1.5, 3 ],
                    [ new THREE.Vector3( 0.1, 0.1, 0.1 ),
                        new THREE.Vector3( 0.35, 0.35, 0.35 ),
                        new THREE.Vector3( 0.7, 0.7, 0.7 ) ],
                    false )
            );

            particleSystem1.bindInitializer( 'position', positionModifier );
            particleSystem1.bindInitializer( 'velocity', velocityModifier );
            particleSystem1.bindInitializer( 'acceleration', accelerationModifier );
            particleSystem1.bindInitializer( 'rotation', rotationModifier );
            particleSystem1.bindInitializer( 'rotationalSpeed', rotationalSpeedModifier );
            particleSystem1.bindModifier( 'atlas', atlas1Modifier );
            particleSystem1.bindModifier( 'size', sizeModifier );
            particleSystem1.bindModifier( 'alpha', alphaModifier );
            particleSystem1.bindModifier( 'color', colorModifier );

            var atlas2Initializer = new PHOTONS.RandomModifier( {
                offset: 8,
                range: 8,
                rangeEdgeClamp: false,
                rangeType: PHOTONS.RangeType.Default
            } );

            var atlas2Modifier = new PHOTONS.LoopingTimeIntervalIndexModifier( 16, 5 );

            particleSystem2.bindInitializer( 'atlas', atlas2Initializer );
            particleSystem2.bindInitializer( 'position', positionModifier );
            particleSystem2.bindInitializer( 'velocity', velocityModifier );
            particleSystem2.bindInitializer( 'acceleration', accelerationModifier );
            particleSystem2.bindInitializer( 'rotation', rotationModifier );
            particleSystem2.bindInitializer( 'rotationalSpeed', rotationalSpeedModifier );
            particleSystem2.bindModifier( 'atlas', atlas2Modifier );
            particleSystem2.bindModifier( 'size', sizeModifier );
            particleSystem2.bindModifier( 'alpha', alphaModifier );
            particleSystem2.bindModifier( 'color', colorModifier );

            particleSystems[ ParticleSystemIDs.Smoke1 ] = particleSystem1;
            particleSystems[ ParticleSystemIDs.Smoke2 ] = particleSystem2;

            particleSystemsParent.add ( particleSystems[ ParticleSystemIDs.Smoke1 ] );
            particleSystemsParent.add ( particleSystems[ ParticleSystemIDs.Smoke2 ] );



        }

        function initializeFlameSystem() {//初始化火焰粒子系统方法

            var _TPSV = PHOTONS.SingularVector;//单个顶点

            var textureLoader = new THREE.TextureLoader();//创建纹理加载对象

            // ---------------------
            // 火焰粒子系统
            // ---------------------

            var flameMaterial = PHOTONS.ParticleSystem.createMaterial();//创建火焰材质
            flameMaterial.blending = THREE.AdditiveBlending;//设置材质的混合为blending

            var particleSystemParams = {					//设置粒子系统的属性

                material: flameMaterial,					//将火焰材质赋给粒子系统的材质
                //创建网格集
                particleAtlas : PHOTONS.Atlas.createGridAtlas( textureLoader.load( '/texture/campfire/fireloop3.jpg' ), 0.0, 1.0, 1.0, 0.0, 8.0, 8.0, false, true ),
                particleReleaseRate : 3,					//设置粒子重复率
                particleLifeSpan : 3,						//设置粒子存活时间
                lifespan : 0.0								//存活时间

            };
            var particleSystem = new PHOTONS.ParticleSystem();//创建粒子系统对象
            particleSystem.initialize( camera, scene, particleSystemParams );//初始化粒子系统
            //绑定粒子系统纹理集修改器
            particleSystem.bindModifier( "atlas", new PHOTONS.EvenIntervalIndexModifier ( 64 ) );
            //绑定粒子系统尺寸修改器
            particleSystem.bindModifier( "size", new PHOTONS.FrameSetModifier(
                new PHOTONS.FrameSet(//设置帧数范围内粒子的尺寸
                    [ 0, 3 ],
                    [ new THREE.Vector3( 20, 25 ),
                        new THREE.Vector3( 20, 25 ) ],
                    false )
            ) );
            //在一系列关键帧中创建不透明调节器
            particleSystem.bindModifier( "alpha", new PHOTONS.FrameSetModifier(
                new PHOTONS.FrameSet(
                    [ 0, 0.2, 1.2, 2.0, 3 ],
                    [ new _TPSV( 0 ), new _TPSV( .3 ), new _TPSV( 1 ), new _TPSV( 1 ), new _TPSV( 0 ) ],
                    true )
            ) );
            //在一系列关键帧中创建颜色调节器
            particleSystem.bindModifier( "color", new PHOTONS.FrameSetModifier(
                new PHOTONS.FrameSet(
                    [ 0, 3 ],
                    [ new THREE.Vector3( 1.4, 1.4, 1.4 ),
                        new THREE.Vector3( 1.4, 1.4, 1.4 ) ],
                    false )
            ) );
            //在一系列关键帧中创建粒子位置调节器
            particleSystem.bindInitializer( 'position', new PHOTONS.RandomModifier(
                {
                    offset: new THREE.Vector3( 0, 0, 0 ),
                    range: new THREE.Vector3( 0, 0, 0 ),
                    rangeEdgeClamp: false,
                    rangeType: PHOTONS.RangeType.Sphere
                } ) );
            //在一系列关键帧中创建速度调节器
            particleSystem.bindInitializer( 'velocity', new PHOTONS.RandomModifier(
                {
                    offset: new THREE.Vector3( 0, 25, 0 ),
                    range: new THREE.Vector3( 10, 2, 10 ),//10.2.10
                    rangeEdgeClamp: false,
                    rangeType: PHOTONS.RangeType.Sphere
                } ) );
            //将设置好的属性赋给火焰
            particleSystems[ ParticleSystemIDs.Flame ] = particleSystem;
            //向粒子系统父类对象中添加火焰粒子系统
            particleSystemsParent.add ( particleSystems[ ParticleSystemIDs.Flame ] );


            // ---------------------
            // 火焰余烬粒子系统
            // ---------------------

            var emberMaterial = PHOTONS.ParticleSystem.createMaterial();
            emberMaterial.blending = THREE.AdditiveBlending;

            particleSystemParams = {

                material: emberMaterial,
                particleAtlas : new PHOTONS.Atlas( textureLoader.load( '/texture/campfire/Puff.png' ), true ),
                particleReleaseRate : 18,
                particleLifeSpan : 3,
                lifespan : 0

            };
            particleSystem = new PHOTONS.ParticleSystem();
            particleSystem.initialize( camera, scene, particleSystemParams );

            particleSystem.bindModifier( "atlas", new PHOTONS.EvenIntervalIndexModifier ( 1 ) );

            particleSystem.bindModifier( 'size', new PHOTONS.RandomModifier(
                {
                    offset: new THREE.Vector3( .25, .25, 0.0 ),
                    range: new THREE.Vector3( 0.05, 0.05, 0.0 ),
                    rangeEdgeClamp: false,
                    rangeType: PHOTONS.RangeType.Sphere,
                    runOnce: true
                } ) );

            particleSystem.bindModifier( "alpha", new PHOTONS.FrameSetModifier(
                new PHOTONS.FrameSet(
                    [ 0, 0.2, 1.2, 2.0, 3 ],
                    [ new _TPSV( 0 ), new _TPSV( 1 ), new _TPSV( 1 ), new _TPSV( 1 ), new _TPSV( 0 ) ],
                    true )
            ) );

            particleSystem.bindModifier( "color", new PHOTONS.FrameSetModifier(
                new PHOTONS.FrameSet(
                    [ 0, 2, 3 ],
                    [ new THREE.Vector3( 1.3, 1.3, 0 ),
                        new THREE.Vector3( .75, .4, .4 ),
                        new THREE.Vector3( .6, .6, .6 ) ],
                    false )
            ) );

            particleSystem.bindInitializer( 'position', new PHOTONS.RandomModifier(
                {
                    offset: new THREE.Vector3( 0, 7, 0 ),
                    range: new THREE.Vector3( 3, 0, 3 ),
                    rangeEdgeClamp: false,
                    rangeType: PHOTONS.RangeType.Sphere
                } ) );

            particleSystem.bindInitializer( 'velocity', new PHOTONS.RandomModifier(
                {
                    offset: new THREE.Vector3( 0, 25, 0 ),
                    range: new THREE.Vector3( 15, 25, 15 ),
                    rangeEdgeClamp: true,
                    rangeType: PHOTONS.RangeType.Sphere
                } ) );

            particleSystem.bindModifier( 'acceleration', new PHOTONS.RandomModifier(
                {
                    offset: new THREE.Vector3( 0, 15, 0 ),
                    range: new THREE.Vector3( 180, 280, 180 ),
                    rangeEdgeClamp: true,
                    rangeType: PHOTONS.RangeType.Sphere
                } ) );

            particleSystems[ ParticleSystemIDs.FlameEmbers ] = particleSystem;
            particleSystemsParent.add( particleSystems[ ParticleSystemIDs.FlameEmbers ] );

        }

        //初始化GUI
        function initGUI() {

            let gui = new dat.GUI();
            let parameters =
                {
                    smoke: function() {						//烟雾监听

                        smokeActive = ! smokeActive;		//烟雾标志位置反
                        updateSmokeType();					//更新烟雾类型

                    },
                    smokeType: ParticleSystemIDs.Smoke1,	//烟雾类型默认为第一个
                    embers: function() {					//火星监听

                        toggleParticleSystem( ParticleSystemIDs.FlameEmbers );//粒子系统开关方法

                    },
                    flame: function() {						//火焰监听

                        toggleParticleSystem( ParticleSystemIDs.Flame );//粒子系统开关方法

                    },
                };

            //添加烟雾类型列表
            gui.add( parameters, 'smokeType', { 基础类型: ParticleSystemIDs.Smoke1, 动画类型: ParticleSystemIDs.Smoke2 } ).name( "烟雾类型" ).onChange( function() {

                smokeType = parameters.smokeType;
                updateSmokeType();

            } );
            gui.add( parameters, 'smoke' ).name( "烟雾开关" );
            gui.add( parameters, 'embers' ).name( "火星开关" );
            gui.add( parameters, 'flame' ).name( "火焰开关" );
            gui.open();

            gui.domElement.parentNode.style.zIndex = 100;//返回 <li> 元素的 parentNode（父节点）

        }

        //屏幕自适应
        function initListeners() {

            window.addEventListener( 'resize', onWindowResize, false );//屏幕自适应

        }

        function initRenderer() {							//初始化渲染器

            renderer = new THREE.WebGLRenderer();			//创建WebGL渲染器
            renderer.setSize( screenWidth, screenHeight );	//设置渲染器尺寸
            renderer.setClearColor( 0x000000 );				//设置背景颜色
            renderer.shadowMap.enabled = true;				//渲染器开启阴影图
            renderer.shadowMap.type = THREE.BasicShadowMap;	//设置shadowMap样式为基础类型
            rendererContainer = document.getElementById( 'renderingContainer' );//获得渲染器id
            webglOutput.current.appendChild( renderer.domElement );//添加子节点

        }

        function initLights() {									//初始化灯光

            ambientLight = new THREE.AmbientLight( 0x101010 );	//创建环境光
            scene.add( ambientLight );							//向场景中添加环境光

            pointLight = new THREE.PointLight( 0xffffff, 2, 1000, 1 );//创建点光源
            pointLight.position.set( 0, 40, 0 );				//设置点光源位置
            pointLight.castShadow = true;						//启用光线投影
            pointLight.shadow.camera.near = 1;					//摄像机投影近平面距离
            pointLight.shadow.camera.far = 1000;				//摄像机投影远平面距离
            pointLight.shadow.mapSize.width = 4096;
            pointLight.shadow.mapSize.height = 2048;
            pointLight.shadow.bias = 0.01;						//设置阴影贴图偏移量
            scene.add( pointLight );							//向场景中添加点光源

        }

        //加载场景物体
        function initSceneGeometry( onFinished ) {

            var loadedCount = 0;
            var targetLoadCount = 3;
            var onFinishedCalled = false;					//物体加载完成标志位

            var textureLoader = new THREE.TextureLoader();	//纹理加载器

            function incrementAndCheckLoadComplete() {

                loadedCount ++;

                if ( ! onFinishedCalled && loadedCount >= targetLoadCount && onFinished ) {

                    onFinishedCalled = true;
                    onFinished();

                }

            }

            // ---------------------
            // 创建地面
            // ---------------------

            var groundTexture = new textureLoader.load( '/texture/campfire/grass1.jpg' );//加载纹理
            groundTexture.wrapS = THREE.RepeatWrapping;						//纹理S坐标设置为重复拉伸
            groundTexture.wrapT = THREE.RepeatWrapping;						//纹理T坐标设置为重复拉伸
            groundTexture.repeat.set( 10, 10 );								//纹理重复拉伸10次

            var groundMaterial = new THREE.MeshLambertMaterial( {			//设置材质

                color: 0xffffff,
                map: groundTexture,
                vertexColors: THREE.NoColors,
                side: THREE.BackSide

            } );

            var groundGeometry = new THREE.PlaneGeometry( 1000, 1000, 30, 30 );//设置平面
            var groundMesh = new THREE.Mesh( groundGeometry, groundMaterial );
            groundMesh.position.y = 0;
            groundMesh.rotation.x = Math.PI / 2.0;
            groundMesh.receiveShadow = true;
            scene.add( groundMesh );

            // ---------------------
            // 加载营火
            // ---------------------
            var campFireMaterial = new THREE.MeshLambertMaterial( {

                color: 0xffffff,
                vertexColors: THREE.NoColors,
                side: THREE.FrontSide

            } );

            //加载营地篝火模型
            PHOTONS.Util.loadObj( '/models/campfire/campfire.obj', '/models/campfire/campfire_texture.png', campFireMaterial,

                function( mesh ) {

                    mesh.castShadow = true; //启用光线投影
                    mesh.receiveShadow = false;

                },
                function( object ) {

                    object.position.set( 0, 0, 0 );
                    object.scale.set( 7, 7, 7 );
                    scene.add( object );

                    incrementAndCheckLoadComplete();

                }

            );

            // ---------------------
            // load rocks加载岩石
            // ---------------------

            var rockMaterial = new THREE.MeshLambertMaterial( {

                color: 0xffffff,
                vertexColors: THREE.NoColors,
                side: THREE.FrontSide

            } );

            PHOTONS.Util.loadObj( '/models/campfire/brownrock.obj', '/models/campfire/brownrock.png', rockMaterial,

                function( mesh ) {

                    mesh.castShadow = true;
                    mesh.receiveShadow = true;

                },
                function( object ) {

                    object.position.set( - 70, 0, 0 );
                    object.scale.set( .55, .55, .55 );
                    scene.add( object );

                    var rockObject2 = object.clone();
                    rockObject2.rotation.z = - Math.PI / 4;
                    rockObject2.rotation.x = Math.PI / 2;
                    rockObject2.position.set( - 55, - 1, 25 );
                    rockObject2.scale.set( .35, .35, .35 );
                    scene.add( rockObject2 );

                    var rockObject3 = object.clone();
                    rockObject3.rotation.z = Math.PI / 4;
                    rockObject3.rotation.x = Math.PI / 2;
                    rockObject3.position.set( 45, 10, 45 );
                    rockObject3.scale.set( .65, .65, .85 );
                    scene.add( rockObject3 );

                    incrementAndCheckLoadComplete();

                }

            );

            // ---------------------
            // load trees加载树木
            // ---------------------

            var treeMaterial = new THREE.MeshLambertMaterial( {

                color: 0xffffff,
                vertexColors: THREE.NoColors,
                side: THREE.FrontSide

            } );

            PHOTONS.Util.loadObj( '/models/campfire/pinetree_doubleface.obj', '/models/campfire/pinetree.jpg', treeMaterial,

                function( mesh ) {

                    mesh.castShadow = true;
                    mesh.receiveShadow = true;

                },
                function( object ) {

                    object.rotation.z = Math.PI / 64;
                    object.rotation.x = Math.PI / 64;
                    object.position.set( - 20, - 1, - 80 );
                    object.scale.set( 1.155, 1.155, 1.155 );
                    scene.add( object );

                    var treeObject2 = object.clone();
                    treeObject2.rotation.z = - Math.PI / 16;
                    treeObject2.rotation.x = Math.PI / 32;
                    treeObject2.position.set( 15, - 1, - 80 );
                    treeObject2.scale.set( .855, .855, .855 );
                    scene.add( treeObject2 );

                    incrementAndCheckLoadComplete();

                }

            );

            particleSystemsParent = new THREE.Object3D();
            particleSystemsParent.position.set( 0, 0, 0 );
            particleSystemsParent.matrixAutoUpdate = true;
            scene.add( particleSystemsParent );

        }

        //初始化场景
        function initScene() {

            scene = new THREE.Scene();

            camera = new THREE.PerspectiveCamera( 45, 1.0, 2, 2000 );
            scene.add( camera );
            resetCamera(); //重置摄像机

        }

        function initStats() {

            stats = new Stats();
            stats.domElement.style.position = 'absolute';
            stats.domElement.style.top = '0px';
            stats.domElement.style.zIndex = 100;
            webglOutput.current.appendChild( stats.domElement );

        }

        function initControls() {

            controls = new THREE.OrbitControls( camera, renderer.domElement );
            controls.target.set( 0, 0, 0 );
            controls.update();

        }

        //屏幕自适应方法
        function onWindowResize() {

            getScreenDimensions();							//获取屏幕尺寸
            renderer.setSize( screenWidth, screenHeight );	//设置场景大小
            resetCamera();									//重置摄像机

        }

        var flickerPointLight = ( function() {

            var lastAdjuster;

            return function flickerPointLight() {

                var adjuster = ( Math.random() - 0.5 );

                if ( lastAdjuster ) {

                    let diff = ( adjuster - lastAdjuster ) * .2;
                    adjuster = lastAdjuster + diff;

                }

                var intensity = 4;
                intensity += adjuster * 4;
                pointLight.intensity = intensity;

                pointLight.distance = adjuster * 50 + 200;
                pointLight.decay = adjuster * 5 + 3;

                lastAdjuster = adjuster;

            }

        } )();

        function updateSmokeType() {//更新烟雾类型

            particleSystems[ ParticleSystemIDs.Smoke1 ].deactivate();//关闭烟雾1
            particleSystems[ ParticleSystemIDs.Smoke2 ].deactivate();//关闭烟雾2

            if ( smokeActive ) {									//如果烟雾标志位为true

                particleSystems[ smokeType ].activate();			//开启相应类型的烟雾

            }

        }

        function toggleParticleSystem( id ) {						//粒子系统开关方法

            if ( particleSystems[ id ] ) {							//如果粒子系统对象不为空

                if ( particleSystems[ id ].isActive ) {				//粒子系统播放标志位为false

                    particleSystems[ id ].deactivate();				//关闭该粒子系统

                } else {

                    particleSystems[ id ].activate();				//播放粒子系统

                }

            }

        }

        function startParticleSystemEnvironment( id ) {				//粒子系统开启方法

            resetCamera();											//重置摄像机

            Object.keys( particleSystems ).forEach( function( key ) {//遍历粒子系统对象

                var system = particleSystems[ key ];				//将粒子系统对象赋给一个临时变量
                system.deactivate();								//相应粒子系统关闭

            } );

            currentEnvironmentID = id;								//获得当前环境id
            if ( id == ParticleEnvironmentIDs.Campfire ) {//如果当前环境id为粒子系统环境id

                smokeActive = true;									//烟雾标志位置为true
                particleSystems[ ParticleSystemIDs.Flame ].activate();//火焰粒子系统开启
                particleSystems[ ParticleSystemIDs.FlameEmbers ].activate();//火星粒子系统开启
                updateSmokeType();									//更新烟雾类型
                pointLight.distance = 300;							//点光源距离
                pointLight.intensity = 6;							//点光源强度
                pointLight.color.setRGB( 1, .8, .4 );				//点光源颜色
                pointLight.decay = 2;								//点光源衰减程度
                pointLight.position.set( 0, 40, 0 );				//点光源位置

                ambientLight.color.setRGB( .08, .08, .08 );			//环境光颜色

            } else {

                return;

            }

        }

        //获取屏幕宽高
        function getScreenDimensions() {

            screenWidth = window.innerWidth;			//宽
            screenHeight = window.innerHeight;			//高

        }

        function resetCamera() {						//重置摄像机方法

            getScreenDimensions();						//获得屏幕尺寸
            camera.aspect = screenWidth / screenHeight;	//设置长宽比
            camera.updateProjectionMatrix();			//更新摄像机投影矩阵
            camera.position.set( 0, 200, 400 );			//设置摄像机位置
            camera.lookAt( scene.position );			//设置摄像机目标点位置

        }

        function updateParticleSystems() {
            var deltaTime = clock.getDelta();

            Object.keys( particleSystems ).forEach( function( key ) {

                var system = particleSystems[ key ];
                if ( system.isActive ) {

                    system.update( deltaTime );

                }

            } );

            if ( currentEnvironmentID == ParticleEnvironmentIDs.Campfire ) {

                flickerPointLight();

            }

        }

        function animate() {

            requestAnimationFrame( animate );
            update();
            render();

        }

        function update() {				//更新数据方法

            //var time = performance.now() * 0.001;

            //particleSystemsParent.position.x = Math.sin( time ) * 49;
            //particleSystemsParent.position.z = Math.sin( time * 1.2 ) * 49;

            controls.update();			//控制器更新
            stats.update();				//stats更新
            updateParticleSystems();	//更新粒子系统

        }

        function render() {

            renderer.render( scene, camera );

        }
    }

    useEffect(()=>{
        webglRender()
    },[])
    return (
        <div>
            <div ref={webglOutput}></div>
        </div>
    )
}

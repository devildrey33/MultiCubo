/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


'option strict';

var MultiCubo = function() {
    // Llamo al constructor del ObjetoBanner
    if (ObjetoCanvas.call(this, { 
        'Tipo'          : 'THREE',
        'Ancho'         : 'Auto',
        'Alto'          : 'Auto',
        'Entorno'       : 'Normal',
        'MostrarFPS'    : true,
        'BotonLogo'     : true,
        'ElementoRaiz'  : document.body,
        'Pausar'        : true,             // Pausa el canvas si la pestaña no tiene el foco del teclado
        'ColorFondo'    : 0xeeeeee,
        'CapturaEjemplo': "MultiCubo.png"

    }) === false) { return false; }
    
    
};

MultiCubo.prototype = Object.assign( Object.create(ObjetoCanvas.prototype) , {
    constructor     : MultiCubo, 
    // Función que se llama al redimensionar el documento
    Redimensionar   : function() {    },
    // Función que se llama al hacer scroll en el documento    
    Scroll          : function() {    },
    // Función que se llama al mover el mouse por el canvas
    MouseMove       : function(Evento) { },
    // Función que se llama al presionar un botón del mouse por el canvas
    MousePresionado : function(Evento) { },
    // Función que se llama al soltar un botón del mouse por el canvas
    MouseSoltado    : function(Evento) { },
    // Función que se llama al entrar con el mouse en el canvas
    MouseEnter      : function(Evento) { },
    // Función que se llama al salir con el mouse del canvas
    MouseLeave      : function(Evento) { },
    // Función que se llama al presionar una tecla
    TeclaPresionada : function(Evento) { },
    // Función que se llama al soltar una tecla
    TeclaSoltada    : function(Evento) { },
    // Función que se llama al pausar el banner
    Pausa           : function() { this.Animaciones.Pausa(); },
    // Función que se llama al reanudar el banner
    Reanudar        : function() { this.Animaciones.Reanudar(); },
    // Función que inicia el ejemplo
    Cubos           : [],   
    // Grupo de cubos para las rotaciones de varios cubos a la vez
    GrupoCubos      : new THREE.Group(),

    uAniRGC         : 0, // Ultima animación del grupo de cubos
    
    Iniciar         : function() {
        // Instancia para el objeto encargado de las animaciones de tiempo http://devildrey33.es/Ejemplos/Utils/ObjetoAnimacion.js
        this.Animaciones = new ObjetoAnimacion;
        // Activo el mapeado de sombras
        this.Context.shadowMap.enabled	= true;
        
        this.Escena = new THREE.Scene();
        // Creo la cámara
        this.Camara = new THREE.PerspectiveCamera(75, this.Ancho / this.Alto, 0.5, 1000);
        this.Camara.Rotacion = { Grados : -180 * (Math.PI / 180), Avance : (Math.PI / 180) / 3, Distancia : 50, MirarHacia : new THREE.Vector3(0, 0, 0), Animacion : true };
        this.Camara.position.set(0, 0, this.Camara.Rotacion.Distancia);        
        // Función para que la cámara rote alrededor de la escena
        this.Camara.Rotar = function() {
            if (this.Rotacion.Animacion === true) {
                this.Rotacion.Grados += this.Rotacion.Avance;
                this.position.x = this.Rotacion.Distancia * Math.cos(this.Rotacion.Grados);
                this.position.z = this.Rotacion.Distancia * Math.sin(this.Rotacion.Grados);
                this.lookAt(this.Rotacion.MirarHacia); 
            }
        };
        this.Escena.add(this.Camara);
       
        
        // Animación inicial de la cámara
        this.AniAvanceCamara = this.Animaciones.CrearAnimacion([
            { 'Paso' : { z : 500, y: 150 }},
            { 'Paso' : { z :  50, y:  0 }, 'Tiempo' : 1250, 'FuncionTiempo' : FuncionesTiempo.SinInOut }
        ], { "Repetir" : 0, FuncionActualizar : function(Valores) { 
                this.Camara.position.y = Valores.y; 
                this.Camara.Rotacion.Distancia = Valores.z; 
            }.bind(this) 
        });
        this.AniAvanceCamara.Iniciar();        
        
        // Palno para el suelo
        this.Suelo = new THREE.Mesh(    new THREE.PlaneGeometry(1000, 1000), 
                                        new THREE.MeshPhongMaterial({ color: 0xbbbbbb, specular : 0xffffff }));
        this.Suelo.rotation.x = -Math.PI / 2;
        this.Suelo.position.y = -20;
        this.Suelo.castShadow = false;
        this.Suelo.receiveShadow = true;
        this.Escena.add(this.Suelo);

        // Creo varias luces para las sombras y los reflejos
        this.CrearLuces();
        // Creo 27 cubos colocados en forma de cubo
        this.CrearCubos();
        // Animación aleatoria con los cubos
        this.AnimarCubos();
        // Creo el ObjetoTest y añado todos los valores a testear
        this.CrearTest();
        
        this.Cargando(false);    
    },
    
    CrearCubos      : function () {
        for (var i = 0; i < 27; i++) {
            // De momento voy a conservar un material para cada cubo...
            var Cubo = new THREE.Mesh(  new THREE.BoxGeometry( 6.5, 6.5, 6.5 ), 
                                        new THREE.MeshPhongMaterial({ color: 0xea504e, specular : 0x3333AA, transparent : true, opacity:0.9, shininess : 200    }));
            Cubo.castShadow = true;
            Cubo.receiveShadow = true;
            Cubo.Numero = i; // Identificador de cubo (del 0 al 26)
            this.Cubos[i] = Cubo;                
            this.Escena.add(this.Cubos[i]);
        }
        // Posiciono los cubos empezando por la esquina superior izquierda, y terminando en la esquina inferior derecha
        var Contador = 0;
        for (var z = 10; z >= -10; z -= 10) {
            for (var y = 10; y >= -10; y -=10) {
                for (var x = -10; x <= 10; x +=10) {
                    this.Cubos[Contador++].position.set(x, y, z);
                }                
            }
        }
        // Primer cubo azul, para comprobar que los cubos conservan su posición despues de rotar varios grupos de cubos
        this.Cubos[0].material.color.setHex(0x6666ff);
    },
    
    // Elige entre animación de un cubo o animación de un grupo
    AnimarCubos : function() {
        if (Rand() > 0.5) { this.AnimacionRotarGrupoCubos(); }
        else              { this.AnimacionRotarCubo(); }
    },
        
    // Al hacer rotaciones de multiples cubos, las posiciones no quedan 100% precisas, y al cabo de muchas iteraciones acaba descuadrandose todo
    // Por lo que si un valor da 9.999 lo reasignamos a 10, -9.999 = -10, y  0.111 o -0.111 = 0, que son las posiciones fijas iniciales de los cubos (10, 0, -10)
    Aprox : function(Valor) {
        if      (Valor > 5)  { return 10;  } 
        else if (Valor < -5) { return -10; }
        else                 { return 0;   }
    },
    
    // Animación para rotar un grupo de cubos
    AnimacionRotarGrupoCubos : function() {
        var Pos = RandInt(9, 0);
        // Para no repetir el ultimo tipo de animación
        while (Pos === this.uAniRGC) { Pos = RandInt(9, 0); }
//        Pos = 0;
//        var TipoRotacion = 0;
//        if (Pos < 6) { TipoRotacion = Rand(); }

        this.uAniRGC = Pos; // Ultima posición de la animación
        // Calculo la posición final de cada cubo dentro del grupo 
        for (var i = 0; i < this.GrupoCubos.children.length; i++) {                
            var vector = new THREE.Vector3();
            vector.setFromMatrixPosition( this.GrupoCubos.children[i].matrixWorld );
            this.Cubos[this.GrupoCubos.children[i].Numero].position.set(this.Aprox(vector.x), this.Aprox(vector.y), this.Aprox(vector.z));
        }
        // Al volver a añadir los cubos a la escena, se eliminan de dentro del grupo de cubos
        for (var i = 0; i < this.Cubos.length; i++) {
            this.Escena.add(this.Cubos[i]);
        }        
        var RotarCaraX = 0, RotarCaraY = 0, RotarCaraZ = 0,
            PosCaraX   = 0, PosCaraY   = 0, PosCaraZ   = 0;
        var rInt = RandInt(3, 1); // Con valores negativos hace algo raro...
        // Añado 9 cubos según la posición aleatória
        for (var i = 0; i < this.Cubos.length; i++) {
            switch (Pos) {
                case 0 : if (this.Cubos[i].position.x >  5) { this.GrupoCubos.add(this.Cubos[i]); }                                 break;  // derecha
                case 1 : if (this.Cubos[i].position.x < -5) { this.GrupoCubos.add(this.Cubos[i]); }                                 break;  // izquierda
                case 2 : if (this.Cubos[i].position.y >  5) { this.GrupoCubos.add(this.Cubos[i]); }                                 break;  // arriba
                case 3 : if (this.Cubos[i].position.y < -5) { this.GrupoCubos.add(this.Cubos[i]); }                                 break;  // abajo   
                case 4 : if (this.Cubos[i].position.z >  5) { this.GrupoCubos.add(this.Cubos[i]); }                                 break;  // delante   
                case 5 : if (this.Cubos[i].position.z < -5) { this.GrupoCubos.add(this.Cubos[i]); }                                 break;  // atras
                case 6 : if (this.Cubos[i].position.x < 5 && this.Cubos[i].position.x > -5) { this.GrupoCubos.add(this.Cubos[i]); } break;  // centro x
                case 7 : if (this.Cubos[i].position.y < 5 && this.Cubos[i].position.y > -5) { this.GrupoCubos.add(this.Cubos[i]); } break;  // centro y
                case 8 : if (this.Cubos[i].position.z < 5 && this.Cubos[i].position.z > -5) { this.GrupoCubos.add(this.Cubos[i]); } break;  // centro z
            }
        }
        this.Escena.add(this.GrupoCubos);

//        if (TipoRotacion < 0.5) { // Rotación normal
            switch (Pos) {
                case 0 : RotarCaraX = rInt;     break;   // derecha
                case 1 : RotarCaraX = rInt;     break;   // izquierda
                case 2 : RotarCaraY = rInt;     break;   // arriba
                case 3 : RotarCaraY = rInt;     break;   // abajo
                case 4 : RotarCaraZ = rInt;     break;   // delante
                case 5 : RotarCaraZ = rInt;     break;   // atras
                case 6 : RotarCaraX = rInt;     break;   // centro x
                case 7 : RotarCaraY = rInt;     break;   // centro y
                case 8 : RotarCaraZ = rInt;     break;   // centro z
            }
            this.AniRotarGrupoCubos = this.Animaciones.CrearAnimacion(
                [   // Pasos de la animación
                    {   Paso : { rX : 0, rY : 0, rZ : 0 }     }, 
                    {   Paso : { rX : RotarCaraX * (Math.PI / 2), rY : RotarCaraY * (Math.PI / 2), rZ : RotarCaraZ * (Math.PI / 2) }, 
                        Tiempo : 500 * (RotarCaraX + RotarCaraY + RotarCaraZ), 
                        FuncionTiempo : FuncionesTiempo.SinOut 
                    }
                ], 
                {   // Opciones de la animación
                    FuncionActualizar : function(Valores) { 
                        this.GrupoCubos.rotation.set(Valores.rX , Valores.rY, Valores.rZ);
                    }.bind(this), 
                    FuncionTerminado  : this.AnimarCubos.bind(this)
                }
            );
            this.AniRotarGrupoCubos.AsignarValoresIniciales();
            this.AniRotarGrupoCubos.Iniciar();
/*            
        }
        else {              // Rotación eje anormal
            switch (Pos) {
                case 0 : 
                    if (Rand() > 0.5) { RotarCaraY = 2; }
                    else              { RotarCaraZ = 2; }
                    PosCaraX = 13;
                    break; // derecha
                case 1 : 
                    if (Rand() > 0.5) { RotarCaraY = 2; }
                    else              { RotarCaraZ = 2; }
                    PosCaraX = -13;
                    break; // izquierda
                case 2 : 
                    if (Rand() > 0.5) { RotarCaraX = 2; }
                    else              { RotarCaraZ = 2; }
                    PosCaraY = 13;
                    break;   // arriba
                case 3 : 
                    if (Rand() > 0.5) { RotarCaraX = 2; }
                    else              { RotarCaraZ = 2; }
                    PosCaraY = -13;
                    break;   // abajo
                case 4 : 
                    if (Rand() > 0.5) { RotarCaraX = 2; }
                    else              { RotarCaraY = 2; }
                    PosCaraZ = 13;
                    break;   // delante
                case 5 : 
                    if (Rand() > 0.5) { RotarCaraX = 2; }
                    else              { RotarCaraY = 2; }
                    PosCaraZ = -13;
                    break;   // atras
            }
        
            this.AniRotarGrupoCubos = this.Animaciones.CrearAnimacion(
                [   // Pasos de la animación
                    {   Paso : { rX : 0, rY : 0, rZ : 0, pX : 0, pY : 0, pZ : 0 }     }, 
                    {   Paso : { rX : 0, rY : 0, rZ : 0, pX : PosCaraX, pY : PosCaraY, pZ : PosCaraZ }, Tiempo : 300, FuncionTiempo : FuncionesTiempo.SinOut }, 
                    {   Paso : { rX : RotarCaraX * (Math.PI / 2), rY : RotarCaraY * (Math.PI / 2), rZ : RotarCaraZ * (Math.PI / 2) , pX : PosCaraX, pY : PosCaraY, pZ : PosCaraZ }, 
                        Tiempo : 500 * (RotarCaraX + RotarCaraY + RotarCaraZ), 
                        FuncionTiempo : FuncionesTiempo.SinOut 
                    },
                    {   Paso : { rX : RotarCaraX * (Math.PI / 2), rY : RotarCaraY * (Math.PI / 2), rZ : RotarCaraZ * (Math.PI / 2), pX : 0, pY : 0, pZ : 0 }, Tiempo : 300, FuncionTiempo : FuncionesTiempo.SinOut }, 
                ], 
                {   // Opciones de la animación
                    FuncionActualizar : function(Valores) { 
                        this.GrupoCubos.rotation.set(Valores.rX , Valores.rY, Valores.rZ);
                        this.GrupoCubos.position.set(Valores.pX , Valores.pY, Valores.pZ);
                    }.bind(this), 
                    FuncionTerminado  : this.AnimarCubos.bind(this), 
                }
            );                                
        }*/
    },
    
    AnimacionRotarCubo   : function() {
        var Eje = RandInt(3);
        this.CuboAnimado = RandInt(26, 0);        
        var RotarCara = [0 ,0, 0];
        RotarCara[Eje] = RandInt(3, 1) * (Math.PI / 2);
        var T = 350 * (RotarCara[0] + RotarCara[1] + RotarCara[2]);
        this.AniRotarCubo = this.Animaciones.CrearAnimacion([
                { Paso : { x : 0,             y : 0,              z : 0 }},
                { Paso : { x : RotarCara[0],  y : RotarCara[1],   z : RotarCara[2] }, Tiempo : T, FuncionTiempo : FuncionesTiempo.SinOut}
            ], { 
                FuncionActualizar : function(Valores) { this.Cubos[this.CuboAnimado].rotation.set(Valores.x, Valores.y, Valores.z); }.bind(this), 
                FuncionTerminado  : this.AnimarCubos.bind(this)
            }
        );         
        this.AniRotarCubo.AsignarValoresIniciales();
        this.AniRotarCubo.Iniciar();
    },
    
    AnimacionEncenderLuz : function() {
        if (typeof this.AniEncenderLuz !== 'undefined') this.AniEncenderLuz.Terminar();
        this.AniEncenderLuz = this.Animaciones.CrearAnimacion([
            { Paso : { Intensidad : 0   }},
            { Paso : { Intensidad : 0.7 }, Tiempo : 120,  FuncionTiempo : FuncionesTiempo.SinInOut, Retraso : 0 },
            { Paso : { Intensidad : 0   }, Tiempo : 120,  FuncionTiempo : FuncionesTiempo.SinInOut },
            { Paso : { Intensidad : 0.6 }, Tiempo : 120,  FuncionTiempo : FuncionesTiempo.SinInOut },
            { Paso : { Intensidad : 0.1 }, Tiempo : 120,  FuncionTiempo : FuncionesTiempo.SinInOut },
            { Paso : { Intensidad : 0.5 }, Tiempo : 4850, FuncionTiempo : FuncionesTiempo.SinInOut },
            { Paso : { Intensidad : 1   }, Tiempo : 2500, FuncionTiempo : FuncionesTiempo.SinInOut }
        ], { FuncionActualizar : function(Valores) { 
                this.SpotLight.intensity = Valores.Intensidad; 
                this.DirLight.intensity = Valores.Intensidad * 0.6;
                this.HemiLight.intensity = 0.4 + (Valores.Intensidad * 0.4);
            }.bind(this) 
        });            
        this.AniEncenderLuz.AsignarValoresIniciales();
        this.AniEncenderLuz.Iniciar();        
    },        
    
    
    CrearLuces      : function() {        
        // DirectionalLight
        this.DirLight = new THREE.DirectionalLight( 0xffffff, 0 );
        this.DirLight.color.setHSL( 0.1, 1, 0.95 );
        this.DirLight.position.set( 20, 35, 50 ).normalize();
        this.DirLight.position.multiplyScalar( 50 );
        this.Escena.add( this.DirLight );
        this.DirLight.castShadow = true;
        this.DirLight.shadow.mapSize.width = 2048;
        this.DirLight.shadow.mapSize.height = 2048;
        var d = 80;
        this.DirLight.shadow.camera.left = -d;
        this.DirLight.shadow.camera.right = d;
        this.DirLight.shadow.camera.top = d;
        this.DirLight.shadow.camera.bottom = -d;
        this.DirLight.shadow.camera.far = 3500;
        this.DirLight.target = this.Suelo;
        this.Dlhelper = new THREE.CameraHelper(this.DirLight.shadow.camera);
        this.Escena.add(this.Dlhelper);
        this.Dlhelper.visible = false;
        
        // SpotLight
	this.SpotLight	= new THREE.SpotLight( 0xCCFFFF, 0 );
	this.SpotLight.position.set( 25, 100, 750 );
	this.SpotLight.shadow.camera.near	= 0.01;		
	this.SpotLight.shadow.camera.far	= 1000;		
	this.SpotLight.shadow.camera.visible	= true;
	this.SpotLight.castShadow		= true;
        this.SpotLight.target = this.Suelo;
        this.Escena.add( this.SpotLight );	
        
        this.Splhelper = new THREE.CameraHelper(this.SpotLight.shadow.camera);
        this.Splhelper.visible = false; 
        this.Escena.add(this.Splhelper);
        
        // HemisphereLight  
        this.HemiLight = new THREE.HemisphereLight( 0xeeeeee, 0xffffff, 0.2 );
        this.HemiLight.color.setHSL( 0.6, 0.6, 0.6 );
        this.HemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
        this.HemiLight.position.set( 0, 0, 0 );
        this.Escena.add( this.HemiLight );        
        
        this.AnimacionEncenderLuz();
    },
    
    // Función que crea y enlaza todos los controles del ObjetoTest
    CrearTest : function() {
        this.Test = new ObjetoTest({ css : { bottom : "10px", left : "10px" } });
        // Valores para el ObjetoTest de la cámara
        this.lCamara = this.Test.AgregarLista("Cámara");
        this.lCamara.Agregar({ Padre : this.Camara.position, Variable : "x", Min : -200, Max : 200, Nombre : "position.x", Modificable : false  });
        this.lCamara.Agregar({ Padre : this.Camara.position, Variable : "y", Min : -200, Max : 200, Nombre : "position.y" });
        this.lCamara.Agregar({ Padre : this.Camara.position, Variable : "z", Min : -200, Max : 200, Nombre : "position.z", Modificable : false });
        this.lCamara.Agregar({ Padre : this.Camara.rotation, Variable : "x", Min : -Math.PI, Max : Math.PI, Nombre : "rotation.x", Modificable : false });
        this.lCamara.Agregar({ Padre : this.Camara.rotation, Variable : "y", Min : -Math.PI, Max : Math.PI, Nombre : "rotation.y", Modificable : false });
        this.lCamara.Agregar({ Padre : this.Camara.rotation, Variable : "z", Min : -Math.PI, Max : Math.PI, Nombre : "rotation.z", Modificable : false });
        this.lCamara.Agregar({ Padre : this.Camara.Rotacion, Variable : "Animacion", Nombre : "Animación", Actualizar : function(NuevoValor) {
            this.Camara.Rotacion.Animacion = NuevoValor;
            for (var i = 0; i < this.lCamara.Variables.length; i++) {
                if (i !== 1 && i !== 6) {
                    this.lCamara.Variables[i].Modificable(!NuevoValor);
                }
            }
        }.bind(this) });
        // Objetos
        var lObjetos = this.Test.AgregarLista("Objetos");        
        // Cubos
        var lCubos = lObjetos.AgregarLista("Cubos");
        this.Cubos_WireFrame = false;                
        lCubos.Agregar({ Padre : this, Variable : "Cubos_WireFrame", Nombre : "wireframe",
            Actualizar : function(NuevoValor) { 
                for (var i = 0; i < this.Cubos.length; i++) {
                    this.Cubos[i].material.wireframe = NuevoValor; 
                } 
            }.bind(this)  
        });
        
        this.Cubos_CastShadow = true;                
        lCubos.Agregar({ Padre : this, Variable : "Cubos_CastShadow", Nombre : "castShadow",
            Actualizar : function(NuevoValor) { 
                for (var i = 0; i < this.Cubos.length; i++) {
                    this.Cubos[i].castShadow = NuevoValor; 
                } 
            }.bind(this)  
        });
        // Suelo
        var lSuelo = lObjetos.AgregarLista("Suelo");
        lSuelo.Agregar({ Padre : this.Suelo.position, Variable : "x", Min : -200, Max : 200, Nombre : "position.x"  });
        lSuelo.Agregar({ Padre : this.Suelo.position, Variable : "y", Min : -200, Max : 200, Nombre : "position.x" });
        lSuelo.Agregar({ Padre : this.Suelo.position, Variable : "z", Min : -200, Max : 200, Nombre : "position.x" });
        lSuelo.Agregar({ Padre : this.Suelo.rotation, Variable : "x", Min : -Math.PI, Max : Math.PI, Nombre : "rotation.x" });
        lSuelo.Agregar({ Padre : this.Suelo.rotation, Variable : "y", Min : -Math.PI, Max : Math.PI, Nombre : "rotation.y" });
        lSuelo.Agregar({ Padre : this.Suelo.rotation, Variable : "z", Min : -Math.PI, Max : Math.PI, Nombre : "rotation.z" });
        lSuelo.Agregar({ Padre : this.Suelo.material, Variable : "wireframe", Actualizar : function(NuevoValor) { this.Suelo.material.wireframe = NuevoValor; }.bind(this)  });
        var tLuces = this.Test.AgregarLista("Luces");
        // DirectionalLight
        var tDirLight = tLuces.AgregarLista("DirectionalLight");
        tDirLight.Agregar({ Padre : this.DirLight.position,   Variable : "x",           Min : -100, Max : 100, Nombre : "position.x"});
        tDirLight.Agregar({ Padre : this.DirLight.position,   Variable : "y",           Min : -100, Max : 100, Nombre : "position.y"});
        tDirLight.Agregar({ Padre : this.DirLight.position,   Variable : "z",           Min : -200, Max : 200, Nombre : "position.z"});
        tDirLight.Agregar({ Padre : this.DirLight,            Variable : "intensity",   Min : 0.0,  Max : 1.0});
        tDirLight.Agregar({ Padre : this.Dlhelper,            Variable : "visible",     Nombre : "helper" });        
        // SpotLight
        var tSpotLight = tLuces.AgregarLista("SpotLight");
        tSpotLight.Agregar({ Padre : this.SpotLight.position,   Variable : "x",                     Min : -100, Max : 100 });
        tSpotLight.Agregar({ Padre : this.SpotLight.position,   Variable : "y",                     Min : -200, Max : 200 });
        tSpotLight.Agregar({ Padre : this.SpotLight.position,   Variable : "z",                     Min : -750, Max : 750 });
        tSpotLight.Agregar({ Padre : this.SpotLight,            Variable : "intensity",             Min : 0.0,  Max : 1.0});
        tSpotLight.Agregar({ Padre : this.Splhelper,            Variable : "visible",               Nombre : "helper"  });
        // HemisphereLight
        var tHemiLight = tLuces.AgregarLista("HemisphereLight"); 
        tHemiLight.Agregar({ Padre : this.HemiLight.position,   Variable : "x",         Min : -100, Max : 100});
        tHemiLight.Agregar({ Padre : this.HemiLight.position,   Variable : "y",         Min : 0,    Max : 500});
        tHemiLight.Agregar({ Padre : this.HemiLight.position,   Variable : "z",         Min : -200, Max : 200});
        tHemiLight.Agregar({ Padre : this.HemiLight,            Variable : "intensity", Min : 0.0,  Max : 1.0});
        
        tLuces.Agregar({ Padre : this, Variable : "AnimacionEncenderLuz",  Nombre : "Ani Encender luz"  });        
    },
    
    // Función que pinta cada frame de la animación
    Pintar          : function() {  
        // Actualizo los valores del test
        this.Test.ActualizarValores();
        // Actualizo las animaciones de tiempo
        this.Animaciones.Actualizar(this.Tick);
        // Actualizo la rotación de la camara
        this.Camara.Rotar(this.Escena);
        // Aplico el render
        this.Context.render(this.Escena, this.Camara);  
    }
});


var Canvas = new MultiCubo;
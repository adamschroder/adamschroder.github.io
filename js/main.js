if ( WEBGL.isWebGLAvailable() === false ) {
    document.body.appendChild( WEBGL.getWebGLErrorMessage() );
}

var container, camera, scene, renderer, effect, raycaster, ring, canvas, opened;
var spheres = [];
var rotations = [];
var opened = 0;
var IS_OPEN = false;
// for tooltip
var tooltip, texture, tooltipContext, sprite;
tooltip = document.createElement('canvas');
tooltipContext = tooltip.getContext('2d');
tooltipContext.fillStyle = '#FF0000';
tooltipContext.font = "Bold 20px Arial";
tooltipContext.fillStyle = "rgba(0,0,0,0.95)";
tooltipContext.fillText('Adam here!', 0, 20);
texture = new THREE.Texture(tooltip); 
texture.needsUpdate = true;	

var mouse = new THREE.Vector2(), INTERSECTED;

var mouseX = 0;
var mouseY = 0;


var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;


init();
animate();

function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.01, 100 );
    camera.position.z = 20;
    camera.focalLength = 3;

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xFAFAFA );

    var ringGeometry = new THREE.RingGeometry( 0.3, 0.32, 6 );
    var ringMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.DoubleSide } );
    ring = new THREE.Mesh( ringGeometry, ringMaterial );
    ring.scale.set(0.01,0.1,0.1);
    ring.title = 'cursor';

    var geometry = new THREE.IcosahedronBufferGeometry(0.3, 0 );
    var material = new THREE.MeshStandardMaterial( {  emissive: 0x6284FF } );
    var ringMaterials = [
        new THREE.MeshBasicMaterial( { color: 0xd94d44, side: THREE.DoubleSide } ),
        new THREE.MeshBasicMaterial( { color: 0xf5c54c, side: THREE.DoubleSide } ),
        new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.DoubleSide } ),
        new THREE.MeshBasicMaterial( { color: 0x456d5f, side: THREE.DoubleSide } ),
        new THREE.MeshBasicMaterial( { color: 0xfc7f51, side: THREE.DoubleSide } ),
        new THREE.MeshBasicMaterial( { color: 0xa9a6ac, side: THREE.DoubleSide } ),
    ]

    var projects = [
        {	
            'project': 'wunderlist',
            'material': new THREE.MeshStandardMaterial( {  emissive: 0xd94d44 } ),
            'scale': Math.random() * 5 + 1,
            'displayName': 'Wunderlist',
            'visited': false,
            'ringMesh': new THREE.Mesh(ringGeometry, ringMaterials[0])
        },
        {
            'project': 'stickynotes',
            'material': new THREE.MeshStandardMaterial( {  emissive: 0xf5c54c } ),
            'scale': Math.random() * 4 + 1,
            'displayName': 'Microsoft',
            'visited': false,
            'ringMesh': new THREE.Mesh(ringGeometry, ringMaterials[1])
        },
        {
            'project': 'secret',
            'material': new THREE.MeshStandardMaterial( {  emissive: 0x000000 } ),
            'scale': Math.random() * 2 + 1,
            'displayName': 'Secret',
            'visited': false,
            'ringMesh': new THREE.Mesh(ringGeometry, ringMaterials[2])
        },
        {
            'project': 'photography',
            'material': new THREE.MeshStandardMaterial( {  emissive: 0x456d5f } ),
            'scale': Math.random() * 3 + 1,
            'displayName': 'Photography',
            'visited': false,
            'ringMesh': new THREE.Mesh(ringGeometry, ringMaterials[3])
        },
        {
            'project': 'illustrations',
            'material': new THREE.MeshStandardMaterial( {  emissive: 0xfc7f51 } ),
            'scale': Math.random() * 2 + 1,
            'displayName': 'Illustrations',
            'visited': false,
            'ringMesh': new THREE.Mesh(ringGeometry, ringMaterials[4])
        }, 
        {
            'project': 'knightlyrage',
            'material': new THREE.MeshStandardMaterial( {  emissive: 0xa9a6ac } ),
            'scale': Math.random() * 3 + 1,
            'displayName': 'Game Dev',
            'visited': false,
            'ringMesh': new THREE.Mesh(ringGeometry, ringMaterials[5])
        }
    ];

    for ( var i = 0; i < projects.length; i ++ ) {

        var mesh = new THREE.Mesh( geometry, projects[i].material );
        projects[i].material.shadowSide = THREE.DoubleSide;

        mesh.position.x = Math.random() * 10;
        mesh.position.y = Math.random() * 10;
        mesh.position.z = Math.random() * 10;
        mesh.callback = orbClick;
        mesh.name = projects[i].displayName;
        mesh.projectTitle = projects[i].project;
        mesh.ring = projects[i].ringMesh;
        mesh.ring.title = 'cursor';

        mesh.scale.x = mesh.scale.y = mesh.scale.z = projects[i].scale;
        mesh.ring.visible = false;
        scene.add( mesh );
        scene.add( mesh.ring );
        spheres.push( mesh );

        rotations.push([getRandomArbitrary(0.001,0.01),getRandomArbitrary(0.00001,0.0001)]);
    }

    //

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    container.appendChild( renderer.domElement );

    var width = window.innerWidth || 2;
    var height = window.innerHeight || 2;

    effect = new THREE.ParallaxBarrierEffect( renderer );
    effect.setSize( width, height );

    window.addEventListener( 'resize', onWindowResize, false );
    raycaster = new THREE.Raycaster();

    var directionalLight = new THREE.DirectionalLight( 0xcccccc, 0.1 );

    // for tooltip
    var spriteMaterial = new THREE.SpriteMaterial( { map: texture, color: 0x000000 });
    sprite = new THREE.Sprite( spriteMaterial );
    sprite.scale.set(200,100,1.0);
    sprite.position.set( 0, 0, 0 );
    scene.add( sprite );
    //
    
    scene.add( ring );
    scene.add( directionalLight );
    canvas = document.body.getElementsByTagName('canvas')[0];
}

function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    effect.setSize( window.innerWidth, window.innerHeight );

    if (window.innerWidth <= 400) {
        camera.position.z = 40;
    } else {
        camera.position.z = 20;
    }
}

function onDocumentMouseMove( e ) {
    e.preventDefault();

    //for parallax 
    mouseX = ( e.clientX - windowHalfX ) / 100;
    mouseY = ( e.clientY - windowHalfY ) / 100;

    // for hover
    mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;

    mouse.x = (e.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y =  - (e.clientY / renderer.domElement.clientHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(spheres);

    if (intersects.length > 0) {
        canvas.style.cursor = "pointer";
        sprite.position.copy(ring.position);
    } 
    else {
        resetCursor();
        ring.rotation.copy(camera.rotation);
    }
}

//

function animate() {
    requestAnimationFrame( animate );
    render();
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function orbClick(obj) {
    if (IS_OPEN) { return ; }
    IS_OPEN = true;
    var title = obj !== undefined ? obj.object.projectTitle: 'profile';
    var sheet = document.getElementById(title);
    sheet.classList.remove('closed');
    if (title !== 'profile') {
        window.setTimeout(function() {
            obj.object.visited = true;
            opened++;
        }, 500);
    }
}

function closeProject(e) {
    e.preventDefault();
    IS_OPEN = false;

    var openProjects = document.getElementsByClassName('sheet');
    for (var i=0;i<openProjects.length;i++){
        openProjects[i].classList.add('closed');
    }

    if (opened === 6) {
        window.setTimeout(function() {
            var topMark = document.getElementById('logomark');
            topMark.classList.add('open');
        }, 400);
    }
}

function resetCursor() {
    ring.scale.set(0.01,0.1,0.1);
    if (canvas) canvas.style.cursor = "default";
}

function easeInOut (t) {  return t<.1 ? 2*t*t : -1+(4-2*t)*t }

function handleCursor () {
    var intersects = raycaster.intersectObjects( spheres );
    if ( intersects.length > 0) {
        var intersekt = intersects[0].object;

        var maxX = (intersekt.scale.x + 2).toFixed(2);
        var maxY = (intersekt.scale.y + 2).toFixed(2);
        var maxZ = (intersekt.scale.z + 2).toFixed(2);

        if (ring.scale.x.toFixed(2) <= maxX && ring.scale.y.toFixed(2) <= maxY && ring.scale.z.toFixed(2) <= maxZ) {
            ring.scale.x += easeInOut(0.37);
            ring.scale.y += easeInOut(0.37);
            ring.scale.z += easeInOut(0.37);
        }
    
        ring.scale.set(ring.scale.x, ring.scale.y, ring.scale.z);
        ring.position.x = intersekt.position.x;
        ring.position.y = intersekt.position.y;
        ring.position.z = intersekt.position.z;
        ring.rotation.x += 0.01;
        ring.rotation.y += 0.01;
        ring.rotation.z += 0.01;
    }
}


function render() {

    var timer = 0.0001 * Date.now();
    camera.position.x += ( mouseX - camera.position.x ) * .05;
    camera.position.y += ( mouseY - camera.position.y ) * .05;
    camera.lookAt( scene.position );

    for ( var i = 0, il = spheres.length; i < il; i ++ ) {

        var sphere = spheres[ i ];

        sphere.position.x = 5 * Math.cos( timer + i );
        sphere.position.y = 5 * Math.sin( timer + i * 1.1 );
        sphere.rotation.x += rotations[i][0];
        sphere.rotation.y += rotations[i][1];
        if (sphere.visited) {
            sphere.ring.visible = true;
            sphere.ring.scale.set(sphere.scale.x + 0.5, sphere.scale.y + 0.5, sphere.scale.z + 0.5);
            sphere.ring.position.x = sphere.position.x;
            sphere.ring.position.y = sphere.position.y;
            sphere.ring.position.z = sphere.position.z;
            sphere.ring.rotation.x += 0.005;
            sphere.ring.rotation.y += 0.005;
            sphere.ring.rotation.z += 0.005;
        }
    }

    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( scene.children );
    // has intersection
    if ( intersects.length > 0 ) {
        // has not been intersected again, and is unique
        if ( INTERSECTED != intersects[ 0 ].object && intersects[ 0 ].object.title !== 'cursor') {
            // not changed color
            // if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
            INTERSECTED = intersects[ 0 ].object;
            // INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();

            // for tooltip
            if ( intersects[ 0 ].object.name ) {
                tooltipContext.clearRect(0,0,640,480);
                var message = intersects[ 0 ].object.name;
                var metrics = tooltipContext.measureText(message);
                var width = metrics.width;
                tooltipContext.fillStyle = "rgba(0,0,0,0.95)"; // black border
                tooltipContext.fillRect( 0,0, width+8,20+8);
                tooltipContext.fillStyle = "rgba(255,255,255,0.95)"; // white filler
                tooltipContext.fillRect( 2,2, width+4,20+4 );
                tooltipContext.fillStyle = "rgba(0,0,0,1)"; // text color
                tooltipContext.fillText( message, 4,20 );
                texture.needsUpdate = true;
            }
            else
            {
                tooltipContext.clearRect(0,0,300,300);
                resetCursor()
                texture.needsUpdate = true;
            }
        }
    } else {
        INTERSECTED = null;
        tooltipContext.clearRect(0,0,300,300);
        texture.needsUpdate = true;
        resetCursor()
    }
    
    handleCursor();

    effect.render( scene, camera );
}

function onMouseDown (e) {
    e.preventDefault();
    mouse.x = (e.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y =  - (e.clientY / renderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(spheres);

    if (intersects.length > 0) {
        var object = intersects[0].object;
        object.callback(intersects[0]);
    }
}

function openProfile () {
    orbClick();
}

var headerName = document.getElementById('name');
document.addEventListener('mousemove', onDocumentMouseMove, false );
document.addEventListener('mousedown', onMouseDown, false);
headerName.addEventListener('click', openProfile, false);
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// camera.position.z = 5;
camera.position.z = 50; 

// target the canvas element
const canvas = document.getElementById('starfield-canvas');

// renderer with the selected canvas
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// starfield
const starGeometry = new THREE.BufferGeometry();
const starCount = 10000;
const starPositions = new Float32Array(starCount * 3);

for (let i = 0; i < starCount; i++) {
    const distance = 50 + Math.random() * 450;
    const theta = THREE.MathUtils.randFloatSpread(360);
    const phi = THREE.MathUtils.randFloatSpread(360);

    starPositions[i * 3] = distance * Math.sin(theta) * Math.cos(phi);
    starPositions[i * 3 + 1] = distance * Math.sin(theta) * Math.sin(phi);
    starPositions[i * 3 + 2] = distance * Math.cos(theta);
}

starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

// star color and material
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.2 });
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

let mouseX = 0;
let mouseY = 0;

// colors for transition
const color1 = new THREE.Color(0xffff00);  // yellow
const color2 = new THREE.Color(0x0000ff);  // blue
const color3 = new THREE.Color(0xfffff);  // white

document.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX / window.innerWidth) - 0.5;
  mouseY = (event.clientY / window.innerHeight) - 0.5;
});

// add images to test

// might replace these with planets.
const images = []; // store stars for later reference

function createStarShape(size) {
    const points = [];
    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size / 2;

    for (let i = 0; i < spikes; i++) {
        const angle = (i * Math.PI * 2) / spikes;
        const xOuter = Math.cos(angle) * outerRadius;
        const yOuter = Math.sin(angle) * outerRadius;
        points.push(new THREE.Vector2(xOuter, yOuter));

        const innerAngle = angle + Math.PI / spikes;
        const xInner = Math.cos(innerAngle) * innerRadius;
        const yInner = Math.sin(innerAngle) * innerRadius;
        points.push(new THREE.Vector2(xInner, yInner));
    }

    const shape = new THREE.Shape(points);
    return shape;
}

const starCounts = 5;
for (let i = 0; i < starCounts; i++) {
    const starShape = createStarShape(3); // change size here
    const geometry = new THREE.ShapeGeometry(starShape);
    // const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff, side: THREE.DoubleSide });
    const material = new THREE.MeshBasicMaterial({ color: 0xfffaaf, side: THREE.DoubleSide });
    const star = new THREE.Mesh(geometry, material);

    // position each star randomly in the space
    star.position.set(
        (Math.random() - 0.1) * 100,
        (Math.random() - 0.1) * 100,
        (Math.random() - 3.2) * 100
    );

    //scale sthe star
    star.scale.set(0.3, 0.3, 1);

    scene.add(star);

    images.push(star);
}

// zoom to images
function animateCamera(targetPosition, duration = 2000) {
    const startPosition = camera.position.clone();
    const startTime = performance.now();

    // disable zoom effect during animation
    // currently anims are off
    isZooming = false;

    function updateCamera() {
        const elapsed = performance.now() - startTime;
        // check math from Sam.
        const t = Math.min(elapsed / duration, 1); // ensure `t` doesn't exceed 1

        // this too. smooth easing function
        const easeInOutQuad = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

        // check distance to target
		if (camera.position.distanceTo(targetPosition) < 5) {
            targetPosition = null; // stop further movement on zoom
		}
        
        // interpolate camera position
        camera.position.lerpVectors(startPosition, targetPosition, easeInOutQuad);

        renderer.render(scene, camera);

        // continue animating if not yet at target
        if (t < 1) {
            requestAnimationFrame(updateCamera);
        } else {
            isZooming = true;
        }
    }

    requestAnimationFrame(updateCamera);

}

// zoom to image on click
function zoomToImage(index, duration = 2000) {
    const targetPosition = images[index].position.clone().sub(new THREE.Vector3(5, 0, 0)); // offset slightly for zoom effect
    animateCamera(targetPosition, duration);
}

// store the initial camera position
// this "resets the view now"
const initialCameraPosition = camera.position.clone();

// zoom back to the initial position
function zoomBackToInitialPosition(targetPosition, duration = 2000) {
    animateCamera(initialCameraPosition, duration);
}

// DOM elements with ids zoomToImage1, zoomToImage2, etc.
document.getElementById('zoomToImage1').addEventListener('click', () => zoomToImage(0));
document.getElementById('zoomToImage2').addEventListener('click', () => zoomToImage(1));
document.getElementById('zoomToImage3').addEventListener('click', () => zoomToImage(2));
document.getElementById('zoomToImage4').addEventListener('click', () => zoomToImage(3));
document.getElementById('zoomToImage5').addEventListener('click', () => zoomToImage(4));


// check if the click was outside of certain elements
document.addEventListener('click', (event) => {
    if (
        !event.target.closest('#zoomToImage1') &&
        !event.target.closest('#zoomToImage2') &&
        !event.target.closest('#zoomToImage3') &&
        !event.target.closest('#zoomToImage4') &&
        !event.target.closest('#zoomToImage5') &&
        !event.target.closest('.arrow-left') &&
        !event.target.closest('.arrow-right')
    ) {
        zoomBackToInitialPosition(); // back to the initial camera position
    }
});

let isZooming = true;

function animate() {
    requestAnimationFrame(animate);

    camera.position.z -= 0.005;

    images.forEach(image => {
        image.position.z -= 0.01;
    });

    const positions = starGeometry.attributes.position.array;
    for (let i = 0; i < starCount; i++) {
        if (positions[i * 3 + 2] + camera.position.z > 5) {
            positions[i * 3 + 2] -= 500;
        }
    }
    starGeometry.attributes.position.needsUpdate = true;

    const color = color1.clone();
    color.lerp(color2, (mouseX + 0.5));  // horizontal gradient transition
    color.lerp(color3, (mouseY + 0.5));  // vertical gradient transition

    starMaterial.color.set(color);

    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

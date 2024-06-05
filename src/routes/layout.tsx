import { component$, Slot, useVisibleTask$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import getAuth from '~/components/functions/auth';
import Nav from '~/components/Nav';

export const useGetAuth = routeLoader$(async ({ cookie, env }) => await getAuth(cookie, env));

const particleColors = [
  [123, 107, 137],
  [149, 240, 173],
  [224, 169, 145],
  [245, 181, 185],
];

export default component$(() => {
  const auth = useGetAuth();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    const canvas = document.getElementById('particles') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Define particle class
    class Particle {
      x: number;
      y: number;
      radius: number;
      speed: number;
      directionX: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas.width; // Random x position
        this.y = Math.random() * canvas.height; // Random y position
        this.radius = Math.random() * 1 + 3; // Random size
        this.speed = Math.random() * 0.5 + 1; // Random speed
        this.directionX = Math.random() * 2 - 1; // Random x direction
        const color = particleColors[Math.floor(Math.random() * particleColors.length)];
        this.color = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${Math.random() * 0.5 + 0.2})`; // color
      }
      // Update particle position
      update() {
        if (canvas.height !== window.innerHeight || canvas.width !== window.innerWidth) {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
        }
        this.y -= this.speed;
        this.x += this.directionX * this.speed * 0.4;
        if (this.x > canvas.width || this.x < 0) {
          this.directionX = -this.directionX; // Reverse direction if particle hits the wall
        }
        if (this.y < 0) {
          this.y = canvas.height; // Reset position if particle goes out of the canvas
        }
      }
      // Draw particle
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        // blur slightly
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fill();
      }
    }

    // Create particles
    const numberOfParticles = 80;
    const particles: Particle[] = Array.from({ length: numberOfParticles }, () => new Particle());

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
    }

    // Start animation
    animate();
  });

  return (
    <main>
      <Nav auth={auth.value} />
      <canvas id="particles" class="fixed top-0 overflow-hidden w-full h-full"></canvas>
      <Slot />
    </main>
  );
});

// js/main.js
import { HeatmapRenderer }  from './render/HeatmapRenderer.js';
import { PointsRenderer }   from './render/PointsRenderer.js';
import { OverlayRenderer }  from './render/OverlayRenderer.js';
import { SceneManager }     from './narrative/SceneManager.js';
import { SubtitleOverlay }  from './ui/SubtitleOverlay.js';
import { SidePanel }        from './ui/SidePanel.js';
import { Controls }         from './ui/Controls.js';
import { NavBar }           from './ui/NavBar.js';
import { PrologueScene }    from './narrative/scenes/PrologueScene.js';
import { ActOneScene }      from './narrative/scenes/ActOneScene.js';
import { ActTwoScene }      from './narrative/scenes/ActTwoScene.js';
import { ActThreeScene }    from './narrative/scenes/ActThreeScene.js';
import { EpilogueScene }    from './narrative/scenes/EpilogueScene.js';

const subtitle   = new SubtitleOverlay('subtitle-text');
const sidePanel  = new SidePanel();
const controls   = new Controls();
const navbar     = new NavBar();
const heatmap    = new HeatmapRenderer();
const points     = new PointsRenderer();
const overlay    = new OverlayRenderer();
const bestResults = {};

const sharedDeps = { subtitle, sidePanel, controls, overlay, heatmap, bestResults };

const sceneManager = new SceneManager();
const epilogue = new EpilogueScene({ ...sharedDeps, sceneManager });
sharedDeps.sceneManager = sceneManager;

sceneManager.scenes = [
  new PrologueScene(sharedDeps),
  new ActOneScene(sharedDeps),
  new ActTwoScene(sharedDeps),
  new ActThreeScene(sharedDeps),
  epilogue,
];

const state = { seed: 42, speed: 1 };
sceneManager.setState(state);

navbar.onNext = () => {
  if (sceneManager.next()) navbar.update(sceneManager.currentIndex, sceneManager.total);
};
navbar.onPrev = () => {
  if (sceneManager.prev()) navbar.update(sceneManager.currentIndex, sceneManager.total);
};
controls.onSpeed = v => { state.speed = v; };

let lastTime = 0;

new p5(function(p) {
  p.setup = function() {
    const container = document.getElementById('canvas-container');
    p.createCanvas(container.offsetWidth, container.offsetHeight).parent('canvas-container');
    p.frameRate(30);
    heatmap.precompute(p, p.width, p.height);
    sceneManager.goto(0);
    navbar.update(0, sceneManager.total);

    window.addEventListener('resize', () => {
      const c = document.getElementById('canvas-container');
      p.resizeCanvas(c.offsetWidth, c.offsetHeight);
      heatmap.precompute(p, p.width, p.height);
    });
  };

  p.draw = function() {
    const now = p.millis();
    const dt = now - lastTime;
    lastTime = now;

    sceneManager.update(dt);

    p.background(7, 16, 10);
    heatmap.draw(p);

    const scene = sceneManager.current;

    if (scene?.name === 'prologue') {
      scene.drawExtra?.(p);
    } else {
      const pop = scene?.getPopulation?.();
      const algo = scene?.getAlgo?.();

      let deHighlight = null;
      if (scene?.name === 'act3') {
        const idx = scene.getHighlightIdx?.();
        if (algo?.stepInfo?.[idx]) deHighlight = algo.stepInfo[idx];
      }

      points.draw(p, pop, { deHighlight });

      if (scene?.name === 'act2') {
        overlay.drawEllipse(p, algo);
      }
      if (scene?.name === 'act3' && deHighlight) {
        overlay.drawArrows(p, algo?.stepInfo, scene.getHighlightIdx?.());
      }
      if (scene?.name === 'epilogue') {
        const pulse = scene.getPulse?.() ?? 0;
        const cx = p.width / 2, cy = p.height / 2;
        const r = 12 + Math.sin(pulse) * 4;
        p.noStroke();
        p.fill(255, 209, 102, 50 + Math.sin(pulse) * 30);
        p.ellipse(cx, cy, r * 3.5, r * 3.5);
        p.fill(255, 209, 102, 240);
        p.ellipse(cx, cy, r, r);
      }
    }
  };

  p.mouseMoved = function() {
    const scene = sceneManager.current;
    if (scene?.name !== 'act1') return;
    const algo = scene?.getAlgo?.();
    if (!algo?.population) return;
    const pop = algo.population.individuals;
    let closest = -1, minD = 400;
    for (let i = 0; i < pop.length; i++) {
      const { cx, cy } = { cx: p.width * (pop[i].x + 5.12) / 10.24, cy: p.height * (1 - (pop[i].y + 5.12) / 10.24) };
      const d = Math.sqrt((p.mouseX - cx) ** 2 + (p.mouseY - cy) ** 2);
      if (d < minD) { minD = d; closest = i; }
    }
    if (closest >= 0) {
      points.drawMutationCircle(p, pop[closest], algo.sigma);
    }
  };
});

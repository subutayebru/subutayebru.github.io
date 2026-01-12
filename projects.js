window.PROJECTS = [
  {
    title: "VLA Franka (MuJoCo) — Language-to-action manipulation",
    blurb: "A lightweight pipeline to run a VLA model for pick-and-place in simulation with safety checks + logging.",
    image: "assets/projects/vla-franka.jpg",
    imageAlt: "VLA Franka demo thumbnail",
    tags: ["VLA", "Robot Learning", "MuJoCo", "Python"],
    links: [
      { label: "Repo", url: "https://github.com/subutayebru/vla-franka" }
    ],
    bullets: [
      "Vision → instruction → action loop",
      "PID/IK integration + diagnostics HUD",
      "Dockerized environment for reproducibility"
    ]
  },
  {
    title: "SLAM25 / 3D Computer Vision Toolbox",
    blurb: "Stereo depth, BEV, SfM, and vSLAM experiments with reproducible scripts.",
    image: "assets/projects/slam25.jpg",
    imageAlt: "Point cloud / SLAM visualization thumbnail",
    tags: ["Stereo", "SfM", "SLAM", "OpenCV", "Open3D"],
    links: [
      { label: "Repo", url: "https://github.com/subutayebru/3DCV" }
    ],
    bullets: [
      "KITTI experiments (depth, distance estimation)",
      "Point cloud visualizations + videos",
      "Notebooks → scripts"
    ]
  }
];

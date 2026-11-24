const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ffmpeg = 'C:\\Users\\PC\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.1-full_build\\bin\\ffmpeg.exe';

const publicVideosDir = path.join(__dirname, '..', 'public', 'videos');
const clipsDir = path.join(publicVideosDir, 'clips');
const tempDir = path.join(__dirname, '..', '.video-temp');

if (!fs.existsSync(publicVideosDir)) fs.mkdirSync(publicVideosDir, { recursive: true });
if (!fs.existsSync(clipsDir)) fs.mkdirSync(clipsDir, { recursive: true });
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

// Specific clips and their best duration/offsets
const scenes = [
  { file: '12770728_1920_1080_30fps.mp4', start: 1, dur: 7 },
  { file: '13020377-hd_1920_1080_30fps.mp4', start: 2, dur: 7 },
  { file: '15105578_3364_1440_24fps.mp4', start: 5, dur: 7 },
  { file: '17523887_3840_2160_60fps.mp4', start: 0, dur: 5 },
  { file: '19578125-uhd_3840_2160_30fps.mp4', start: 2, dur: 7 },
  { file: '4683883-hd_1920_1080_25fps.mp4', start: 1, dur: 7 },
  { file: '4684807-hd_1920_1080_25fps.mp4', start: 1, dur: 7 },
  { file: '5636708-hd_1920_1080_30fps.mp4', start: 2, dur: 7 },
  { file: '8659129-hd_1920_1080_30fps.mp4', start: 0, dur: 6 },
];

console.log('Step 1: Normalizing individual clips to 1080p 30fps web format...');

const normalizedClips = [];

scenes.forEach((sc, idx) => {
  const outClip = path.join(clipsDir, `scene-${idx + 1}.mp4`);
  const tempClip = path.join(tempDir, `norm-${idx + 1}.mp4`);
  
  // Scale and center-crop to 1920x1080, 30fps, no audio
  const filter = 'scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30';
  const cmd = `"${ffmpeg}" -y -ss ${sc.start} -t ${sc.dur} -i "${sc.file}" -vf "${filter}" -c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p -an "${tempClip}"`;
  
  console.log(`Processing scene ${idx + 1}/${scenes.length} (${sc.file})...`);
  execSync(cmd, { stdio: 'inherit' });
  
  // Copy to clips directory for standalone random-playback
  fs.copyFileSync(tempClip, outClip);
  normalizedClips.push(tempClip);
});

console.log('Step 2: Merging all 9 scenes with 1.0s cross-dissolve (xfade) transitions...');

// Build xfade filtergraph for all 9 clips
// Each clip is ~sc.dur seconds. Crossfade duration = 1.0s.
// Offset for transition i is sum(durations[0..i]) - i * transitionDuration
let filterComplex = '';
let currentOffset = 0;
const transitionDur = 1.0;

// Inputs list: -i norm-1.mp4 -i norm-2.mp4 ...
const inputs = normalizedClips.map(c => `-i "${c}"`).join(' ');

// Build filter graph
// [0:v][1:v]xfade=transition=fade:duration=1:offset=6[v01];
// [v01][2:v]xfade=transition=fade:duration=1:offset=12[v02]; ...
let prevTag = '[0:v]';
currentOffset = scenes[0].dur - transitionDur;

for (let i = 1; i < scenes.length; i++) {
  const nextTag = i === scenes.length - 1 ? '[vfinal]' : `[v0${i}]`;
  filterComplex += `${prevTag}[${i}:v]xfade=transition=fade:duration=${transitionDur}:offset=${currentOffset.toFixed(2)}${nextTag};`;
  prevTag = nextTag;
  currentOffset += (scenes[i].dur - transitionDur);
}

// Remove trailing semicolon
if (filterComplex.endsWith(';')) {
  filterComplex = filterComplex.slice(0, -1);
}

const masterOutput = path.join(publicVideosDir, 'hero-farm-loop.mp4');
const mergeCmd = `"${ffmpeg}" -y ${inputs} -filter_complex "${filterComplex}" -map "[vfinal]" -c:v libx264 -preset medium -crf 22 -movflags +faststart -pix_fmt yuv420p -an "${masterOutput}"`;

console.log('Executing master stitch with xfade...');
execSync(mergeCmd, { stdio: 'inherit' });

const stats = fs.statSync(masterOutput);
console.log(`Master loop completed successfully! File size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
console.log(`Output path: ${masterOutput}`);

// Clean temp directory
fs.rmSync(tempDir, { recursive: true, force: true });

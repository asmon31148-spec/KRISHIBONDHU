const { execSync } = require('child_process');
const fs = require('fs');

const ffprobe = 'C:\\Users\\PC\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.1-full_build\\bin\\ffprobe.exe';
const files = fs.readdirSync('.').filter(f => f.endsWith('.mp4'));

console.log('Found video files:', files.length);
for (const f of files) {
  try {
    const cmd = `"${ffprobe}" -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,duration -show_entries format=duration -of json "${f}"`;
    const res = JSON.parse(execSync(cmd).toString());
    const stream = res.streams?.[0] || {};
    const duration = res.format?.duration || stream.duration;
    console.log(`${f} | ${stream.width}x${stream.height} | ${stream.r_frame_rate} fps | ${parseFloat(duration).toFixed(1)}s`);
  } catch (err) {
    console.error(f, err.message);
  }
}

// Remplace les icônes de lanceur Android par celles de Magnésie
const A=require('./www/anim.js');
const sharp=require('sharp');
const R='android/app/src/main/res/';
const C={near:'#FFFFFF',far:'#C9CFDA',prop:'#C9CFDA',ground:'#FF6B97',bg:'#10131C',accent:'#FF6B97'};
const D=A.duration('lsit');
const fig=A.frameSVG('lsit',D*0.55,C);
function svg(size,scale,bg,round){
  const s=size*scale/100, ox=-84*s+(size-100*s)/2, oy=-64*s+(size-100*s)/2;
  const clip=round?`<clipPath id="c"><circle cx="${size/2}" cy="${size/2}" r="${size/2}"/></clipPath>`:'';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">${clip}<g ${round?'clip-path="url(#c)"':''}>${bg?`<rect width="100%" height="100%" fill="#10131C"/>`:''}<g transform="translate(${ox},${oy}) scale(${s})">${fig}</g></g></svg>`;
}
const dens={mdpi:1,hdpi:1.5,xhdpi:2,xxhdpi:3,xxxhdpi:4};
(async()=>{
  for(const [d,m] of Object.entries(dens)){
    const dir=R+'mipmap-'+d+'/';
    await sharp(Buffer.from(svg(48*m,0.85,true,false))).png().toFile(dir+'ic_launcher.png');
    await sharp(Buffer.from(svg(48*m,0.85,true,true))).png().toFile(dir+'ic_launcher_round.png');
    await sharp(Buffer.from(svg(108*m,0.55,false,false))).png().toFile(dir+'ic_launcher_foreground.png');
  }
  require('fs').writeFileSync(R+'values/ic_launcher_background.xml','<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#10131C</color>\n</resources>\n');
  console.log('android icons ok');
})();

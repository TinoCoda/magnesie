// Génère les icônes à partir du moteur d'animation (figure en L-sit sur fond marine)
const A=require('./www/anim.js');
const sharp=require('sharp');
const C={near:'#FFFFFF',far:'#C9CFDA',prop:'#C9CFDA',ground:'#FF6B97',bg:'#10131C',accent:'#FF6B97'};
const D=A.duration('lsit');
function icon(size,pad){
  const inner=A.frameSVG('lsit',D*0.55,C);
  const s=(size*(1-2*pad))/100;
  const ox=-84*s+(size-100*s)/2, oy=-64*s+(size-100*s)/2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="100%" height="100%" fill="#10131C"/><g transform="translate(${ox},${oy}) scale(${s})">${inner}</g></svg>`;
}
(async()=>{
  await sharp(Buffer.from(icon(192,0.10))).png().toFile('www/icon-192.png');
  await sharp(Buffer.from(icon(512,0.10))).png().toFile('www/icon-512.png');
  await sharp(Buffer.from(icon(512,0.22))).png().toFile('www/icon-maskable-512.png');
  await sharp(Buffer.from(icon(1024,0.12))).png().toFile('icon-source.png');
  console.log('icons ok');
})();

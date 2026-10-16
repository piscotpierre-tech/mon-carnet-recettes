// Asset preparation only; sharp is a development tool, never an application dependency.
// Run with sharp available to Node (for example via NODE_PATH).
const sharp=require('sharp');
const {mkdir,writeFile}=require('node:fs/promises');
const {resolve}=require('node:path');
const root=resolve(__dirname,'..');
(async()=>{
 const image=async name=>(await sharp(resolve(root,'assets/atelier/'+name+'.webp')).png().toBuffer()).toString('base64');
 const cover=await image('cover-bottom'),pot=await image('pot');
 // All essential artwork fits inside the Android safe circle (radius 204.8).
 // The approved cover and cocotte are reused without redrawing them.
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" viewBox="0 0 512 512">
 <rect width="512" height="512" fill="#498891"/>
 <image x="-78" y="0" width="669" height="512" xlink:href="data:image/png;base64,${cover}"/>
 <circle cx="256" cy="256" r="196" fill="#f4e8cb" stroke="#273d48" stroke-width="4"/>
 <circle cx="256" cy="256" r="185" fill="none" stroke="#ae9b72" stroke-width="2"/>
 <image x="96" y="154" width="320" height="204" xlink:href="data:image/png;base64,${pot}"/>
 </svg>`;
 await mkdir(resolve(root,'assets/icons'),{recursive:true});
 for(const [name,size] of [['icon-512',512],['icon-192',192],['apple-touch-icon',180],['favicon-32',32]]){
  await sharp(Buffer.from(svg)).resize(size,size).flatten({background:'#498891'}).removeAlpha().png().toFile(resolve(root,'assets/icons/'+name+'.png'));
 }
})().catch(error=>{console.error(error);process.exitCode=1;});

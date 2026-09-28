import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { HeroFallbackArtwork } from './NexusHeroFallback'
import { CARD, HERO_REALMS, HERO_WORLD, OPERATIVE, OPERATIVE_CONTACTS, heroView, realmPoints, type HeroSceneProps } from './NexusHeroLayout'

/** React owns semantics; Three owns all visual planes and projects their hit polygons. */
export default function NexusHeroScene({theme,onSelect,selected}:HeroSceneProps) {
  const wrapRef=useRef<HTMLDivElement>(null)
  const svgRef=useRef<SVGSVGElement>(null)
  const canvasRef=useRef<HTMLCanvasElement>(null)
  const activeRef=useRef(-1)
  const invalidateRef=useRef<()=>void>(()=>{})
  const [ready,setReady]=useState(false)
  const themeRef=useRef(theme)
  useEffect(()=>{themeRef.current=theme;invalidateRef.current()},[theme])
  useLayoutEffect(()=>{
    const svg=svgRef.current!,wrap=wrapRef.current!
    const resize=()=>{const {width,height}=wrap.getBoundingClientRect();if(!width||!height)return;const v=heroView(width,height);svg.setAttribute('viewBox',`${v.x} ${v.y} ${v.width} ${v.height}`)}
    resize()
    const observer=new ResizeObserver(resize);observer.observe(wrap)
    return()=>observer.disconnect()
  },[])
  const activate=(index:number)=>{activeRef.current=index;invalidateRef.current()}
  useEffect(()=>{
    const wrap=wrapRef.current!,svg=svgRef.current!,canvas=canvasRef.current!
    let disposed=false,lost=false,visible=true,frame=0,last=0,px=0,py=0,cx=0,cy=0
    const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(pointer:fine)')
    const scene=new THREE.Scene()
    const camera=new THREE.OrthographicCamera(0,1875,839,0,.1,2000)
    camera.position.z=1000
    let view=heroView(1875,839)
    const polygons=Array.from(svg.querySelectorAll<SVGPolygonElement>('.fh-realm-hit'))
    let renderer:THREE.WebGLRenderer|undefined
    const geometries:THREE.BufferGeometry[]=[],materials:THREE.Material[]=[],textures:THREE.Texture[]=[]
    const loader=new THREE.TextureLoader()
    function mesh(geometry:THREE.BufferGeometry,material:THREE.Material,parent:THREE.Object3D=scene){geometries.push(geometry);materials.push(material);const m=new THREE.Mesh(geometry,material);parent.add(m);return m}
    function texture(url:string){return loader.loadAsync(url).then(t=>{if(disposed){t.dispose();throw new Error('disposed')}t.colorSpace=THREE.SRGBColorSpace;textures.push(t);return t})}
    function invalidate(){if(!frame&&!disposed&&!lost&&visible&&!document.hidden&&renderer){last=performance.now()-16;frame=requestAnimationFrame(render)}}
    invalidateRef.current=invalidate
    function resize(){const {width,height}=wrap.getBoundingClientRect();if(!width||!height)return;view=heroView(width,height);svg.setAttribute('viewBox',`${view.x} ${view.y} ${view.width} ${view.height}`);camera.left=view.x;camera.right=view.x+view.width;camera.top=839-view.y;camera.bottom=839-view.y-view.height;camera.updateProjectionMatrix();renderer?.setPixelRatio(Math.min(devicePixelRatio, width<860?1.5:2));renderer?.setSize(width,height,false);invalidate()}
    const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(wrap);resize()
    try {renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance',preserveDrawingBuffer:false});renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0x000000,0)} catch {return()=>resizeObserver.disconnect()}
    scene.add(new THREE.AmbientLight(0xffffff,2))
    const rimLight=new THREE.DirectionalLight(0xff443d,3);rimLight.position.set(900,700,700);scene.add(rimLight)
    const themeBlend={value:themeRef.current==='light'?1:0}
    const darkEnvironment={value:null as THREE.Texture|null},lightEnvironment={value:null as THREE.Texture|null}
    const background=mesh(new THREE.PlaneGeometry(1875,839),new THREE.ShaderMaterial({
      uniforms:{darkEnvironment,lightEnvironment,themeBlend},depthWrite:false,toneMapped:false,
      vertexShader:`varying vec2 imageUv;void main(){imageUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader:`uniform sampler2D darkEnvironment;uniform sampler2D lightEnvironment;uniform float themeBlend;varying vec2 imageUv;
        void main(){gl_FragColor=mix(texture2D(darkEnvironment,imageUv),texture2D(lightEnvironment,imageUv),themeBlend);
          #include <colorspace_fragment>
        }`
    }));background.position.set(937.5,419.5,-30)
    const pending:Promise<unknown>[]=[]
    const portalUniforms={darkEnvironment,lightEnvironment,themeBlend,clock:{value:0},charge:{value:0},center:{value:new THREE.Vector2(HERO_WORLD.portalX,839-HERO_WORLD.portalY)}}
    // Both themes stay resident; switches never dispose or reload scene layers.
    pending.push(Promise.allSettled(['dark','light'].map(name=>texture(`/hero_${name}.png`).then(t=>{
      if(name==='dark')darkEnvironment.value=t;else lightEnvironment.value=t
      if(!darkEnvironment.value)darkEnvironment.value=t
      if(!lightEnvironment.value)lightEnvironment.value=t
      invalidate()
    }))).then(()=>{if(!darkEnvironment.value&&!lightEnvironment.value)throw new Error('Hero environments unavailable')}))
    const groups:THREE.Group[]=[],depths=HERO_REALMS.map(()=>0),cardRims:THREE.MeshStandardMaterial[]=[],cardGlows:THREE.ShaderMaterial[]=[],cardGlass:{value:number}[]=[]
    function roundedShape(w:number,h:number,r:number){const s=new THREE.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s}
    HERO_REALMS.forEach((realm,i)=>{
      const group=new THREE.Group();group.position.set(realm.x,839-realm.y,15);group.rotation.z=-realm.angle*Math.PI/180;scene.add(group);groups.push(group)
      const rim=new THREE.MeshStandardMaterial({color:0x24131a,metalness:.72,roughness:.23,transparent:true,opacity:.94,emissive:0x7a0b18,emissiveIntensity:.35});cardRims.push(rim)
      mesh(new THREE.ExtrudeGeometry(roundedShape(CARD.width+4,CARD.height+4,9),{depth:7,bevelEnabled:true,bevelSize:1,bevelThickness:1,bevelSegments:2,steps:1}),rim,group)
      const haloMaterial=new THREE.ShaderMaterial({uniforms:{hover:{value:0},size:{value:new THREE.Vector2(CARD.width,CARD.height)}},transparent:true,depthWrite:false,
        vertexShader:`varying vec2 haloUv;void main(){haloUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
        fragmentShader:`uniform float hover;uniform vec2 size;varying vec2 haloUv;
          float roundedBox(vec2 p,vec2 b){vec2 q=abs(p)-b+9.0;return length(max(q,0.0))+min(max(q.x,q.y),0.0)-9.0;}
          void main(){vec2 p=(haloUv-.5)*(size+vec2(56.0));float edge=roundedBox(p,size*.5);
            float shadowDistance=roundedBox(p-vec2(3.0,-6.0-hover*3.0),size*.5);
            float shadow=(1.0-smoothstep(-3.0,23.0,shadowDistance))*(.30+hover*.20);
            float glow=exp(-abs(edge-1.0)/5.0)*(.16+hover*.28);
            float fade=1.0-smoothstep(19.0,27.0,edge);
            float alpha=(shadow+glow)*fade;
            gl_FragColor=vec4(mix(vec3(.015,.004,.008),vec3(.8,.018,.035),glow/max(.001,shadow+glow)),alpha);
            #include <colorspace_fragment>
          }`})
      cardGlows.push(haloMaterial)
      const halo=mesh(new THREE.PlaneGeometry(CARD.width+56,CARD.height+56),haloMaterial,group);halo.position.z=-2
      // Reflections affect the artwork only; the label band remains a crisp print layer.
      const glassHover={value:0};cardGlass.push(glassHover)
      const faceMaterial=new THREE.MeshBasicMaterial({transparent:true,depthWrite:true})
      faceMaterial.onBeforeCompile=shader=>{
        shader.uniforms.glassHover=glassHover;shader.uniforms.darkEnvironment=darkEnvironment;shader.uniforms.lightEnvironment=lightEnvironment;shader.uniforms.themeBlend=themeBlend
        shader.vertexShader='varying vec2 glassWorld;\n'+shader.vertexShader
        shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nglassWorld=(modelMatrix*vec4(position,1.0)).xy;')
        shader.fragmentShader='uniform float glassHover;uniform sampler2D darkEnvironment;uniform sampler2D lightEnvironment;uniform float themeBlend;varying vec2 glassWorld;\n'+shader.fragmentShader
        shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`
          #include <map_fragment>
          #ifdef USE_MAP
          if(vMapUv.y>0.275){
            vec2 envUv=glassWorld/vec2(1875.0,839.0),blur=vec2(.004,.006);
            vec3 darkGlass=(texture2D(darkEnvironment,envUv+blur).rgb+texture2D(darkEnvironment,envUv-blur).rgb)*.5;
            vec3 lightGlass=(texture2D(lightEnvironment,envUv+blur).rgb+texture2D(lightEnvironment,envUv-blur).rgb)*.5;
            diffuseColor.rgb=mix(diffuseColor.rgb,mix(darkGlass,lightGlass,themeBlend)*.55,.065);
            float reflection=pow(max(0.0,1.0-abs(vMapUv.x*.72+vMapUv.y-.98-glassHover*.1)*2.8),5.0);
            diffuseColor.rgb+=vec3(.12,.045,.048)*reflection*(.3+glassHover*.35);
            float innerHighlight=smoothstep(.955,.99,vMapUv.y)*.06;
            diffuseColor.rgb+=vec3(innerHighlight);
          }
          #endif
        `)
      }
      // Keep the printed face clear of the bevel (which ends at z=8), preventing z-fighting.
      const face=mesh(new THREE.PlaneGeometry(CARD.width,CARD.height),faceMaterial,group);face.position.z=11
      const art=document.createElement('canvas');art.width=762;art.height=396
      const ctx=art.getContext('2d')!
      const draw=(image?:HTMLImageElement)=>{
        if(disposed)return
        ctx.clearRect(0,0,762,396);ctx.save();ctx.beginPath();ctx.roundRect(0,0,762,396,22);ctx.clip();ctx.fillStyle='#241018';ctx.fillRect(0,0,762,396)
        if(image){
          // Cover the full art window using its clean artwork region (excluding baked labels).
          const artHeight=image.height*.6,scale=Math.max(762/image.width,292/artHeight)
          const sw=762/scale,sh=292/scale
          ctx.drawImage(image,(image.width-sw)/2,Math.max(0,(artHeight-sh)*.35),sw,sh,0,0,762,292)
        }
        const gradient=ctx.createLinearGradient(0,190,0,396);gradient.addColorStop(0,'#07070a00');gradient.addColorStop(.6,'#07070abf');gradient.addColorStop(1,'#07070af5');ctx.fillStyle=gradient;ctx.fillRect(0,0,762,396)
        ctx.fillStyle='#08080b';ctx.fillRect(0,292,762,104);ctx.fillStyle='#fff';ctx.font='bold 56px Arial';ctx.textBaseline='middle';ctx.fillText(realm.name,68,339);ctx.fillStyle='#ff5c63';ctx.fillRect(27,318,9,42);ctx.restore();ctx.strokeStyle='#f27279';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(3,3,756,390,20);ctx.stroke()
        const t=new THREE.CanvasTexture(art);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer!.capabilities.getMaxAnisotropy());textures.push(t);const m=face.material as THREE.MeshBasicMaterial;m.map=t;m.needsUpdate=true;invalidate()
      }
      draw()
      pending.push(new Promise<void>(resolve=>{const image=new Image();image.onload=()=>{draw(image);resolve()};image.onerror=()=>resolve();image.src=`/realms/${realm.slug}.jpg`}))
      polygons[i].setAttribute('points',realmPoints(i))
    })
    const contactCanvas=document.createElement('canvas');contactCanvas.width=contactCanvas.height=64
    const contactContext=contactCanvas.getContext('2d')!,contactGradient=contactContext.createRadialGradient(32,32,0,32,32,32)
    contactGradient.addColorStop(0,'#08030499');contactGradient.addColorStop(.45,'#08030455');contactGradient.addColorStop(1,'#08030400')
    contactContext.fillStyle=contactGradient;contactContext.fillRect(0,0,64,64)
    const contactMap=new THREE.CanvasTexture(contactCanvas);textures.push(contactMap)
    OPERATIVE_CONTACTS.forEach(anchor=>{
      const shadow=mesh(new THREE.PlaneGeometry(anchor.width,anchor.height),new THREE.MeshBasicMaterial({map:contactMap,transparent:true,depthWrite:false}))
      shadow.position.set(anchor.x,839-anchor.y,64)
    })
    // Split the raster in UV space: only the loose left skirt is deformable.
    // The shoulder, logo, arms and both legs remain on the untouched body plane.
    const capeClock={value:0},capeMotion={value:reduced.matches?0:1}
    function operativeMaterial(cape:boolean){
      const material=new THREE.MeshBasicMaterial({transparent:true,depthWrite:false})
      material.customProgramCacheKey=()=>cape?'fh-loose-cape-v1':'fh-pinned-body-v1'
      material.onBeforeCompile=shader=>{
        shader.uniforms.capeClock=capeClock;shader.uniforms.capeMotion=capeMotion
        shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`
          #include <map_fragment>
          #ifdef USE_MAP
          // Matching hard masks avoid a double image or alpha seam at rest.
          bool looseCape = vMapUv.x < 0.5 && vMapUv.y > 0.1875 && vMapUv.y < 0.5625;
          if (${cape?'!looseCape':'looseCape'}) discard;
          #endif
        `)
        if(cape){
          shader.vertexShader='uniform float capeClock;\nuniform float capeMotion;\n'+shader.vertexShader
          shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`
            #include <begin_vertex>
            // A wide fixed seam keeps deformation away from the body and boots.
            float freeEdge = pow(1.0 - smoothstep(0.06, 0.45, uv.x), 0.8);
            float pinnedHem = smoothstep(0.1875, 0.235, uv.y);
            float pinnedShoulder = 1.0 - smoothstep(0.44, 0.5625, uv.y);
            float weight = freeEdge * pinnedHem * pinnedShoulder * capeMotion;
            float t = capeClock * 1.8;
            // Traveling folds vary independently; the loose tips catch the gusts.
            float breeze = 0.5 + 0.5 * sin(t * 0.43 - 1.5708);
            float gust = pow(max(0.0, sin(t * 0.31 + 0.65 * sin(t * 0.17))), 4.0);
            float strength = (0.72 + 0.28 * breeze + 0.5 * gust) * smoothstep(0.0, 1.4, t);
            float phase = t * 1.35 + uv.x * 8.0 - uv.y * 7.0 + 0.3 * sin(t * 0.37);
            float wave = sin(phase);
            float fold = sin(t * 2.13 - uv.x * 13.0 + uv.y * 8.0);
            float trailingFold = sin(t * 1.02 + uv.x * 5.0 + uv.y * 11.0);
            float lowerFabric = 1.0 - smoothstep(0.25, 0.43, uv.y);
            transformed.x += weight * strength * (8.4 * wave + 2.1 * fold + 2.4 * lowerFabric * trailingFold);
            transformed.y += weight * strength * (12.0 * sin(phase + 0.65) + 2.6 * fold + 3.6 * lowerFabric * trailingFold);
            transformed.z += weight * strength * (3.5 * wave + 0.9 * fold);
          `)
        }
      }
      return material
    }
    const bodyMaterial=operativeMaterial(false),capeMaterial=operativeMaterial(true)
    const operative=mesh(new THREE.PlaneGeometry(OPERATIVE.width,OPERATIVE.height),bodyMaterial);operative.position.set(OPERATIVE.x+OPERATIVE.width/2,839-OPERATIVE.y-OPERATIVE.height/2,65)
    const cape=mesh(new THREE.PlaneGeometry(OPERATIVE.width,OPERATIVE.height,64,96),capeMaterial);cape.position.copy(operative.position)
    // Fixed ordering prevents the shallow fabric folds changing transparent sorting.
    cape.renderOrder=1;operative.renderOrder=2
    pending.push(texture('/fh-operative.png').then(t=>{bodyMaterial.map=capeMaterial.map=t;bodyMaterial.needsUpdate=capeMaterial.needsUpdate=true}))
    // Re-sample only the portal interior: its own painted energy flows beneath
    // volumetric wisps, while the surrounding architecture remains untouched.
    const portalMaterial=new THREE.ShaderMaterial({
      uniforms:portalUniforms,transparent:true,depthWrite:false,toneMapped:false,
      vertexShader:`varying vec2 surfaceUv;
        void main(){surfaceUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader:`
        uniform sampler2D darkEnvironment;uniform sampler2D lightEnvironment;uniform float themeBlend;uniform float clock;uniform float charge;uniform vec2 center;
        varying vec2 surfaceUv;
        float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
          return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
        float cloud(vec2 p){float n=0.0,w=0.55;for(int i=0;i<4;i++){n+=w*noise(p);p=mat2(1.6,-1.2,1.2,1.6)*p+3.7;w*=0.5;}return n;}
        void main(){
          vec2 p=(surfaceUv-0.5)*2.0;float r=length(p);
          float mask=1.0-smoothstep(0.86,1.0,r);if(mask<=0.0)discard;
          float angle=clock*0.065*(1.0-smoothstep(0.65,1.0,r));
          mat2 rotation=mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
          vec2 flowing=rotation*p;
          vec2 environmentUv=(center+flowing*208.0)/vec2(1875.0,839.0);
          vec3 original=mix(texture2D(darkEnvironment,environmentUv).rgb,texture2D(lightEnvironment,environmentUv).rgb,themeBlend);
          // Broad, curved, turbulent sheets rather than outlined circles.
          float twist=2.8*r-clock*0.085;
          vec2 q=mat2(cos(twist),-sin(twist),sin(twist),cos(twist))*p;
          float deep=cloud(q*3.6+vec2(clock*0.032,-clock*0.024));
          float folds=cloud(q*7.0+vec2(deep*2.8,clock*0.058));
          float wisps=pow(smoothstep(0.37,0.78,folds),2.4);
          float veins=pow(max(0.0,1.0-abs(folds-0.53)*13.0),4.0)*smoothstep(0.35,0.72,deep);
          float breath=0.94+0.06*sin(clock*0.85);
          vec3 energy=vec3(0.7,0.008,0.016)*wisps*0.57+vec3(1.0,0.075,0.035)*veins*0.30;
          vec3 color=original*(0.87+deep*0.28)+energy*(breath+charge*0.35);
          color+=vec3(1.0,0.2,0.12)*exp(-r*r*60.0)*(0.05+0.025*sin(clock*0.85));
          gl_FragColor=vec4(color,mask*0.94);
          #include <colorspace_fragment>
        }`
    })
    const portalSurface=mesh(new THREE.PlaneGeometry(416,416),portalMaterial);portalSurface.position.set(HERO_WORLD.portalX,839-HERO_WORLD.portalY,1)
    const glowCanvas=document.createElement('canvas');glowCanvas.width=glowCanvas.height=128;const g=glowCanvas.getContext('2d')!;const glow=g.createRadialGradient(64,64,0,64,64,64);glow.addColorStop(0,'#fff8eccc');glow.addColorStop(.15,'#ff536a99');glow.addColorStop(1,'#ff153000');g.fillStyle=glow;g.fillRect(0,0,128,128);const glowMap=new THREE.CanvasTexture(glowCanvas);textures.push(glowMap)
    const core=mesh(new THREE.PlaneGeometry(110,110),new THREE.MeshBasicMaterial({map:glowMap,transparent:true,opacity:.3,depthWrite:false,blending:THREE.AdditiveBlending}));core.position.set(HERO_WORLD.portalX,839-HERO_WORLD.portalY,2)
    // Camera-facing ribbons provide actual width on every WebGL implementation.
    // A white-hot irregular core, crimson sheath and soft halo share one path.
    function boltRibbon(segments:number){
      const geometry=new THREE.BufferGeometry(),positions=new THREE.Float32BufferAttribute(new Float32Array((segments+1)*6),3),uvs=[],indices=[]
      positions.setUsage(THREE.DynamicDrawUsage)
      for(let i=0;i<=segments;i++){uvs.push(0,i/segments,1,i/segments);if(i<segments){const k=i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2)}}
      geometry.setAttribute('position',positions);geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices)
      const material=new THREE.ShaderMaterial({uniforms:{intensity:{value:0}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,toneMapped:false,
        vertexShader:`varying vec2 boltUv;void main(){boltUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
        fragmentShader:`uniform float intensity;varying vec2 boltUv;void main(){
          float d=abs(boltUv.x*2.0-1.0);
          float hot=exp(-d*d*155.0),sheath=exp(-d*d*21.0),halo=pow(1.0-d,2.3);
          vec3 light=vec3(1.0,0.72,0.58)*hot*1.9+vec3(1.0,0.028,0.045)*sheath*1.02+vec3(0.7,0.001,0.009)*halo*0.76;
          gl_FragColor=vec4(light,intensity);
          #include <colorspace_fragment>
        }`})
      const ribbon=mesh(geometry,material);ribbon.frustumCulled=false;ribbon.visible=false
      return {ribbon,positions,material,segments,path:Array.from({length:segments+1},()=>new THREE.Vector3())}
    }
    const bolt=boltRibbon(28),branches=[boltRibbon(7),boltRibbon(6),boltRibbon(7)]
    function writeRibbon(r:ReturnType<typeof boltRibbon>,width:number,taper:boolean){
      for(let i=0;i<=r.segments;i++){
        const p=r.path[i],before=r.path[Math.max(0,i-1)],after=r.path[Math.min(r.segments,i+1)],dx=after.x-before.x,dy=after.y-before.y,length=Math.hypot(dx,dy)||1
        const w=width*(.78+.22*Math.sin(i*2.3))*(taper?1-i/(r.segments+1):1)
        r.positions.setXYZ(i*2,p.x-dy/length*w,p.y+dx/length*w,p.z)
        r.positions.setXYZ(i*2+1,p.x+dy/length*w,p.y-dx/length*w,p.z)
      }
      r.positions.needsUpdate=true
    }
    const impact=mesh(new THREE.PlaneGeometry(76,76),new THREE.MeshBasicMaterial({map:glowMap,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));impact.visible=false
    const origin=new THREE.Vector3(HERO_WORLD.portalX,839-HERO_WORLD.portalY,4),endpoint=new THREE.Vector3(),localOrigin=new THREE.Vector3()
    let energyTime=0,connection=-1,connectionPower=0,connectionAge=0,previousActive=-1
    const random=(seed:number)=>{const n=Math.sin(seed*127.1+311.7)*43758.5453;return n-Math.floor(n)}
    function updateConnection(dt:number){
      const active=activeRef.current,motion=!reduced.matches
      if(active>=0&&active!==previousActive){connection=active;connectionAge=0;connectionPower=0}
      previousActive=active;connectionAge+=dt
      connectionPower+=((active>=0?1:0)-connectionPower)*(motion?1-Math.exp(-dt*(active>=0?28:22)):1)
      const visibleBolt=connection>=0&&connectionPower>.002
      bolt.ribbon.visible=impact.visible=visibleBolt;branches.forEach(b=>{b.ribbon.visible=visibleBolt})
      const strike=motion?Math.exp(-connectionAge*9):0
      cardRims.forEach((rim,i)=>{rim.emissiveIntensity=.35+(i===connection?connectionPower*(1.1+strike*2.4):0)})
      if(!visibleBolt)return
      const group=groups[connection]
      localOrigin.copy(origin);group.worldToLocal(localOrigin)
      const edgeScale=1/Math.max(Math.abs(localOrigin.x)/(CARD.width/2),Math.abs(localOrigin.y)/(CARD.height/2))
      endpoint.set(localOrigin.x*edgeScale,localOrigin.y*edgeScale,13);group.localToWorld(endpoint)
      const dx=endpoint.x-origin.x,dy=endpoint.y-origin.y,length=Math.hypot(dx,dy)||1,nx=-dy/length,ny=dx/length
      const tick=motion?Math.floor(energyTime*19):0,seed=tick*17+connection*43
      // Multi-scale random discharges: no sinusoidal/ECG path and exact endpoints.
      for(let i=0;i<=bolt.segments;i++){
        const t=i/bolt.segments,envelope=Math.pow(Math.sin(Math.PI*t),.65)
        const jag=((random(i*3+seed)-.5)*17+(random(Math.floor(i/4)+seed+81)-.5)*24)*envelope
        bolt.path[i].set(origin.x+dx*t+nx*jag,origin.y+dy*t+ny*jag,origin.z+(endpoint.z-origin.z)*t+Math.sin(Math.PI*t)*8)
      }
      writeRibbon(bolt,14.5,false)
      branches.forEach((branch,b)=>{
        const start=bolt.path[7+b*7],sign=b%2===0?1:-1,reach=23+random(seed+b)*22
        for(let i=0;i<=branch.segments;i++){
          const t=i/branch.segments,jag=(random(seed+i*7+b*31)-.5)*9*Math.sin(Math.PI*t)
          branch.path[i].set(start.x+dx/length*reach*t+nx*(sign*reach*.75*t+jag),start.y+dy/length*reach*t+ny*(sign*reach*.75*t+jag),start.z+t*3)
        }
        writeRibbon(branch,6.8,true);branch.material.uniforms.intensity.value=connectionPower*.78
      })
      const flicker=motion?.68+.32*random(tick*11+connection):1
      bolt.material.uniforms.intensity.value=connectionPower*flicker*(1+strike*.4)
      impact.position.copy(endpoint);impact.position.z+=2;impact.scale.setScalar(.62+strike*.8)
      ;(impact.material as THREE.MeshBasicMaterial).opacity=connectionPower*(.48+strike*.5)*flicker
    }
    // Forty-six staggered flights use perspective projection into the fixed Hero camera.
    // Only leaves change depth; the authored scene framing never changes.
    const leafTextures=[0,1,2].map(layer=>{
      const canvas=document.createElement('canvas');canvas.width=canvas.height=128
      const ctx=canvas.getContext('2d')!
      if(layer===2)ctx.filter='blur(1.2px)'
      const color=ctx.createLinearGradient(26,22,90,106)
      color.addColorStop(0,layer===0?'#74202a':'#c33238');color.addColorStop(.55,'#881a23');color.addColorStop(1,'#361016')
      ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(65,108)
      ctx.bezierCurveTo(51,96,32,100,30,86);ctx.lineTo(13,75);ctx.lineTo(31,70)
      ctx.lineTo(20,47);ctx.lineTo(43,55);ctx.lineTo(39,28);ctx.lineTo(55,39)
      ctx.lineTo(65,10);ctx.lineTo(75,39);ctx.lineTo(92,29);ctx.lineTo(86,56)
      ctx.lineTo(108,45);ctx.lineTo(99,69);ctx.lineTo(116,77);ctx.lineTo(94,86)
      ctx.bezierCurveTo(92,100,77,95,65,108);ctx.closePath();ctx.fill()
      ctx.strokeStyle=layer===0?'#a3433c':'#dc6750';ctx.lineWidth=1.5;ctx.globalAlpha=.65
      ctx.beginPath();ctx.moveTo(65,118);ctx.quadraticCurveTo(62,73,65,25)
      ctx.moveTo(64,85);ctx.lineTo(36,64);ctx.moveTo(64,72);ctx.lineTo(88,52);ctx.moveTo(64,93);ctx.lineTo(92,80);ctx.stroke()
      const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;textures.push(map);return map
    })
    const leaves=Array.from({length:46},(_,i)=>{
      const size=16+random(i+17)*12
      const material=new THREE.MeshBasicMaterial({map:leafTextures[1],transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide})
      const blur={value:0}
      material.onBeforeCompile=shader=>{
        shader.uniforms.leafBlur=blur
        shader.fragmentShader='uniform float leafBlur;\n'+shader.fragmentShader
        shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`
          #ifdef USE_MAP
          vec2 smear=vec2(0.0,leafBlur*0.023);
          vec4 sampledDiffuseColor=texture2D(map,vMapUv)*0.5;
          sampledDiffuseColor+=texture2D(map,vMapUv+smear)*0.25;
          sampledDiffuseColor+=texture2D(map,vMapUv-smear)*0.25;
          diffuseColor*=sampledDiffuseColor;
          #endif
        `)
      }
      const leaf=mesh(new THREE.PlaneGeometry(size,size*1.15),material);leaf.frustumCulled=false
      return {leaf,material,blur,phase:(i*.61803398875)%1,speed:.045+random(i+83)*.025}
    })
    let leafTime=0
    function updateLeaves(dt:number){
      if(!reduced.matches)leafTime+=dt
      leaves.forEach(({leaf,material,blur,phase,speed},i)=>{
        leaf.visible=!reduced.matches
        if(!leaf.visible)return
        const flight=phase+leafTime*speed,cycle=Math.floor(flight),travel=flight-cycle,seed=i*31+cycle*137
        // Constant forward depth becomes natural screen-space acceleration near the lens.
        // The flight crosses the virtual camera at its end; fade hides its respawn.
        const distance=1180-1240*travel,perspective=560/Math.max(75,distance)
        const spreadX=(random(seed+1)-.5)*2050,spreadY=(random(seed+2)-.5)*1080
        const sway=Math.sin(leafTime*(.65+random(seed+3)*.3)+i)*16
        const lift=Math.sin(travel*Math.PI)*32*random(seed+4)
        const x=HERO_WORLD.portalX+(spreadX+sway-travel*28)*perspective
        const y=(839-HERO_WORLD.portalY)+(spreadY+lift)*perspective
        leaf.position.set(x,y,-12+Math.min(1,travel)*105)
        leaf.scale.set(perspective,perspective*(1+.09*THREE.MathUtils.smoothstep(travel,.65,.92)),perspective)
        leaf.rotation.set(Math.sin(leafTime*(1.15+random(seed+5))+i)*1.1,leafTime*(.8+random(seed+6)) + i,leafTime*(.5+random(seed+7)) + i*2)
        const foreground=THREE.MathUtils.smoothstep(travel,.65,.9)
        blur.value=foreground
        material.color.setScalar(.56+.44*THREE.MathUtils.smoothstep(travel,.05,.6))
        const sourceY=839-y,padding=12*perspective
        const bodyDistance=Math.max((OPERATIVE.x-18-padding)-x,x-(OPERATIVE.x+OPERATIVE.width+18+padding),(OPERATIVE.y-12-padding)-sourceY,sourceY-(OPERATIVE.y+OPERATIVE.height+12+padding))
        const bodyClear=THREE.MathUtils.smoothstep(bodyDistance,0,42)
        let cardClear=1
        HERO_REALMS.forEach(realm=>{
          const distance=Math.max(Math.abs(x-realm.x)-CARD.width/2-12-padding,Math.abs(sourceY-realm.y)-CARD.height/2-12-padding)
          cardClear=Math.min(cardClear,.1+.9*THREE.MathUtils.smoothstep(distance,0,36))
        })
        const portalClear=THREE.MathUtils.smoothstep(Math.hypot(x-HERO_WORLD.portalX,sourceY-HERO_WORLD.portalY),155+padding,230+padding)
        const copyDistance=Math.max(75-x,x-690,140-sourceY,sourceY-720)
        const copyClear=.08+.92*THREE.MathUtils.smoothstep(copyDistance,0,60)
        const fade=THREE.MathUtils.smoothstep(travel,0,.06)*(1-THREE.MathUtils.smoothstep(travel,.82,.955))
        material.opacity=(.80-foreground*.17)*fade*bodyClear*cardClear*portalClear*copyClear
        if(distance<=0)leaf.visible=false
      })
    }
    const point=new THREE.Vector3()
    function render(time:number){
      frame=0;if(disposed||lost||!visible||document.hidden)return
      const animate=!reduced.matches&&fine.matches,dt=Math.min(.05,(time-last)/1000);last=time;const damping=animate?1-Math.exp(-dt*10):1
      const tx=animate?px:0,ty=animate?py:0;cx+=(tx-cx)*damping;cy+=(ty-cy)*damping
      let settling=Math.abs(tx-cx)+Math.abs(ty-cy)
      groups.forEach((group,i)=>{const r=HERO_REALMS[i],target=activeRef.current===i?1:0;depths[i]+=(target-depths[i])*damping;settling+=Math.abs(target-depths[i]);const d=depths[i]
        const floatTime=reduced.matches?0:energyTime,phase=i*1.73
        const drift=reduced.matches?0:Math.sin(floatTime*(.62+i*.037)+phase)*2.2
        const tiltX=reduced.matches?0:Math.sin(floatTime*.48+phase)*.012
        const tiltY=reduced.matches?0:Math.cos(floatTime*.41+phase)*.018
        group.position.set(r.x+cx*1.2,839-r.y+drift*(1-d*.7)+d*3,15+d*15)
        group.scale.setScalar(1+(reduced.matches?0:.06*d))
        group.rotation.set(((animate?cy*.008:0)+tiltX)*(1-d),((animate?cx*.012:0)+tiltY)*(1-d),-r.angle*Math.PI/180*(1-d*.7))
        cardGlows[i].uniforms.hover.value=d;cardGlass[i].value=d
        group.updateMatrixWorld(true)
        const corners=[[-CARD.width/2,CARD.height/2],[CARD.width/2,CARD.height/2],[CARD.width/2,-CARD.height/2],[-CARD.width/2,-CARD.height/2]].map(([x,y])=>{point.set(x,y,11);group.localToWorld(point);point.project(camera);return `${view.x+(point.x+1)*view.width/2},${view.y+(1-point.y)*view.height/2}`})
        polygons[i].setAttribute('points',corners.join(' '))
      })
      // The figure and its floor contacts are anchored; wind affects fabric only.
      capeMotion.value=reduced.matches?0:1
      if(!reduced.matches)capeClock.value+=dt
      if(!reduced.matches)energyTime+=dt
      updateConnection(dt)
      const pulse=reduced.matches?0:Math.sin(energyTime*.85),power=connectionPower
      portalUniforms.clock.value=reduced.matches?0:energyTime
      portalUniforms.charge.value=power
      ;(core.material as THREE.MeshBasicMaterial).opacity=.25+pulse*.045+power*.3
      core.scale.setScalar(1+pulse*.025)
      updateLeaves(dt)
      const themeTarget=themeRef.current==='light'?1:0
      themeBlend.value+=(themeTarget-themeBlend.value)*(reduced.matches?1:Math.min(1,dt*6))
      if(Math.abs(themeTarget-themeBlend.value)<.001)themeBlend.value=themeTarget
      renderer!.render(scene,camera);wrap.dataset.renderCount=String(Number(wrap.dataset.renderCount||0)+1)
      if(!reduced.matches||(animate&&settling>.002))frame=requestAnimationFrame(render)
    }
    function move(e:PointerEvent){const rect=wrap.getBoundingClientRect();px=(e.clientX-rect.left)/rect.width*2-1;py=(e.clientY-rect.top)/rect.height*2-1;invalidate()}
    function leave(){px=py=0;activeRef.current=-1;invalidate()}
    function visibility(){if(document.hidden){cancelAnimationFrame(frame);frame=0}else invalidate()}
    function loss(e:Event){e.preventDefault();lost=true;cancelAnimationFrame(frame);frame=0;setReady(false);polygons.forEach((p,i)=>p.setAttribute('points',realmPoints(i)))}
    function restore(){lost=false;setReady(true);invalidate()}
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)invalidate();else{cancelAnimationFrame(frame);frame=0}},{rootMargin:'300px 0px'});observer.observe(wrap)
    wrap.addEventListener('pointermove',move,{passive:true});wrap.addEventListener('pointerleave',leave);document.addEventListener('visibilitychange',visibility);reduced.addEventListener('change',leave);fine.addEventListener('change',leave);canvas.addEventListener('webglcontextlost',loss);canvas.addEventListener('webglcontextrestored',restore)
    resize();camera.updateMatrixWorld(true)
    Promise.all(pending).then(()=>{if(!disposed&&!lost){renderer!.render(scene,camera);setReady(true);invalidate()}}).catch(()=>{})
    return()=>{disposed=true;cancelAnimationFrame(frame);resizeObserver.disconnect();observer.disconnect();invalidateRef.current=()=>{};wrap.removeEventListener('pointermove',move);wrap.removeEventListener('pointerleave',leave);document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',leave);fine.removeEventListener('change',leave);canvas.removeEventListener('webglcontextlost',loss);canvas.removeEventListener('webglcontextrestored',restore);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());renderer?.dispose();if(!canvas.isConnected)renderer?.forceContextLoss()}
  },[])
  return <div ref={wrapRef} className={`fh-scene ${ready?'fh-scene-ready':''}`}>
    <canvas ref={canvasRef} className="fh-scene-canvas" aria-hidden="true"/>
    <svg ref={svgRef} className="fh-scene-overlay" viewBox="0 0 1875 839" aria-label="Eight fandom realms">
      <HeroFallbackArtwork theme={theme}/>
      {HERO_REALMS.map((realm,i)=><g key={realm.slug} role="button" tabIndex={0} aria-label={`Enter ${realm.name} Realm`} aria-pressed={selected===realm.slug} onPointerEnter={()=>activate(i)} onPointerLeave={()=>activate(-1)} onFocus={()=>activate(i)} onBlur={()=>activate(-1)} onClick={()=>onSelect(realm.slug)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(realm.slug)}}}><polygon className="fh-realm-hit" points={realmPoints(i)}/></g>)}
    </svg>
  </div>
}

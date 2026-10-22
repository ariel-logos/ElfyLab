// Blinn-Phong vs PBR (Cook-Torrance GGX, metallic-roughness) comparison demo. Plain WebGL.
(function () {
  var root = document.getElementById('pbr-compare-demo');
  if (!root) return;
  var BASE = root.getAttribute('data-base') || '';

  var style = document.createElement('style');
  style.textContent =
    '.pc-wrap{display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start}' +
    '.pc-canvas{flex:1 1 420px;min-width:280px}' +
    '.pc-canvas canvas{width:100%;aspect-ratio:2/1;display:block;border-radius:6px;cursor:grab;touch-action:none}' +
    '.pc-controls{flex:0 0 260px;display:flex;flex-direction:column;gap:8px}' +
    '.pc-controls label{display:flex;flex-direction:column;font-size:.9em}' +
    '.pc-controls label span b{float:right;font-weight:normal;opacity:.7}' +
    '.pc-controls .pc-row{flex-direction:row;gap:8px;align-items:center}' +
    '.pc-controls h4{margin:10px 0 0;font-size:1em}' +
    '.pc-controls select,.pc-controls input[type=range]{width:100%}' +
    '.pc-labels{display:flex;font-size:.85em;opacity:.8;margin-top:4px}' +
    '.pc-labels div{flex:1;text-align:center}';
  document.head.appendChild(style);

  var MATERIALS = {
    Metal053C: { label: 'Rusty steel (metal + rust, both maps)', tile: [2, 1] },
    Metal032: { label: 'Worn metal (fully metallic)', tile: [3, 1.5] },
    PaintedMetal017: { label: 'Rusty painted sign (almost no metal)', tile: [3, 1.5] },
    PavingStones070: { label: 'Cobblestones (strong normal map)', tile: [3, 1.5] },
    Rocks011: { label: 'Rock wall (strongest normal map)', tile: [2, 1] },
    Tiles074: { label: 'Ceramic tiles (non-metal)', tile: [3, 1.5] }
  };

  var state = {
    material: 'Metal053C', normal: true, orbit: false,
    azimuth: 45, elevation: 35, intensity: 3,
    ks: 0.6, shininess: 48, driven: false,
    roughScale: 1, metalOffset: 0, ibl: true
  };

  root.innerHTML =
    '<div class="pc-wrap"><div class="pc-canvas"><canvas width="1000" height="500"></canvas>' +
    '<div class="pc-labels"><div>Blinn-Phong</div><div>PBR (GGX, metallic-roughness)</div></div>' +
    '<div id="pc-status" style="font-size:.85em;opacity:.7;margin-top:4px"></div></div>' +
    '<div class="pc-controls" id="pc-controls"></div></div>' +
    '<p style="font-size:.9em;opacity:.8">Drag on the canvas to rotate both spheres. ' +
    'Textures: <a href="https://ambientcg.com" target="_blank">ambientCG</a> (CC0).</p>';
  var canvas = root.querySelector('canvas');
  var panel = root.querySelector('#pc-controls');
  var status = root.querySelector('#pc-status');
  var azInput, azOut;

  function section(t) { var h = document.createElement('h4'); h.textContent = t; panel.appendChild(h); }
  function addSelect(key, text, options, onchange) {
    var l = document.createElement('label'); l.textContent = text;
    var s = document.createElement('select');
    options.forEach(function (o) { var op = document.createElement('option'); op.value = o[0]; op.textContent = o[1]; s.appendChild(op); });
    s.value = state[key];
    s.onchange = function () { state[key] = s.value; if (onchange) onchange(); };
    l.appendChild(s); panel.appendChild(l);
  }
  function addCheck(key, text) {
    var l = document.createElement('label'); l.className = 'pc-row';
    var i = document.createElement('input'); i.type = 'checkbox'; i.checked = state[key];
    i.onchange = function () { state[key] = i.checked; };
    l.appendChild(i); l.appendChild(document.createTextNode(text)); panel.appendChild(l);
    return i;
  }
  var orbitBox;
  function addRange(key, text, min, max, step) {
    var l = document.createElement('label');
    var sp = document.createElement('span'); sp.textContent = text + ' ';
    var out = document.createElement('b'); out.textContent = state[key]; sp.appendChild(out);
    var i = document.createElement('input'); i.type = 'range'; i.min = min; i.max = max; i.step = step; i.value = state[key];
    i.oninput = function () {
      state[key] = parseFloat(i.value); out.textContent = i.value;
      if (key === 'azimuth' || key === 'elevation') { state.orbit = false; orbitBox.checked = false; }
    };
    l.appendChild(sp); l.appendChild(i); panel.appendChild(l);
    if (key === 'azimuth') { azInput = i; azOut = out; }
  }

  var matOptions = Object.keys(MATERIALS).map(function (k) { return [k, MATERIALS[k].label]; });
  section('Material');
  addSelect('material', 'Texture set', matOptions, function () { loadMaterial(state.material); });
  addCheck('normal', 'Use normal map');
  section('Light');
  addRange('intensity', 'Intensity', 0.5, 8, 0.1);
  orbitBox = addCheck('orbit', 'Auto-orbit light');
  addRange('azimuth', 'Azimuth', -180, 180, 1);
  addRange('elevation', 'Elevation', -80, 80, 1);
  section('Blinn-Phong (left)');
  addRange('ks', 'Specular strength (ks)', 0, 1.5, 0.01);
  addRange('shininess', 'Shininess (n)', 2, 256, 1);
  addCheck('driven', 'Drive it with the roughness map');
  section('PBR (right)');
  addRange('roughScale', 'Roughness scale', 0.2, 2, 0.01);
  addRange('metalOffset', 'Metalness offset (added to map)', -1, 1, 0.01);
  addCheck('ibl', 'Environment (image-based) lighting');

  // ---------- GL ----------
  var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) { root.innerHTML = '<p>Sorry, WebGL is not available in this browser.</p>'; return; }
  var aniso = gl.getExtension('EXT_texture_filter_anisotropic');

  function compile(type, src) {
    var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  function program(vs, fs) {
    var p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, vs)); gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    return p;
  }
  var CAM = 3.0, prog, ptProg;
  try {
    prog = program(
      'precision highp float;attribute vec3 aPos;attribute vec3 aNormal;attribute vec3 aTangent;attribute vec2 aUV;' +
      'uniform mat4 uModel;uniform mat4 uProj;uniform float uCam;uniform vec2 uTile;' +
      'varying vec3 vWorld;varying vec3 vN;varying vec3 vT;varying vec2 vUV;' +
      'void main(){vec4 w=uModel*vec4(aPos,1.0);vWorld=w.xyz;vN=mat3(uModel)*aNormal;vT=mat3(uModel)*aTangent;' +
      'vUV=aUV*uTile;gl_Position=uProj*vec4(w.xyz-vec3(0.0,0.0,uCam),1.0);}',

      'precision highp float;' +
      'varying vec3 vWorld;varying vec3 vN;varying vec3 vT;varying vec2 vUV;' +
      'uniform sampler2D uAlbedo;uniform sampler2D uNormal;uniform sampler2D uRough;uniform sampler2D uMetal;' +
      'uniform vec3 uLightPos;uniform vec3 uLightCol;uniform float uIntensity;uniform float uCam;' +
      'uniform int uMode;uniform float uUseNormal;uniform float uKs;uniform float uShin;uniform float uDriven;' +
      'uniform float uRoughScale;uniform float uMetalOff;uniform float uIBL;' +
      'const float PI=3.14159265;' +
      'vec3 sky(vec3 r){float h=r.y;' +
      ' vec3 up=mix(vec3(0.8,0.85,0.9),vec3(0.12,0.35,0.85),pow(clamp(h,0.0,1.0),0.45));' +
      ' vec3 down=mix(vec3(0.45,0.36,0.26),vec3(0.08,0.06,0.05),pow(clamp(-h,0.0,1.0),0.5));' +
      ' vec3 c=mix(down,up,smoothstep(-0.03,0.03,h));' +
      ' c+=vec3(1.0,0.9,0.7)*pow(max(1.0-abs(h)*6.0,0.0),2.0)*0.6;' +
      ' vec3 ld=normalize(uLightPos);float sd=max(dot(r,ld),0.0);' +
      ' return c+uLightCol*pow(sd,220.0)*4.0+uLightCol*pow(sd,8.0)*0.25;}' +
      'float g1(float x,float k){return x/(x*(1.0-k)+k);}' +
      'void main(){' +
      ' vec3 N=normalize(vN);vec3 T=normalize(vT-dot(vT,N)*N);vec3 B=cross(N,T);' +
      ' if(uUseNormal>0.5){vec3 tn=texture2D(uNormal,vUV).xyz*2.0-1.0;N=normalize(mat3(T,B,N)*tn);}' +
      ' vec3 albedo=pow(texture2D(uAlbedo,vUV).rgb,vec3(2.2));' +
      ' float rough=texture2D(uRough,vUV).r;float metal=texture2D(uMetal,vUV).r;' +
      ' vec3 L=normalize(uLightPos-vWorld);vec3 V=normalize(vec3(0.0,0.0,uCam)-vWorld);vec3 H=normalize(L+V);' +
      ' float NL=max(dot(N,L),0.0),NV=max(dot(N,V),0.001),NH=max(dot(N,H),0.0),VH=max(dot(V,H),0.0);' +
      ' vec3 radiance=uLightCol*uIntensity;vec3 col;' +
      ' if(uMode==0){' +
      '  float ks=uKs,shin=uShin;' +
      '  if(uDriven>0.5){ks=uKs*(1.0-rough);shin=mix(4.0,uShin,1.0-rough);}' +
      '  float spec=NL>0.0?pow(NH,shin):0.0;' +
      '  col=albedo*0.08+albedo*NL*radiance+ks*spec*radiance;' +
      ' }else{' +
      '  float r=clamp(rough*uRoughScale,0.04,1.0);float m=clamp(metal+uMetalOff,0.0,1.0);' +
      '  vec3 F0=mix(vec3(0.04),albedo,m);' +
      '  float a=r*r;float a2=a*a;float dd=NH*NH*(a2-1.0)+1.0;float D=a2/(PI*dd*dd);' +
      '  float k=(r+1.0)*(r+1.0)/8.0;float G=g1(NL,k)*g1(NV,k);' +
      '  vec3 F=F0+(1.0-F0)*pow(1.0-VH,5.0);' +
      '  vec3 spec=D*G*F/(4.0*NL*NV+0.001);' +
      '  vec3 kD=(1.0-F)*(1.0-m);' +
      '  col=(kD*albedo/PI+spec)*radiance*PI*NL;' +
      '  if(uIBL>0.5){' +
      '   vec3 R=reflect(-V,N);vec3 avg=vec3(0.45,0.5,0.6);' +
      '   vec3 irr=mix(sky(N),avg,0.6)*0.5;' +
      '   vec3 Fe=F0+(max(vec3(1.0-r),F0)-F0)*pow(1.0-NV,5.0);' +
      '   vec3 refl=mix(sky(R),avg,r*r);' +
      '   col+=(1.0-Fe)*(1.0-m)*albedo*irr+Fe*refl;' +
      '  }else{col+=albedo*0.08;}' +
      ' }' +
      ' col=col/(col+1.0);gl_FragColor=vec4(pow(col,vec3(1.0/2.2)),1.0);}'
    );
    ptProg = program(
      'precision highp float;attribute vec3 aPos;uniform mat4 uProj;uniform float uCam;' +
      'void main(){gl_Position=uProj*vec4(aPos-vec3(0.0,0.0,uCam),1.0);gl_PointSize=10.0;}',
      'precision highp float;uniform vec3 uCol;' +
      'void main(){if(length(gl_PointCoord-0.5)>0.5)discard;gl_FragColor=vec4(uCol,1.0);}'
    );
  } catch (err) {
    root.insertAdjacentHTML('afterbegin', '<pre style="color:#f66;white-space:pre-wrap">Shader error: ' + err.message + '</pre>');
    return;
  }

  // ---------- sphere with UVs and tangents ----------
  var TAU = Math.PI * 2, pos = [], nor = [], tan = [], uv = [], idx = [], NU = 96, NV = 96, i, j;
  for (i = 0; i <= NU; i++) for (j = 0; j <= NV; j++) {
    var th = i / NU * Math.PI, ph = j / NV * TAU;
    var x = Math.sin(th) * Math.cos(ph), y = Math.cos(th), z = Math.sin(th) * Math.sin(ph);
    pos.push(x, y, z); nor.push(x, y, z);
    tan.push(Math.sin(ph), 0, -Math.cos(ph));      // image "right" (u mirrored so it reads correctly from outside)
    uv.push(1 - j / NV, i / NU);
  }
  for (i = 0; i < NU; i++) for (j = 0; j < NV; j++) {
    var a = i * (NV + 1) + j, b = a + NV + 1;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  function buf(t, data) { var b2 = gl.createBuffer(); gl.bindBuffer(t, b2); gl.bufferData(t, data, gl.STATIC_DRAW); return b2; }
  var bPos = buf(gl.ARRAY_BUFFER, new Float32Array(pos)), bNor = buf(gl.ARRAY_BUFFER, new Float32Array(nor)),
      bTan = buf(gl.ARRAY_BUFFER, new Float32Array(tan)), bUV = buf(gl.ARRAY_BUFFER, new Float32Array(uv)),
      bIdx = buf(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx));
  var lightBuf = gl.createBuffer();

  // ---------- textures ----------
  function solid(r, g, b) {
    var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([r, g, b, 255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return t;
  }
  var fallback = { Color: solid(128, 128, 128), NormalGL: solid(128, 128, 255), Roughness: solid(128, 128, 128), Metalness: solid(0, 0, 0) };
  var cache = {}, current = null;
  function loadMaterial(name) {
    if (cache[name]) { current = cache[name]; status.textContent = ''; return; }
    var m = cache[name] = { Color: fallback.Color, NormalGL: fallback.NormalGL, Roughness: fallback.Roughness, Metalness: fallback.Metalness };
    current = m;
    var pending = 0, failed = false;
    ['Color', 'NormalGL', 'Roughness', 'Metalness'].forEach(function (k) {
      pending++;
      var img = new Image();
      img.onload = function () {
        var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, 8);
        m[k] = t;
        if (--pending === 0 && !failed && current === m) status.textContent = '';
      };
      img.onerror = function () {
        if (k !== 'Metalness') { failed = true; status.textContent = 'Could not load ' + k + ' texture.'; }
        pending--;
      };
      img.src = BASE + name + '/' + k + '.jpg';
    });
    status.textContent = 'Loading textures...';
  }
  loadMaterial(state.material);

  // ---------- math ----------
  function perspective(fovy, aspect, near, far) {
    var f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
    return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0]);
  }
  function rotation(rx, ry) {
    var cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry);
    return new Float32Array([cy, sx * sy, -cx * sy, 0, 0, cx, sx, 0, sy, -sx * cy, cx * cy, 0, 0, 0, 0, 1]);
  }

  var rotX = 0.2, rotY = 0, dragging = false, lx = 0, ly = 0;
  canvas.addEventListener('pointerdown', function (e) { dragging = true; lx = e.clientX; ly = e.clientY; canvas.setPointerCapture(e.pointerId); canvas.style.cursor = 'grabbing'; });
  canvas.addEventListener('pointerup', function () { dragging = false; canvas.style.cursor = 'grab'; });
  canvas.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    rotY += (e.clientX - lx) * 0.01; rotX += (e.clientY - ly) * 0.01; lx = e.clientX; ly = e.clientY;
  });

  // ---------- render ----------
  function drawSphere(vx, vw, vh, mode, lightPos) {
    gl.viewport(vx, 0, vw, vh);
    gl.useProgram(prog);
    var u = function (n) { return gl.getUniformLocation(prog, n); };
    gl.uniformMatrix4fv(u('uProj'), false, perspective(0.8, vw / vh, 0.1, 20));
    gl.uniformMatrix4fv(u('uModel'), false, rotation(rotX, rotY));
    gl.uniform1f(u('uCam'), CAM);
    gl.uniform2fv(u('uTile'), MATERIALS[state.material].tile);
    gl.uniform3fv(u('uLightPos'), lightPos);
    gl.uniform3fv(u('uLightCol'), [1, 1, 1]);
    gl.uniform1f(u('uIntensity'), state.intensity);
    gl.uniform1i(u('uMode'), mode);
    gl.uniform1f(u('uUseNormal'), state.normal ? 1 : 0);
    gl.uniform1f(u('uKs'), state.ks);
    gl.uniform1f(u('uShin'), state.shininess);
    gl.uniform1f(u('uDriven'), state.driven ? 1 : 0);
    gl.uniform1f(u('uRoughScale'), state.roughScale);
    gl.uniform1f(u('uMetalOff'), state.metalOffset);
    gl.uniform1f(u('uIBL'), state.ibl ? 1 : 0);
    [['uAlbedo', 'Color'], ['uNormal', 'NormalGL'], ['uRough', 'Roughness'], ['uMetal', 'Metalness']].forEach(function (p, n) {
      gl.activeTexture(gl.TEXTURE0 + n); gl.bindTexture(gl.TEXTURE_2D, current[p[1]]); gl.uniform1i(u(p[0]), n);
    });
    function attr(name, b, size) {
      var l = gl.getAttribLocation(prog, name); gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, size, gl.FLOAT, false, 0, 0);
    }
    attr('aPos', bPos, 3); attr('aNormal', bNor, 3); attr('aTangent', bTan, 3); attr('aUV', bUV, 2);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bIdx);
    gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);

    gl.useProgram(ptProg);
    gl.uniformMatrix4fv(gl.getUniformLocation(ptProg, 'uProj'), false, perspective(0.8, vw / vh, 0.1, 20));
    gl.uniform1f(gl.getUniformLocation(ptProg, 'uCam'), CAM);
    gl.uniform3fv(gl.getUniformLocation(ptProg, 'uCol'), [1, 1, 1]);
    gl.bindBuffer(gl.ARRAY_BUFFER, lightBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lightPos), gl.DYNAMIC_DRAW);
    var lp = gl.getAttribLocation(ptProg, 'aPos');
    gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.POINTS, 0, 1);
  }

  var last = 0;
  function frame(t) {
    var dt = (t - last) / 1000; last = t;
    if (state.orbit) {
      state.azimuth += dt * 30; if (state.azimuth > 180) state.azimuth -= 360;
      azInput.value = state.azimuth; azOut.textContent = Math.round(state.azimuth);
    }
    var dpr = window.devicePixelRatio || 1;
    var w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    var az = state.azimuth * Math.PI / 180, el = state.elevation * Math.PI / 180, d = 2.6;
    var lightPos = [d * Math.cos(el) * Math.sin(az), d * Math.sin(el), d * Math.cos(el) * Math.cos(az)];
    gl.enable(gl.DEPTH_TEST); gl.enable(gl.SCISSOR_TEST);
    var half = Math.floor(w / 2);
    [[0, half, 0], [half, w - half, 1]].forEach(function (s) {
      gl.scissor(s[0], 0, s[1], h); gl.viewport(s[0], 0, s[1], h);
      gl.clearColor(0.09, 0.09, 0.1, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      drawSphere(s[0], s[1], h, s[2], lightPos);
    });
    gl.disable(gl.SCISSOR_TEST);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

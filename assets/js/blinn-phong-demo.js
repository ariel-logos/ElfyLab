// Interactive Blinn-Phong / Phong lighting demo (plain WebGL, no dependencies).
(function () {
  var root = document.getElementById('blinn-phong-demo');
  if (!root) return;

  // ---------- UI ----------
  var style = document.createElement('style');
  style.textContent =
    '.bp-wrap{display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start}' +
    '.bp-canvas{flex:1 1 420px;min-width:280px}' +
    '.bp-canvas canvas{width:100%;aspect-ratio:4/3;display:block;border-radius:6px;cursor:grab;touch-action:none}' +
    '.bp-controls{flex:0 0 260px;display:flex;flex-direction:column;gap:8px}' +
    '.bp-controls label{display:flex;flex-direction:column;font-size:.9em}' +
    '.bp-controls label span b{float:right;font-weight:normal;opacity:.7}' +
    '.bp-controls .bp-row{display:flex;gap:8px;align-items:center}' +
    '.bp-controls input[type=range]{width:100%}' +
    '.bp-controls select{width:100%}' +
    '.bp-labels{display:flex;font-size:.85em;opacity:.8;margin-top:4px}' +
    '.bp-labels div{flex:1;text-align:center}';
  document.head.appendChild(style);

  var state = {
    mode: 'blinn', shape: 'sphere', compare: false, orbit: false,
    ambient: 0.12, diffuse: 0.8, specular: 0.9, shininess: 64,
    gloss: 20, env: 50, spec2: '#ffffff',
    azimuth: 45, elevation: 30, base: '#d94f3d', light: '#ffffff'
  };

  // Order matters: each Gaussian-model control sits where its Blinn-Phong counterpart is,
  // so the panel keeps the same layout whichever model is selected.
  var controls = [
    ['select', 'mode', 'Specular model', [['blinn', 'Blinn-Phong (N·H)'], ['phong', 'Phong (R·V)'], ['gauss', 'Gaussian + environment (N·H)']]],
    ['select', 'shape', 'Shape', [['sphere', 'Sphere'], ['torus', 'Torus']]],
    ['check', 'compare', 'Compare all three side by side'],
    ['range', 'ambient', 'Ambient (ka)', 0, 0.5, 0.01],
    ['range', 'diffuse', 'Diffuse (kd)', 0, 1, 0.01],
    ['range', 'specular', 'Specular strength (ks)', 0, 1, 0.01],
    ['color', 'spec2', 'Specular colour'],
    ['range', 'shininess', 'Shininess (n)', 1, 256, 1],
    ['range', 'gloss', 'Smoothness (0-100)', 0, 100, 1],
    ['range', 'env', 'Environment reflection (0-100)', 0, 100, 1],
    ['color', 'base', 'Object colour'],
    ['color', 'light', 'Light colour'],
    ['check', 'orbit', 'Auto-orbit light'],
    ['range', 'azimuth', 'Light azimuth', -180, 180, 1],
    ['range', 'elevation', 'Light elevation', -80, 80, 1]
  ];


  root.innerHTML =
    '<div class="bp-wrap"><div class="bp-canvas"><canvas width="800" height="600"></canvas>' +
    '<div class="bp-labels" id="bp-labels"></div></div><div class="bp-controls" id="bp-controls"></div></div>' +
    '<p style="font-size:.9em;opacity:.8">Drag on the canvas to rotate the object.</p>';
  var canvas = root.querySelector('canvas');
  var panel = root.querySelector('#bp-controls');
  var labels = root.querySelector('#bp-labels');
  var azSlider, azOut;

  controls.forEach(function (c) {
    var type = c[0], key = c[1], text = c[2];
    var label = document.createElement('label');
    var out = document.createElement('b');
    var input;
    if (type === 'select') {
      label.textContent = text;
      input = document.createElement('select');
      c[3].forEach(function (o) {
        var op = document.createElement('option');
        op.value = o[0]; op.textContent = o[1]; input.appendChild(op);
      });
      input.value = state[key];
      input.onchange = function () { state[key] = input.value; updateLabels(); };
    } else if (type === 'check') {
      label.className = 'bp-row'; label.style.flexDirection = 'row';
      input = document.createElement('input'); input.type = 'checkbox'; input.checked = state[key];
      input.onchange = function () { state[key] = input.checked; updateLabels(); };
      label.appendChild(input); label.appendChild(document.createTextNode(text));
      panel.appendChild(label); return;
    } else if (type === 'color') {
      label.className = 'bp-row'; label.style.flexDirection = 'row';
      input = document.createElement('input'); input.type = 'color'; input.value = state[key];
      input.oninput = function () { state[key] = input.value; };
      label.appendChild(input); label.appendChild(document.createTextNode(text));
      panel.appendChild(label); return;
    } else {
      var span = document.createElement('span');
      span.textContent = text + ' '; span.appendChild(out);
      label.appendChild(span);
      input = document.createElement('input'); input.type = 'range';
      input.min = c[3]; input.max = c[4]; input.step = c[5]; input.value = state[key];
      out.textContent = state[key];
      input.oninput = function () {
        state[key] = parseFloat(input.value); out.textContent = input.value;
        if (key === 'azimuth' || key === 'elevation') {
          state.orbit = false;
          var cb = panel.querySelector('input[type=checkbox][data-key=orbit]');
          if (cb) cb.checked = false;
        }
      };
      if (key === 'azimuth') { azSlider = input; azOut = out; }
    }
    if (type !== 'range') label.appendChild(input);
    else label.appendChild(input);
    panel.appendChild(label);
  });
  // tag the orbit checkbox so slider edits can untick it
  panel.querySelectorAll('input[type=checkbox]')[1].setAttribute('data-key', 'orbit');

  // Controls that only matter for some models; everything else is always shown.
  var onlyFor = {
    specular: ['phong', 'blinn'], shininess: ['phong', 'blinn'],
    gloss: ['gauss'], env: ['gauss'], spec2: ['gauss']
  };
  function applyVisibility() {
    controls.forEach(function (c, i) {
      var modes = onlyFor[c[1]];
      panel.children[i].style.display =
        (!modes || state.compare || modes.indexOf(state.mode) !== -1) ? '' : 'none';
    });
  }

  function updateLabels() {
    applyVisibility();
    var names = { blinn: 'Blinn-Phong', phong: 'Phong', gauss: 'Gaussian + environment' };
    labels.innerHTML = state.compare
      ? '<div>Phong</div><div>Blinn-Phong</div><div>Gaussian + environment</div>'
      : '<div>' + names[state.mode] + '</div>';
  }
  updateLabels();

  // ---------- GL setup ----------
  var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    root.innerHTML = '<p>Sorry, WebGL is not available in this browser.</p>';
    return;
  }

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  function program(vs, fs) {
    var p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    return p;
  }

  var CAM = 4.0;

  var objProg, ptProg;
  try {
  objProg = program(
    'precision mediump float;attribute vec3 aPos;attribute vec3 aNormal;' +
    'uniform mat4 uModel;uniform mat4 uProj;uniform float uCam;' +
    'varying vec3 vWorld;varying vec3 vNormal;' +
    'void main(){vec4 w=uModel*vec4(aPos,1.0);vWorld=w.xyz;vNormal=mat3(uModel)*aNormal;' +
    'gl_Position=uProj*vec4(w.xyz-vec3(0.0,0.0,uCam),1.0);}',
    'precision mediump float;' +
    'varying vec3 vWorld;varying vec3 vNormal;' +
    'uniform vec3 uLightPos;uniform vec3 uLightCol;uniform vec3 uBase;uniform float uCam;' +
    'uniform float uKa;uniform float uKd;uniform float uKs;uniform float uShin;uniform int uBlinn;uniform float uGloss;uniform float uEnv;uniform vec3 uSpecCol;' +
    'vec3 sky(vec3 r){float h=r.y;'+
    ' vec3 up=mix(vec3(0.8,0.85,0.9),vec3(0.12,0.35,0.85),pow(clamp(h,0.0,1.0),0.45));'+
    ' vec3 down=mix(vec3(0.45,0.36,0.26),vec3(0.08,0.06,0.05),pow(clamp(-h,0.0,1.0),0.5));'+
    ' vec3 c=mix(down,up,smoothstep(-0.03,0.03,h));'+
    ' c+=vec3(1.0,0.9,0.7)*pow(max(1.0-abs(h)*6.0,0.0),2.0)*0.6;'+
    ' float sun=pow(max(dot(r,normalize(uLightPos)),0.0),220.0);'+
    ' return c+uLightCol*sun*4.0+uLightCol*pow(max(dot(r,normalize(uLightPos)),0.0),8.0)*0.25;}'+
    'void main(){' +
    'vec3 N=normalize(vNormal);vec3 L=normalize(uLightPos-vWorld);vec3 V=normalize(vec3(0.0,0.0,uCam)-vWorld);' +
    'float diff=max(dot(N,L),0.0);float spec=0.0;' +
    'if(diff>0.0){' +
    ' if(uBlinn>=1){vec3 H=normalize(L+V);spec=pow(max(dot(N,H),0.0),uShin);}' +
    ' else{vec3 R=reflect(-L,N);spec=pow(max(dot(R,V),0.0),uShin);}' +
    '}' +
    'vec3 col=uKa*uBase+uKd*diff*uBase*uLightCol+uKs*spec*uLightCol;' +
    'if(uBlinn==2){' +
    ' float c=max(dot(N,normalize(L+V)),0.0001);float t2=(1.0-c*c)/(c*c);' +
    ' float m=0.02+0.5*(1.0-uGloss)*(1.0-uGloss);' +
    ' float s2=diff>0.0?exp(-t2/(m*m)):0.0;' +
    ' vec3 Rv=reflect(-V,N);vec3 envCol=sky(Rv);' +
    ' col=uKa*uBase+(1.0-uEnv)*uKd*diff*uBase*uLightCol+s2*uSpecCol*uLightCol+uEnv*envCol*uSpecCol;}' +
    'gl_FragColor=vec4(pow(col,vec3(1.0/2.2)),1.0);}'
  );
  ptProg = program(
    'precision mediump float;attribute vec3 aPos;uniform mat4 uProj;uniform float uCam;' +
    'void main(){gl_Position=uProj*vec4(aPos-vec3(0.0,0.0,uCam),1.0);gl_PointSize=10.0;}',
    'precision mediump float;uniform vec3 uCol;' +
    'void main(){if(length(gl_PointCoord-0.5)>0.5)discard;gl_FragColor=vec4(uCol,1.0);}'
  );
  } catch (err) {
    root.insertAdjacentHTML('afterbegin', '<pre style="color:#f66;white-space:pre-wrap">Shader error: ' + err.message + '</pre>');
    return;
  }

  // ---------- geometry ----------
  function build(posFn, nu, nv) {
    var pos = [], nor = [], idx = [], i, j;
    for (i = 0; i <= nu; i++) for (j = 0; j <= nv; j++) {
      var r = posFn(i / nu, j / nv);
      pos.push(r[0], r[1], r[2]); nor.push(r[3], r[4], r[5]);
    }
    for (i = 0; i < nu; i++) for (j = 0; j < nv; j++) {
      var a = i * (nv + 1) + j, b = a + nv + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
    function buf(t, data) {
      var b2 = gl.createBuffer(); gl.bindBuffer(t, b2); gl.bufferData(t, data, gl.STATIC_DRAW); return b2;
    }
    return {
      pos: buf(gl.ARRAY_BUFFER, new Float32Array(pos)),
      nor: buf(gl.ARRAY_BUFFER, new Float32Array(nor)),
      idx: buf(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx)),
      count: idx.length
    };
  }
  var TAU = Math.PI * 2;
  var shapes = {
    sphere: build(function (u, v) {
      var th = u * Math.PI, ph = v * TAU;
      var x = Math.sin(th) * Math.cos(ph), y = Math.cos(th), z = Math.sin(th) * Math.sin(ph);
      return [x, y, z, x, y, z];
    }, 64, 64),
    torus: build(function (u, v) {
      var a = u * TAU, b = v * TAU, R = 0.75, r = 0.35;
      var cx = Math.cos(a), cz = Math.sin(a);
      var nx = Math.cos(b) * cx, ny = Math.sin(b), nz = Math.cos(b) * cz;
      return [(R + r * Math.cos(b)) * cx, r * ny, (R + r * Math.cos(b)) * cz, nx, ny, nz];
    }, 64, 32)
  };
  var lightBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, lightBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(3), gl.DYNAMIC_DRAW);

  // ---------- matrices (column-major) ----------
  function perspective(fovy, aspect, near, far) {
    var f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
    return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0]);
  }
  function rotation(rx, ry) {
    var cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry);
    // Ry * Rx
    return new Float32Array([
      cy, sx * sy, -cx * sy, 0,
      0, cx, sx, 0,
      sy, -sx * cy, cx * cy, 0,
      0, 0, 0, 1]);
  }
  function hex(h) {
    return [parseInt(h.substr(1, 2), 16) / 255, parseInt(h.substr(3, 2), 16) / 255, parseInt(h.substr(5, 2), 16) / 255];
  }

  // ---------- interaction ----------
  var rotX = 0.3, rotY = 0, dragging = false, lx = 0, ly = 0;
  canvas.addEventListener('pointerdown', function (e) {
    dragging = true; lx = e.clientX; ly = e.clientY; canvas.setPointerCapture(e.pointerId); canvas.style.cursor = 'grabbing';
  });
  canvas.addEventListener('pointerup', function () { dragging = false; canvas.style.cursor = 'grab'; });
  canvas.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    rotY += (e.clientX - lx) * 0.01; rotX += (e.clientY - ly) * 0.01;
    lx = e.clientX; ly = e.clientY;
  });

  // ---------- render ----------
  function drawObject(vx, vy, vw, vh, blinn, lightPos) // blinn: 0 Phong, 1 Blinn-Phong, 2 Gaussian + environment
   {
    gl.viewport(vx, vy, vw, vh);
    var sh = shapes[state.shape];
    gl.useProgram(objProg);
    var loc = function (n) { return gl.getUniformLocation(objProg, n); };
    gl.uniformMatrix4fv(loc('uProj'), false, perspective(0.8, vw / vh, 0.1, 20));
    gl.uniformMatrix4fv(loc('uModel'), false, rotation(rotX, rotY));
    gl.uniform1f(loc('uCam'), CAM);
    gl.uniform3fv(loc('uLightPos'), lightPos);
    gl.uniform3fv(loc('uLightCol'), hex(state.light));
    gl.uniform3fv(loc('uBase'), hex(state.base));
    gl.uniform1f(loc('uKa'), state.ambient);
    gl.uniform1f(loc('uKd'), state.diffuse);
    gl.uniform1f(loc('uKs'), state.specular);
    gl.uniform1f(loc('uShin'), state.shininess);
    gl.uniform1i(loc('uBlinn'), blinn);
    gl.uniform1f(loc('uGloss'), state.gloss / 100);
    gl.uniform1f(loc('uEnv'), state.env / 100);
    gl.uniform3fv(loc('uSpecCol'), hex(state.spec2));
    var p = gl.getAttribLocation(objProg, 'aPos'), n = gl.getAttribLocation(objProg, 'aNormal');
    gl.bindBuffer(gl.ARRAY_BUFFER, sh.pos); gl.enableVertexAttribArray(p); gl.vertexAttribPointer(p, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, sh.nor); gl.enableVertexAttribArray(n); gl.vertexAttribPointer(n, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sh.idx);
    gl.drawElements(gl.TRIANGLES, sh.count, gl.UNSIGNED_SHORT, 0);

    // light marker
    gl.useProgram(ptProg);
    gl.uniformMatrix4fv(gl.getUniformLocation(ptProg, 'uProj'), false, perspective(0.8, vw / vh, 0.1, 20));
    gl.uniform1f(gl.getUniformLocation(ptProg, 'uCam'), CAM);
    gl.uniform3fv(gl.getUniformLocation(ptProg, 'uCol'), hex(state.light));
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
      azSlider.value = state.azimuth; azOut.textContent = Math.round(state.azimuth);
    }
    var w = canvas.clientWidth * (window.devicePixelRatio || 1), h = canvas.clientHeight * (window.devicePixelRatio || 1);
    if (canvas.width !== Math.round(w) || canvas.height !== Math.round(h)) { canvas.width = Math.round(w); canvas.height = Math.round(h); }
    var az = state.azimuth * Math.PI / 180, el = state.elevation * Math.PI / 180, d = 2.6;
    var lightPos = [d * Math.cos(el) * Math.sin(az), d * Math.sin(el), d * Math.cos(el) * Math.cos(az)];

    gl.enable(gl.DEPTH_TEST); gl.enable(gl.SCISSOR_TEST);
    var W = canvas.width, H = canvas.height;
    var dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    function clear(x, w2) {
      gl.scissor(x, 0, w2, H); gl.viewport(x, 0, w2, H);
      gl.clearColor(0.09, 0.09, 0.1, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
    if (state.compare) {
      var third = Math.floor(W / 3);
      clear(0, third); drawObject(0, 0, third, H, 0, lightPos);
      clear(third, third); drawObject(third, 0, third, H, 1, lightPos);
      clear(2 * third, W - 2 * third); drawObject(2 * third, 0, W - 2 * third, H, 2, lightPos);
    } else {
      clear(0, W); drawObject(0, 0, W, H, { phong: 0, blinn: 1, gauss: 2 }[state.mode], lightPos);
    }
    gl.disable(gl.SCISSOR_TEST);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

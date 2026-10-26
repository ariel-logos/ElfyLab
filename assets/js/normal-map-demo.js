// Normal map demo: how a perturbed normal changes the bounce of the light. Plain WebGL.
// Left: external view (light, camera, rays, normal at a probe point). Right: what the camera sees.
(function () {
  var root = document.getElementById('normal-map-demo');
  if (!root) return;

  var style = document.createElement('style');
  style.textContent =
    '.nm-wrap{display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start}' +
    '.nm-canvas{flex:1 1 460px;min-width:280px}' +
    '.nm-canvas canvas{width:100%;aspect-ratio:2.2/1;display:block;border-radius:6px;cursor:grab;touch-action:none}' +
    '.nm-controls{flex:0 0 260px;display:flex;flex-direction:column;gap:8px}' +
    '.nm-controls label{display:flex;flex-direction:column;font-size:.9em}' +
    '.nm-controls label span b{float:right;font-weight:normal;opacity:.7}' +
    '.nm-controls .nm-row{flex-direction:row;gap:8px;align-items:center}' +
    '.nm-controls h4{margin:10px 0 0;font-size:1em}' +
    '.nm-controls input[type=range]{width:100%}' +
    '.nm-labels{display:flex;font-size:.85em;opacity:.8;margin-top:4px}' +
    '.nm-labels div{flex:1;text-align:center}' +
    '.nm-legend{display:flex;flex-wrap:wrap;gap:4px 16px;font-size:.8em;margin-top:6px;opacity:.9}' +
    '.nm-legend i{display:inline-block;width:18px;height:4px;margin-right:6px;vertical-align:middle;border-radius:2px}' +
    '.nm-readout{font-size:.9em;margin-top:8px;padding:8px 10px;border-radius:6px;background:rgba(128,128,128,.15)}';
  document.head.appendChild(style);

  var state = {
    tilt: 25, width: 0.35, probe: -0.2, apply: true,
    lx: -3.5, ly: 2.2, cx: 0.7, cy: 3.6, shin: 60, rays: true
  };

  root.innerHTML =
    '<div class="nm-wrap"><div class="nm-canvas"><canvas width="1100" height="500"></canvas>' +
    '<div class="nm-labels"><div>External view</div><div>Camera view</div></div>' +
    '<div class="nm-legend" id="nm-legend"></div>' +
    '<div class="nm-readout" id="nm-readout"></div></div>' +
    '<div class="nm-controls" id="nm-controls"></div></div>' +
    '<p style="font-size:.9em;opacity:.8">Drag on the canvas to orbit the external view.</p>';
  var canvas = root.querySelector('canvas');
  var panel = root.querySelector('#nm-controls');
  var readout = root.querySelector('#nm-readout');

  var LEGEND = [
    ['#ffd24a', 'Incoming light'], ['#ffffff', 'Geometric normal'], ['#ff5fd2', 'Normal from the normal map'],
    ['#ff8a3d', 'Reflected ray'], ['#4de1ff', 'Direction to the camera'], ['#8a8a8a', 'Reflection on a flat surface']
  ];
  root.querySelector('#nm-legend').innerHTML = LEGEND.map(function (l) {
    return '<span><i style="background:' + l[0] + '"></i>' + l[1] + '</span>';
  }).join('');

  function section(t) { var h = document.createElement('h4'); h.textContent = t; panel.appendChild(h); }
  function addRange(key, text, min, max, step) {
    var l = document.createElement('label');
    var sp = document.createElement('span'); sp.textContent = text + ' ';
    var out = document.createElement('b'); out.textContent = state[key]; sp.appendChild(out);
    var i = document.createElement('input'); i.type = 'range'; i.min = min; i.max = max; i.step = step; i.value = state[key];
    i.oninput = function () { state[key] = parseFloat(i.value); out.textContent = i.value; };
    l.appendChild(sp); l.appendChild(i); panel.appendChild(l);
  }
  function addCheck(key, text) {
    var l = document.createElement('label'); l.className = 'nm-row';
    var i = document.createElement('input'); i.type = 'checkbox'; i.checked = state[key];
    i.onchange = function () { state[key] = i.checked; };
    l.appendChild(i); l.appendChild(document.createTextNode(text)); panel.appendChild(l);
  }

  section('Surface (the normal map)');
  addRange('tilt', 'Bump tilt (degrees)', -60, 60, 1);
  addRange('width', 'Bump width', 0.1, 1, 0.01);
  addCheck('apply', 'Apply the normal map in the camera view');
  section('Probe point');
  addRange('probe', 'Position along the surface', -1.9, 1.9, 0.01);
  addCheck('rays', 'Show rays and normals');
  section('Light');
  addRange('lx', 'Horizontal position', -6, -0.5, 0.05);
  addRange('ly', 'Height', 0.6, 5, 0.05);
  section('Camera');
  addRange('cx', 'Distance (back / forward)', 0.6, 6, 0.05);
  addRange('cy', 'Height', 0.6, 5, 0.05);
  addRange('shin', 'Highlight sharpness', 2, 300, 1);

  // ---------- GL ----------
  var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) { root.innerHTML = '<p>Sorry, WebGL is not available in this browser.</p>'; return; }

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
  var planeProg, solidProg, pointProg;
  try {
    planeProg = program(
      'precision highp float;attribute vec3 aPos;uniform mat4 uVP;varying vec3 vWorld;' +
      'void main(){vWorld=aPos;gl_Position=uVP*vec4(aPos,1.0);}',
      'precision highp float;varying vec3 vWorld;' +
      'uniform int uMode;uniform vec3 uLight;uniform vec3 uEye;uniform float uTilt;uniform float uW;uniform float uApply;uniform float uShin;' +
      // a simple ridge: the left slope tilts the normal towards -x, the right slope towards +x
      'vec3 surfN(float x){if(abs(x)>uW)return vec3(0.0,1.0,0.0);float s=x<0.0?-1.0:1.0;return vec3(s*sin(uTilt),cos(uTilt),0.0);}' +
      'void main(){' +
      ' vec3 n=surfN(vWorld.x);' +
      ' if(uMode==0){gl_FragColor=vec4(n.x*0.5+0.5,0.5,n.y*0.5+0.5,1.0);return;}' +
      ' vec3 N=uApply>0.5?n:vec3(0.0,1.0,0.0);' +
      ' vec3 L=normalize(uLight-vWorld);vec3 V=normalize(uEye-vWorld);' +
      ' float nl=dot(N,L);vec3 R=reflect(-L,N);' +
      ' float spec=nl>0.0?pow(max(dot(R,V),0.0),uShin):0.0;' +
      ' vec3 col=vec3(0.5)*(0.10+0.35*max(nl,0.0))+vec3(1.0)*spec*0.9;' +
      ' gl_FragColor=vec4(pow(col,vec3(1.0/2.2)),1.0);}'
    );
    solidProg = program(
      'precision highp float;attribute vec3 aPos;attribute vec3 aCol;uniform mat4 uVP;varying vec3 vCol;' +
      'void main(){vCol=aCol;gl_Position=uVP*vec4(aPos,1.0);}',
      'precision highp float;varying vec3 vCol;void main(){gl_FragColor=vec4(vCol,1.0);}'
    );
    pointProg = program(
      'precision highp float;attribute vec3 aPos;uniform mat4 uVP;uniform float uSize;' +
      'void main(){gl_Position=uVP*vec4(aPos,1.0);gl_PointSize=uSize;}',
      'precision highp float;uniform vec3 uCol;' +
      'void main(){if(length(gl_PointCoord-0.5)>0.5)discard;gl_FragColor=vec4(uCol,1.0);}'
    );
  } catch (err) {
    root.insertAdjacentHTML('afterbegin', '<pre style="color:#f66;white-space:pre-wrap">Shader error: ' + err.message + '</pre>');
    return;
  }

  var PW = 2.0, PD = 1.5; // plane half extents (x, z)
  var planeBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, planeBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -PW, 0, -PD, PW, 0, -PD, PW, 0, PD, -PW, 0, -PD, PW, 0, PD, -PW, 0, PD]), gl.STATIC_DRAW);
  var dynBuf = gl.createBuffer(), ptBuf = gl.createBuffer();

  // ---------- vector / matrix helpers ----------
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function mul(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function norm(a) { var l = Math.sqrt(dot(a, a)) || 1; return mul(a, 1 / l); }
  function reflect(i, n) { return sub(i, mul(n, 2 * dot(i, n))); }
  function hex(h) { return [parseInt(h.substr(1, 2), 16) / 255, parseInt(h.substr(3, 2), 16) / 255, parseInt(h.substr(5, 2), 16) / 255]; }

  function perspective(fovy, aspect, near, far) {
    var f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
    return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
  }
  function lookAt(eye, target, up) {
    var f = norm(sub(target, eye)), s = norm(cross(f, up)), u = cross(s, f);
    return [s[0], u[0], -f[0], 0, s[1], u[1], -f[1], 0, s[2], u[2], -f[2], 0,
      -dot(s, eye), -dot(u, eye), dot(f, eye), 1];
  }
  function mmul(a, b) { // a * b, column-major
    var o = new Array(16), i, j, k;
    for (i = 0; i < 4; i++) for (j = 0; j < 4; j++) {
      var s = 0; for (k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k];
      o[i * 4 + j] = s;
    }
    return o;
  }

  // ---------- the surface, mirrored on the CPU so the rays match the shader ----------
  function surfN(x) {
    if (Math.abs(x) > state.width) return [0, 1, 0];
    var s = x < 0 ? -1 : 1, t = state.tilt * Math.PI / 180;
    return [s * Math.sin(t), Math.cos(t), 0];
  }

  // ---------- thick lines as camera-facing quads ----------
  function line(buf, p0, p1, w, col, eye) {
    var d = sub(p1, p0), m = mul(add(p0, p1), 0.5);
    var o = mul(norm(cross(d, sub(eye, m))), w / 2);
    var a = add(p0, o), b = sub(p0, o), c = add(p1, o), e = sub(p1, o);
    [a, b, c, b, e, c].forEach(function (v) { buf.push(v[0], v[1], v[2], col[0], col[1], col[2]); });
  }
  function arrow(buf, p0, p1, w, col, eye) {
    line(buf, p0, p1, w, col, eye);
    var d = norm(sub(p1, p0)), o = norm(cross(d, sub(eye, p1)));
    var back = sub(p1, mul(d, 0.28));
    line(buf, p1, add(back, mul(o, 0.13)), w, col, eye);
    line(buf, p1, sub(back, mul(o, 0.13)), w, col, eye);
  }

  // ---------- interaction (orbit the external view) ----------
  var yaw = 0, pitch = 0.3, dragging = false, lx = 0, ly = 0;
  canvas.addEventListener('pointerdown', function (e) { dragging = true; lx = e.clientX; ly = e.clientY; canvas.setPointerCapture(e.pointerId); canvas.style.cursor = 'grabbing'; });
  canvas.addEventListener('pointerup', function () { dragging = false; canvas.style.cursor = 'grab'; });
  canvas.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    yaw = Math.max(-1.3, Math.min(1.3, yaw - (e.clientX - lx) * 0.006));
    pitch = Math.max(0.05, Math.min(1.45, pitch + (e.clientY - ly) * 0.006));
    lx = e.clientX; ly = e.clientY;
  });

  function drawPoint(vp, p, size, col) {
    gl.useProgram(pointProg);
    gl.uniformMatrix4fv(gl.getUniformLocation(pointProg, 'uVP'), false, new Float32Array(vp));
    gl.uniform1f(gl.getUniformLocation(pointProg, 'uSize'), size);
    gl.uniform3fv(gl.getUniformLocation(pointProg, 'uCol'), col);
    gl.bindBuffer(gl.ARRAY_BUFFER, ptBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(p), gl.DYNAMIC_DRAW);
    var a = gl.getAttribLocation(pointProg, 'aPos');
    gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.POINTS, 0, 1);
  }

  function drawPlane(vp, mode, light, eye) {
    gl.useProgram(planeProg);
    var u = function (n) { return gl.getUniformLocation(planeProg, n); };
    gl.uniformMatrix4fv(u('uVP'), false, new Float32Array(vp));
    gl.uniform1i(u('uMode'), mode);
    gl.uniform3fv(u('uLight'), light); gl.uniform3fv(u('uEye'), eye);
    gl.uniform1f(u('uTilt'), state.tilt * Math.PI / 180);
    gl.uniform1f(u('uW'), state.width);
    gl.uniform1f(u('uApply'), state.apply ? 1 : 0);
    gl.uniform1f(u('uShin'), state.shin);
    gl.bindBuffer(gl.ARRAY_BUFFER, planeBuf);
    var a = gl.getAttribLocation(planeProg, 'aPos');
    gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  function frame() {
    var dpr = window.devicePixelRatio || 1;
    var w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    var half = Math.floor(w / 2);

    var light = [state.lx, state.ly, 0], cam = [state.cx, state.cy, 0], origin = [0, 0, 0];
    var P = [state.probe, 0, 0];
    var N = surfN(P[0]);
    var L = norm(sub(light, P)), V = norm(sub(cam, P));
    var I = mul(L, -1), R = reflect(I, N), R0 = reflect(I, [0, 1, 0]);
    var ang = function (a, b) { return Math.acos(Math.max(-1, Math.min(1, dot(a, b)))) * 180 / Math.PI; };
    var off = ang(R, V), off0 = ang(R0, V);
    var bright = Math.max(dot(R, V), 0); bright = dot(N, L) > 0 ? Math.pow(bright, state.shin) : 0;
    var tiltDeg = Math.acos(N[1]) * 180 / Math.PI;
    var dirTxt = N[0] < -1e-6 ? ' to the left' : N[0] > 1e-6 ? ' to the right' : '';
    readout.innerHTML =
      '<b>At the probe:</b> the normal map tilts the normal ' + tiltDeg.toFixed(0) + '°' + dirTxt + '.<br>' +
      'Reflected ray vs camera: <b>' + off.toFixed(0) + '°</b> apart' + (state.tilt !== 0 ? ' (a flat surface: ' + off0.toFixed(0) + '°)' : '') +
      ' &rarr; highlight brightness <b>' + Math.round(bright * 100) + '%</b>.';

    gl.enable(gl.SCISSOR_TEST);

    // ----- left: external view -----
    gl.scissor(0, 0, half, h); gl.viewport(0, 0, half, h);
    gl.clearColor(0.09, 0.09, 0.1, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var target = [0, 1.0, 0], dist = 9.5;
    var eye = [target[0] + dist * Math.sin(yaw) * Math.cos(pitch), target[1] + dist * Math.sin(pitch), target[2] + dist * Math.cos(yaw) * Math.cos(pitch)];
    var vpE = mmul(perspective(0.85, half / h, 0.1, 60), lookAt(eye, target, [0, 1, 0]));
    gl.disable(gl.DEPTH_TEST);
    drawPlane(vpE, 0, light, cam);

    var buf = [];
    var white = [1, 1, 1], yellow = hex('#ffd24a'), pink = hex('#ff5fd2'), orange = hex('#ff8a3d'), cyan = hex('#4de1ff'), grey = hex('#8a8a8a');
    // plane outline
    var c = [[-PW, 0, -PD], [PW, 0, -PD], [PW, 0, PD], [-PW, 0, PD]];
    for (var k = 0; k < 4; k++) line(buf, c[k], c[(k + 1) % 4], 0.03, [0.75, 0.75, 0.85], eye);
    // camera frustum
    var f = norm(sub(origin, cam)), rt = norm(cross(f, [0, 1, 0])), up = cross(rt, f);
    var cc = add(cam, mul(f, 0.8)), hw = 0.42, hh = 0.3;
    var corners = [add(add(cc, mul(rt, hw)), mul(up, hh)), add(sub(cc, mul(rt, hw)), mul(up, hh)),
      sub(sub(cc, mul(rt, hw)), mul(up, hh)), sub(add(cc, mul(rt, hw)), mul(up, hh))];
    for (k = 0; k < 4; k++) { line(buf, cam, corners[k], 0.025, cyan, eye); line(buf, corners[k], corners[(k + 1) % 4], 0.025, cyan, eye); }
    if (state.rays) {
      arrow(buf, light, P, 0.05, yellow, eye);                                  // incoming light
      var dc = Math.sqrt(dot(sub(cam, P), sub(cam, P)));
      arrow(buf, P, add(P, mul(R0, dc * 0.9)), 0.03, grey, eye);                 // flat reflection
      arrow(buf, P, add(P, mul([0, 1, 0], 1.4)), 0.035, white, eye);             // geometric normal
      arrow(buf, P, add(P, mul(N, 1.4)), 0.05, pink, eye);                       // map normal
      arrow(buf, P, add(P, mul(R, dc * 0.9)), 0.06, orange, eye);                // reflected ray
      line(buf, P, add(P, mul(V, dc * 0.97)), 0.03, cyan, eye);                  // to camera
    }
    gl.useProgram(solidProg);
    gl.uniformMatrix4fv(gl.getUniformLocation(solidProg, 'uVP'), false, new Float32Array(vpE));
    gl.bindBuffer(gl.ARRAY_BUFFER, dynBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buf), gl.DYNAMIC_DRAW);
    var pa = gl.getAttribLocation(solidProg, 'aPos'), ca = gl.getAttribLocation(solidProg, 'aCol');
    gl.enableVertexAttribArray(pa); gl.vertexAttribPointer(pa, 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(ca); gl.vertexAttribPointer(ca, 3, gl.FLOAT, false, 24, 12);
    gl.drawArrays(gl.TRIANGLES, 0, buf.length / 6);
    drawPoint(vpE, light, 20, yellow);
    drawPoint(vpE, P, 9, white);

    // ----- right: camera view -----
    gl.scissor(half, 0, w - half, h); gl.viewport(half, 0, w - half, h);
    gl.clearColor(0.09, 0.09, 0.1, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var vpC = mmul(perspective(1.0, (w - half) / h, 0.1, 60), lookAt(cam, origin, [0, 1, 0]));
    drawPlane(vpC, 1, light, cam);
    drawPoint(vpC, P, 11, [0.05, 0.05, 0.05]);
    drawPoint(vpC, P, 7, white);

    gl.disable(gl.SCISSOR_TEST);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

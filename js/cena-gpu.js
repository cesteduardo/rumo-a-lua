/* Cena do voo em WebGPU: o mesmo céu, nuvens, Terra, Lua, chama, fumaça e papel da página
   do jogo (grbrands.com.br/rumo-a-lua), tudo procedural nos shaders.
   Duas camadas em volta do canvas 2D do jogo:
   - fundo (opaco, embaixo): lavagem do céu, estrelas, Lua, Terra e as duas nuvens de trás;
   - frente (transparente, em cima): fumaça, chamas, nuvem da frente, grão do papel e vinheta.
   Sem WebGPU, RL.CenaGPU.ok fica falso e o jogo pinta como antes. */
(function () {
  const RL = window.RL;
  const G = (RL.CenaGPU = { ok: false });

  /* ================================================================ WGSL */
  const COMUM = /* wgsl */ `
struct Uni { res: vec4f, a: vec4f, b: vec4f, c: vec4f, m: vec4f, e: vec4f, f: vec4f, g: vec4f };
@group(0) @binding(0) var<uniform> U: Uni;
@group(0) @binding(1) var<storage, read> FU: array<vec4f>;
@group(0) @binding(2) var<storage, read> CH: array<vec4f>;
const M2 = mat2x2f(0.8, 0.6, -0.6, 0.8);
const M3 = mat3x3f(0.00, 0.80, 0.60, -0.80, 0.36, -0.48, -0.60, -0.48, 0.64);
const LS = vec3f(0.6234, 0.4223, 0.6636);

fn pcg(n: u32) -> u32 { var h = n * 747796405u + 2891336453u; h = ((h >> ((h >> 28u) + 4u)) ^ h) * 277803737u; return (h >> 22u) ^ h; }
fn h2(p: vec2i) -> f32 { return f32(pcg(bitcast<u32>(p.x) + pcg(bitcast<u32>(p.y)))) * 2.3283064e-10; }
fn vn(p: vec2f) -> f32 {
  let i = vec2i(floor(p)); let f = fract(p);
  let u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(h2(i), h2(i + vec2i(1, 0)), u.x), mix(h2(i + vec2i(0, 1)), h2(i + vec2i(1, 1)), u.x), u.y);
}
fn g3(i: vec3i, f: vec3f) -> f32 {
  let h = pcg(bitcast<u32>(i.x) + pcg(bitcast<u32>(i.y) + pcg(bitcast<u32>(i.z))));
  let g = vec3f(f32(h & 1023u), f32((h >> 10u) & 1023u), f32((h >> 20u) & 1023u)) * (1.0 / 511.5) - 1.0;
  return dot(g, f);
}
fn vn3(p: vec3f) -> f32 {
  let i = vec3i(floor(p)); let f = fract(p);
  let u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  let a = mix(mix(g3(i, f), g3(i + vec3i(1, 0, 0), f - vec3f(1.0, 0.0, 0.0)), u.x),
              mix(g3(i + vec3i(0, 1, 0), f - vec3f(0.0, 1.0, 0.0)), g3(i + vec3i(1, 1, 0), f - vec3f(1.0, 1.0, 0.0)), u.x), u.y);
  let b = mix(mix(g3(i + vec3i(0, 0, 1), f - vec3f(0.0, 0.0, 1.0)), g3(i + vec3i(1, 0, 1), f - vec3f(1.0, 0.0, 1.0)), u.x),
              mix(g3(i + vec3i(0, 1, 1), f - vec3f(0.0, 1.0, 1.0)), g3(i + vec3i(1, 1, 1), f - vec3f(1.0, 1.0, 1.0)), u.x), u.y);
  return 0.5 + 0.62 * mix(a, b, u.z);
}
fn fbm(p0: vec2f, oct: i32) -> f32 {
  var p = p0; var a = 0.5; var s = 0.0; var n = 0.0;
  for (var i = 0; i < oct; i++) { s += a * vn(p); n += a; p = M2 * p * 2.03 + vec2f(1.7, 9.2); a *= 0.5; }
  return s / n;
}
fn fbm3(p0: vec3f, oct: i32) -> f32 {
  var p = p0; var a = 0.5; var s = 0.0; var n = 0.0;
  for (var i = 0; i < oct; i++) { s += a * vn3(p); n += a; p = M3 * p * 2.02 + vec3f(3.1, 1.7, 5.3); a *= 0.5; }
  return s / n;
}
fn sst(a: f32, b: f32, x: f32) -> f32 { let k = clamp((x - a) / (b - a), 0.0, 1.0); return k * k * (3.0 - 2.0 * k); }
fn cov(d: f32, w: f32) -> f32 { return clamp(0.5 - d / w, 0.0, 1.0); }
fn scr(fc: vec2f) -> vec2f { return vec2f(fc.x - 0.5 * U.res.x, 0.5 * U.res.y - fc.y) / U.res.y; }
fn clip(w: vec2f) -> vec4f { return vec4f(2.0 * w.x * U.res.y / U.res.x, 2.0 * w.y, 0.0, 1.0); }
@vertex fn vsFull(@builtin(vertex_index) i: u32) -> @builtin(position) vec4f {
  return vec4f(f32(i32(i & 1u) * 4 - 1), f32(i32(i >> 1u) * 4 - 1), 0.0, 1.0);
}

fn skyGrad(p: vec2f, t: f32) -> vec3f {
  let y = clamp(p.y + 0.5, 0.0, 1.0);
  let k1 = smoothstep(0.06, 0.30, t);
  let k2 = smoothstep(0.26, 0.46, t);
  let k3 = smoothstep(0.40, 0.60, t);
  var top = mix(vec3f(0.77, 0.87, 0.86), vec3f(0.55, 0.69, 0.82), k1);
  var bot = mix(vec3f(0.97, 0.945, 0.86), vec3f(0.89, 0.92, 0.90), k1);
  top = mix(top, vec3f(0.19, 0.25, 0.43), k2); bot = mix(bot, vec3f(0.50, 0.62, 0.78), k2);
  top = mix(top, vec3f(0.115, 0.105, 0.16), k3); bot = mix(bot, vec3f(0.16, 0.15, 0.22), k3);
  return mix(bot, top, smoothstep(0.0, 1.0, y));
}

// nuvem em aquarela: densidade vem da altitude, rolagem vem da subida do foguete
fn cloud(p: vec2f, scroll: f32, dens: f32, sc: f32, sd: f32, bias: f32) -> vec4f {
  if (dens < 0.01) { return vec4f(0.0); }
  let q = vec2f(p.x * sc + sd + U.res.z * 0.006, (p.y + scroll) * sc * 1.55);
  let w = vec2f(fbm(q * 0.5 + vec2f(sd, 1.3), 2), fbm(q * 0.5 + vec2f(4.7, sd), 2));
  let qq = q + 0.55 * (w - 0.5);
  let n = fbm(qq, 4) + 0.010 * (vn(qq * 13.0) - 0.5);
  let th = mix(0.89, 0.64, dens) + bias;
  let dn = n - th;
  if (dn < -0.04) { return vec4f(0.0); }
  let alt = sst(0.10, 0.32, U.a.x);
  let st = U.c.w;
  let dn0 = dn + 0.028;
  let a0 = sst(-0.004, 0.004, dn0) * 0.34;
  var u = mix(vec3f(0.91, 0.93, 0.96), vec3f(0.82, 0.86, 0.93), alt) * (1.0 - 0.10 * exp(-max(dn0, 0.0) / 0.008));
  u = mix(u, vec3f(0.55, 0.57, 0.66), st * 0.55);
  let cv = sst(-0.004, 0.004, dn);
  let nd = fbm(qq - vec2f(0.0, 0.14), 3);
  let shm = sst(0.03, -0.06, nd - (th + 0.02)) * sst(0.0, 0.04, dn) * 0.6;
  var lit = mix(vec3f(1.0, 0.985, 0.955), vec3f(0.975, 0.98, 0.99), alt);
  var shd = mix(vec3f(0.84, 0.86, 0.91), vec3f(0.74, 0.78, 0.88), alt);
  lit = mix(lit, vec3f(0.82, 0.83, 0.87), st * 0.6);
  shd = mix(shd, vec3f(0.52, 0.54, 0.62), st * 0.6);
  var c = mix(lit, shd, shm);
  let rw = 0.004 + 0.010 * vn(qq * 2.7 + 5.0);
  c *= 1.0 - 0.17 * exp(-max(dn, 0.0) / rw);
  let A = cv + a0 * (1.0 - cv);
  return vec4f((c * cv + u * a0 * (1.0 - cv)) / max(A, 1e-4), A);
}

fn craterL(s: vec2f, sc: f32, sd: i32, pxs: f32, base: vec3f, keep: f32) -> vec3f {
  let q = s * sc;
  let id = vec2i(floor(q)) + vec2i(sd, sd * 3);
  if (h2(id) > keep) { return base; }
  let f = fract(q);
  let cp = vec2f(0.3 + 0.4 * h2(id + vec2i(3, 1)), 0.3 + 0.4 * h2(id + vec2i(1, 7)));
  let rr = mix(0.13, 0.29, h2(id + vec2i(5, 5)));
  let v = (f - cp) / rr;
  let dl = length(v);
  if (dl > 1.35) { return base; }
  let aa = max(pxs * sc / rr, 0.03);
  let side = dot(v, vec2f(0.79, 0.61));
  let inside = sst(1.0 + aa, 1.0 - aa, dl);
  var o = base * mix(1.0, 0.965 - 0.15 * sst(-0.3, 0.9, side), inside);
  let rim = sst(0.98 - aa, 1.05, dl) * sst(1.33, 1.06, dl);
  o *= 1.0 + 0.07 * rim * clamp(side / max(dl, 0.01), -1.0, 1.0);
  return o;
}

// superfície da Lua no disco unitário (d, L = |d|), r = raio na tela
fn moonSurf(d: vec2f, L: f32, r: f32, px: f32) -> vec3f {
  let z = sqrt(max(1.0 - L * L, 0.0));
  let n = vec3f(d, z);
  let s = d / (1.0 + z);
  var b = vec3f(0.965, 0.935, 0.855);
  let m = fbm3(n * 1.5 + vec3f(2.0, 5.0, 1.0), 4);
  b = mix(b, vec3f(0.74, 0.74, 0.74), sst(0.50, 0.63, m) * 0.75);
  b *= 0.93 + 0.10 * fbm3(n * 6.0 + 11.0, 3);
  let pxs = px / r * 0.5;
  b = craterL(s, 3.0, 11, pxs, b, 0.55);
  b = craterL(s, 6.5, 23, pxs, b, 0.38);
  if (r > 0.03) { b = craterL(s, 13.0, 37, pxs, b, 0.24); }
  if (r > 0.22) { b = mix(b, craterL(s, 27.0, 51, pxs, b, 0.16), sst(0.22, 0.34, r)); }
  let lam = dot(n, LS);
  b *= mix(0.60, 1.0, sst(-0.30, 0.35, lam));
  b *= 1.0 - 0.08 * sst(0.80, 1.0, L);
  return b;
}

fn moonCol(p: vec2f, px: f32, col: vec3f) -> vec3f {
  let r = U.m.z; let al = U.m.w;
  if (al <= 0.0 || r <= 0.0) { return col; }
  let d = (p - U.m.xy) / r;
  let L = length(d);
  if ((L - 1.0) * r > 0.45) { return col; }
  let day = 1.0 - smoothstep(0.28, 0.48, U.a.x);
  var o = col;
  let hg = exp(-max(L - 1.0, 0.0) * r / mix(0.07, 0.05, day));
  o = mix(o, vec3f(1.0, 0.97, 0.88), hg * mix(0.16, 0.32, day) * sst(1.0 - 1.5 * px / r, 1.0 + 1.5 * px / r, L));
  if (L < 1.03) {
    var b = moonSurf(d, min(L, 1.0), r, px);
    b = mix(b, col, day * 0.22);
    let pw = 1.3 * px / r;
    let ew = L + 0.006 * (vn(d * 6.0 + 3.0) - 0.5);
    o = mix(o, b, sst(1.0 + pw, 1.0 - pw, ew));
  }
  return mix(col, o, al);
}

// superfície da Terra: inclinada, girando, com gelo só no norte e nuvens próprias
fn earthSurf(d: vec2f, L: f32, R: f32, px: f32, an: f32) -> vec3f {
  let z = sqrt(max(1.0 - L * L, 0.0));
  let n = vec3f(d, z);
  let lod = log2(max(R * U.res.y, 1.0));
  let oct = i32(clamp(lod - 2.2, 2.0, 6.0));
  let oc2 = i32(clamp(lod - 3.0, 2.0, 5.0));
  let cs = cos(an); let sn = sin(an);
  let n0 = vec3f(n.x, 0.62 * n.y - 0.78 * n.z, 0.78 * n.y + 0.62 * n.z);
  let nr = vec3f(cs * n0.x + sn * n0.z, n0.y, -sn * n0.x + cs * n0.z);
  let land = fbm3(nr * 2.1 + 4.0, oct);
  let zf = max(z, 0.12);
  let fwl = max(2.2 * px / (R * zf), 0.0015);
  let lm = sst(0.525 - fwl, 0.525 + fwl, land);
  var b = mix(vec3f(0.27, 0.42, 0.56), vec3f(0.42, 0.59, 0.66), sst(0.40, 0.515, land));
  let dry = fbm3(nr * 3.0 + 9.0, 3);
  let lc = mix(vec3f(0.55, 0.64, 0.44), vec3f(0.79, 0.71, 0.54), sst(0.48, 0.62, dry));
  b = mix(b, lc * (0.9 + 0.15 * fbm3(nr * 12.0, 2)), lm);
  b = mix(b, vec3f(0.95, 0.96, 0.97), sst(0.935, 0.945, nr.y + 0.05 * (land - 0.5)));
  b *= 1.0 - 0.16 * exp(-abs(land - 0.525) / 0.008);
  let cl = fbm3(nr * 3.6 + vec3f(U.res.z * 0.006, 1.0, 3.0), oc2);
  b = mix(b, vec3f(0.96, 0.96, 0.95), sst(0.62 - 1.6 * fwl, 0.62 + 1.6 * fwl, cl) * 0.92);
  b *= 0.95 + 0.07 * vn(d * min(R, 2.0) * 180.0);
  let lam = dot(n, LS);
  b *= mix(0.16, 1.0, sst(-0.12, 0.30, lam));
  b = mix(b, vec3f(0.55, 0.74, 0.96), pow(1.0 - z, 3.0) * 0.55 * sst(-0.2, 0.4, lam));
  return b;
}

fn earthCol(p: vec2f, px: f32, col: vec3f) -> vec3f {
  let R = U.e.z; let a = U.e.w;
  if (a <= 0.0 || R <= 0.0) { return col; }
  let d = (p - U.e.xy) / R;
  let L = length(d);
  let th = 0.012 + 0.05 * R / (R + 0.6);
  if ((L - 1.0) * R > th * 9.0) { return col; }
  var o = col;
  let gl = exp(-max(L - 1.0, 0.0) * R / th) * sst(1.0 - 1.5 * px / R, 1.0 + 1.5 * px / R, L);
  let lg = 0.35 + 0.65 * sst(-0.6, 0.7, dot(d / max(L, 1e-4), normalize(LS.xy)));
  o = mix(o, vec3f(0.58, 0.78, 1.0), gl * 0.75 * lg);
  o += vec3f(0.10, 0.16, 0.26) * gl * gl * lg;
  let rim = exp(-max(L - 1.0, 0.0) * R / (0.35 * th)) * sst(1.0 - 1.5 * px / R, 1.0 + 1.5 * px / R, L);
  o = mix(o, vec3f(0.86, 0.96, 1.0), rim * 0.65 * lg);
  if (L < 1.02) {
    let b = earthSurf(d, min(L, 1.0), R, px, U.f.x);
    let pw = 1.3 * px / R;
    o = mix(o, b, sst(1.0 + pw, 1.0 - pw, L));
  }
  return mix(col, o, a);
}
`;

  const CENA = /* wgsl */ `
// estrelas: rolam com a subida e esticam em risco quando o foguete corre
fn starLayer(p: vec2f, cell: f32, off: f32, vel: f32, sd: i32, px: f32) -> vec3f {
  let q = vec2f(p.x / cell, p.y / cell + off);
  var id = vec2i(floor(q));
  id.y = ((id.y % 4096) + 4096) % 4096;
  id += vec2i(sd, sd * 7);
  let r0 = h2(id);
  if (r0 < 0.5) { return vec3f(0.0); }
  let f = fract(q) - 0.5;
  let o = vec2f(h2(id + vec2i(17, 3)), h2(id + vec2i(5, 41))) - 0.5;
  let dd = (f - o * 0.6) * cell / px;
  let Ls = min(U.a.w * vel / px, 0.7 * cell / px);
  let dy = max(abs(dd.y - 0.5 * Ls) - 0.5 * Ls, 0.0);
  let dpx = length(vec2f(dd.x, dy));
  let sz = mix(1.15, 2.4, pow(h2(id + vec2i(9, 9)), 3.0));
  let tw = 0.88 + 0.12 * sin(U.res.z * (0.5 + r0) + r0 * 40.0);
  let b = (sst(sz + 1.4, sz - 0.8, dpx) + 0.12 * exp(-dpx / (sz * 2.5)) * step(1.9, sz)) * tw / (1.0 + Ls * 0.035);
  let tint = mix(vec3f(1.0, 0.93, 0.82), vec3f(0.82, 0.88, 1.0), h2(id + vec2i(2, 77)));
  // correndo, só as estrelas fortes viram risco: o resto some, senão parece chuva
  let keep = mix(1.0, sst(0.80, 0.94, r0), sst(3.0, 22.0, Ls));
  return tint * b * keep * mix(0.30, 1.0, (r0 - 0.5) * (r0 - 0.5) * 4.0);
}

@fragment fn fsFundo(@builtin(position) fc: vec4f) -> @location(0) vec4f {
  let p = scr(fc.xy);
  let px = 1.0 / U.res.y;
  let t = U.a.x;
  let k3 = smoothstep(0.40, 0.60, t);
  // lavagem de aquarela (derivadas antes de qualquer desvio)
  let wq = vec2f(p.x, p.y + U.f.w) * 1.5;
  let w1 = vec2f(fbm(wq * 0.8 + vec2f(3.1, 1.7), 3), fbm(wq * 0.8 + vec2f(8.3, 2.8), 3));
  let wn = fbm(wq + 1.8 * w1, 4);
  let fw = max(fwidth(wn), 1e-4);
  var col = skyGrad(p, t);
  col *= 1.0 + (wn - 0.5) * mix(0.05, 0.14, k3);
  let bloom = smoothstep(0.50, 0.575, wn) * (1.0 - smoothstep(0.575, 0.575 + 2.0 * fw + 0.003, wn));
  col *= 1.0 - bloom * 0.012 * (1.0 - k3);
  col = mix(col, vec3f(0.27, 0.23, 0.33), smoothstep(0.40, 0.85, wn) * k3 * 0.22);
  if (U.a.y > 0.0) {
    let sv = U.a.y * sst(0.55, 0.30, dot(col, vec3f(0.3, 0.5, 0.2)));
    col += (starLayer(p, 0.045, U.a.z, 0.05, 0, px) + 0.7 * starLayer(p, 0.026, U.g.z, 0.12, 91, px)) * sv;
  }
  if (U.f.y > 0.5) { col = earthCol(p, px, col); col = moonCol(p, px, col); }
  else { col = moonCol(p, px, col); col = earthCol(p, px, col); }
  let c1 = cloud(p, U.b.x, U.c.x, 1.6, 3.0, 0.0);
  col = mix(col, mix(c1.rgb, skyGrad(p, t), 0.18), c1.a);
  let c2 = cloud(p, U.b.y, U.c.y, 1.15, 7.0, 0.0);
  col = mix(col, c2.rgb, c2.a);
  let ip = vec2i(fc.xy);
  col += (h2(ip) + h2(ip + vec2i(1013, 7)) - 1.0) / 255.0;
  return vec4f(col, 1.0);
}

/* ---------- fumaça: 3 vec4 por puff (centro, raio, alfa | semente, idade, tingida | cor) ---------- */
fn canto(i: u32) -> vec2f {
  var cs = array<vec2f, 6>(vec2f(-1.0, -1.0), vec2f(1.0, -1.0), vec2f(-1.0, 1.0), vec2f(-1.0, 1.0), vec2f(1.0, -1.0), vec2f(1.0, 1.0));
  return cs[i];
}
struct SV { @builtin(position) pos: vec4f, @location(0) uv: vec2f, @location(1) k: vec4f, @location(2) cor: vec4f };
@vertex fn vsFumaca(@builtin(vertex_index) i: u32, @builtin(instance_index) n: u32) -> SV {
  let a = FU[n * 3u]; let b = FU[n * 3u + 1u]; let c = FU[n * 3u + 2u];
  let k = canto(i);
  var o: SV;
  o.uv = k;
  o.k = vec4f(b.x, b.y, b.z, a.w);
  o.cor = c;
  o.pos = clip(a.xy + k * a.z);
  return o;
}
@fragment fn fsFumaca(v: SV) -> @location(0) vec4f {
  let r = length(v.uv);
  if (r > 1.0) { discard; }
  let sd = v.k.x * 37.0;
  let n = fbm(v.uv * 1.6 + vec2f(sd, sd * 0.7 + v.k.y * 0.6), 3);
  let f = r - (0.52 + 0.40 * n);
  let cv = sst(0.07, -0.05, f);
  let edge = exp(min(f, 0.0) / 0.11);
  let sh = sst(-0.4, 0.9, -v.uv.y * 0.9 + v.uv.x * 0.4);
  let claro = mix(vec3f(0.975, 0.96, 0.925), v.cor.rgb, v.k.z);
  let escuro = mix(vec3f(0.66, 0.65, 0.67), v.cor.rgb * 0.68, v.k.z);
  var c = mix(claro, escuro, sh * 0.9);
  c *= 1.0 - 0.15 * edge;
  let al = cv * v.k.w * (0.55 + 0.45 * edge);
  return vec4f(c * al, al);
}

/* ---------- chama: 3 vec4 (bico e eixo | meia largura, comprimento, semente, unidade | cor) ---------- */
struct FV { @builtin(position) pos: vec4f, @location(0) q: vec2f, @location(1) @interpolate(flat) n: u32 };
@vertex fn vsChama(@builtin(vertex_index) i: u32, @builtin(instance_index) n: u32) -> FV {
  let a = CH[n * 3u]; let b = CH[n * 3u + 1u];
  let k = canto(i);
  let across = k.x * b.x * 1.7;
  let along = mix(-0.08, 1.22, k.y * 0.5 + 0.5) * b.y;
  let ax = a.zw;
  let nx = vec2f(-ax.y, ax.x);
  var o: FV;
  o.pos = clip(a.xy + ax * along + nx * across);
  o.q = vec2f(across, -along) / b.w;
  o.n = n;
  return o;
}
@fragment fn fsChama(v: FV) -> @location(0) vec4f {
  let b = CH[v.n * 3u + 1u]; let c = CH[v.n * 3u + 2u];
  let un = b.w;
  let w0 = b.x / un; let L = b.y / un; let pw = 1.0 / (U.res.y * un); let sd = b.z;
  let tm = U.res.z;
  let q = v.q;
  let y = -q.y / L;
  if (y < -0.05 || y > 1.2) { discard; }
  let n = fbm(vec2f(q.x * 26.0 + sd, q.y * 9.0 + tm * 6.0), 3);
  let x = q.x - 0.007 * sin(y * 8.0 - tm * 13.0 + sd) * y;
  let prof = pow(clamp(1.0 - y, 0.0, 1.0), 0.62) * (1.0 + 0.5 * y * (1.0 - y));
  let w = w0 * prof * (0.80 + 0.42 * n);
  let d = max(max(abs(x) - w, -y * L), (y - 0.97) * L);
  let a = cov(d, pw * 1.6);
  let r = clamp(abs(x) / max(w, 1e-4), 0.0, 1.0);
  let core = sst(0.60, 0.15, r + 0.65 * y);
  let mid = sst(1.0, 0.45, r + 0.35 * y);
  var col = mix(c.rgb, mix(c.rgb, vec3f(1.0, 0.80, 0.42), 0.62), mid);
  col = mix(col, vec3f(1.0, 0.96, 0.80), core);
  let al = a * mix(1.0, 0.7, y) * c.a;
  return vec4f(col * al, al);
}

/* ---------- frente: nuvem que passa por cima, papel e vinheta (multiplicam o que está embaixo) ---------- */
@fragment fn fsFrente(@builtin(position) fc: vec4f) -> @location(0) vec4f {
  let p = scr(fc.xy);
  // perto do foguete a nuvem afina pela forma, sem esconder a cabine
  let fg = cloud(p, U.b.z, U.c.z, 0.85, 11.0, 0.16 * sst(0.38, 0.06, abs(p.x - U.b.w)));
  let gq = mat2x2f(0.866, 0.5, -0.5, 0.866) * (fc.xy / U.g.y);
  let g = 0.6 * fbm(gq * vec2f(0.20, 0.13), 2) + 0.4 * fbm(gq * 0.018 + vec2f(9.0, 3.0), 3);
  var f = min(1.0, 0.955 + 0.075 * g);
  f *= mix(1.0, 1.0 - 0.12 * U.f.z, sst(0.55, 1.1, length(p * vec2f(0.85, 1.2))));
  let ip = vec2i(fc.xy);
  let dz = (h2(ip) + h2(ip + vec2i(1013, 7)) - 1.0) / 255.0;
  let A = clamp(1.0 - (1.0 - fg.a) * f + dz, 0.0, 1.0);
  return vec4f(fg.rgb * fg.a * f, A);
}

/* ---------- pinturas paradas para os menus: Lua, Terra e nuvens soltas ---------- */
@fragment fn fsAssar(@builtin(position) fc: vec4f) -> @location(0) vec4f {
  let mode = U.g.x;
  let p = scr(fc.xy);
  let px = 1.0 / U.res.y;
  if (mode < 0.5) {
    let r = 0.5 - 2.0 * px;
    let d = p / r; let L = length(d);
    if (L > 1.0 + 3.0 * px / r) { return vec4f(0.0); }
    let b = moonSurf(d, min(L, 1.0), r, px);
    let pw = 1.3 * px / r;
    let ew = L + 0.006 * (vn(d * 6.0 + 3.0) - 0.5);
    return vec4f(b, sst(1.0 + pw, 1.0 - pw, ew));
  }
  if (mode < 1.5) {
    let R = 0.5 - 2.0 * px;
    let d = p / R; let L = length(d);
    if (L > 1.0 + 3.0 * px / R) { return vec4f(0.0); }
    var b = earthSurf(d, min(L, 1.0), R, px, 2.1);
    b = mix(b, vec3f(0.86, 0.96, 1.0), sst(0.90, 1.0, L) * 0.35);
    let pw = 1.3 * px / R;
    return vec4f(b, sst(1.0 + pw, 1.0 - pw, L));
  }
  // nuvem solta: afina para a borda até fechar a forma sozinha
  let e = length(p * vec2f(0.95, 1.85));
  let c = cloud(p, U.g.w, 0.92, 1.25, U.g.w * 3.0 + 2.0, 0.42 * sst(0.45, 0.98, e));
  return vec4f(c.rgb, c.a * sst(1.0, 0.9, e));
}
`;

  /* ======================================================== GPU */
  let dev = null, fmt = 'bgra8unorm';
  let pFundo, pFumaca, pChama, pFrente, pAssar, grupo, ubuf, fbuf, cbuf;
  /* ?perf: tempo de GPU de cada quadro (do começo do fundo ao fim da frente) em G.tempos, em ms */
  let qs = null, qres = null;
  const anel = [];
  const NFU = 320, NCH = 24;
  const UF = new Float32Array(32);
  const FUD = new Float32Array(NFU * 12);
  const CHD = new Float32Array(NCH * 12);

  const espera = (ms) => new Promise((r) => setTimeout(r, ms));

  async function iniciar() {
    if (!navigator.gpu || /[?&]semgpu\b/.test(location.search)) return false;
    let ad = null;
    // o primeiro pedido às vezes volta vazio (Chrome headless, placa acordando)
    for (let i = 0; i < 4 && !ad; i++) {
      ad = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
      if (!ad) await espera(250);
    }
    if (!ad) return false;
    const perf = /[?&]perf\b/.test(location.search) && ad.features.has('timestamp-query');
    dev = await ad.requestDevice(perf ? { requiredFeatures: ['timestamp-query'] } : undefined);
    if (perf) {
      qs = dev.createQuerySet({ type: 'timestamp', count: 2 });
      qres = dev.createBuffer({ size: 16, usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC });
      for (let i = 0; i < 8; i++) anel.push({ buf: dev.createBuffer({ size: 16, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST }), livre: true });
      G.tempos = [];
    }
    dev.lost.then(() => { G.ok = false; });
    fmt = navigator.gpu.getPreferredCanvasFormat();
    const mod = dev.createShaderModule({ code: COMUM + CENA });
    const info = await mod.getCompilationInfo();
    const erros = info.messages.filter((m) => m.type === 'error');
    if (erros.length) {
      console.error('cena-gpu: WGSL', erros.map((m) => m.lineNum + ': ' + m.message).join('\n'));
      return false;
    }
    const V = GPUShaderStage.VERTEX, F = GPUShaderStage.FRAGMENT;
    const bgl = dev.createBindGroupLayout({ entries: [
      { binding: 0, visibility: V | F, buffer: { type: 'uniform' } },
      { binding: 1, visibility: V, buffer: { type: 'read-only-storage' } },
      { binding: 2, visibility: V | F, buffer: { type: 'read-only-storage' } },
    ] });
    const layout = dev.createPipelineLayout({ bindGroupLayouts: [bgl] });
    ubuf = dev.createBuffer({ size: UF.byteLength, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    fbuf = dev.createBuffer({ size: FUD.byteLength, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
    cbuf = dev.createBuffer({ size: CHD.byteLength, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
    grupo = dev.createBindGroup({ layout: bgl, entries: [
      { binding: 0, resource: { buffer: ubuf } }, { binding: 1, resource: { buffer: fbuf } }, { binding: 2, resource: { buffer: cbuf } },
    ] });
    const pre = { color: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha' }, alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha' } };
    const pipe = (vs, fs, alvo, mistura) => dev.createRenderPipelineAsync({
      layout, vertex: { module: mod, entryPoint: vs },
      fragment: { module: mod, entryPoint: fs, targets: [mistura ? { format: alvo, blend: pre } : { format: alvo }] },
      primitive: { topology: 'triangle-list' },
    });
    [pFundo, pFumaca, pChama, pFrente, pAssar] = await Promise.all([
      pipe('vsFull', 'fsFundo', fmt, false), pipe('vsFumaca', 'fsFumaca', fmt, true), pipe('vsChama', 'fsChama', fmt, true),
      pipe('vsFull', 'fsFrente', fmt, true), pipe('vsFull', 'fsAssar', 'rgba8unorm', false),
    ]);
    return true;
  }

  G.pronto = iniciar().then((ok) => { G.ok = !!ok; return G.ok; }, (e) => { console.warn('cena-gpu:', e); G.ok = false; return false; });

  /* ---------- leitura de textura para canvas 2D (pinturas dos menus e captura de teste) ---------- */
  async function ler(tex, w, h, bgra) {
    const bpr = Math.ceil((w * 4) / 256) * 256;
    const buf = dev.createBuffer({ size: bpr * h, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });
    const enc = dev.createCommandEncoder();
    enc.copyTextureToBuffer({ texture: tex }, { buffer: buf, bytesPerRow: bpr }, [w, h]);
    dev.queue.submit([enc.finish()]);
    await buf.mapAsync(GPUMapMode.READ);
    const src = new Uint8Array(buf.getMappedRange());
    const img = new ImageData(w, h);
    for (let y = 0; y < h; y++) img.data.set(src.subarray(y * bpr, y * bpr + w * 4), y * w * 4);
    buf.unmap();
    buf.destroy();
    if (bgra) for (let i = 0; i < img.data.length; i += 4) { const t = img.data[i]; img.data[i] = img.data[i + 2]; img.data[i + 2] = t; }
    return img;
  }

  async function assarUma(modo, w, h, semente) {
    UF.fill(0);
    UF[0] = w; UF[1] = h; UF[3] = w / h; UF[28] = modo; UF[29] = 1; UF[31] = semente || 0;
    dev.queue.writeBuffer(ubuf, 0, UF);
    const tex = dev.createTexture({ size: [w, h], format: 'rgba8unorm', usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC });
    const enc = dev.createCommandEncoder();
    const ps = enc.beginRenderPass({ colorAttachments: [{ view: tex.createView(), loadOp: 'clear', storeOp: 'store', clearValue: { r: 0, g: 0, b: 0, a: 0 } }] });
    ps.setPipeline(pAssar);
    ps.setBindGroup(0, grupo);
    ps.draw(3);
    ps.end();
    dev.queue.submit([enc.finish()]);
    const img = await ler(tex, w, h, false);
    tex.destroy();
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    c.getContext('2d').putImageData(img, 0, 0);
    return c;
  }

  /* Lua, Terra e nuvens dos menus saem dos mesmos shaders do voo. */
  G.assar = async function () {
    if (!(await G.pronto)) return false;
    const P = RL.Pintura;
    P.usar('lua', await assarUma(0, 900, 900));
    P.usar('terra', await assarUma(1, 900, 900));
    for (let i = 0; i < 3; i++) P.usar('nuvem-' + i, await assarUma(2, 520, 260, 1.7 + i * 2.9));
    return true;
  };

  /* ---------- cor em texto para números (com cache) ---------- */
  const cores = new Map();
  G.cor = function (txt) {
    let c = cores.get(txt);
    if (c) return c;
    c = [0.94, 0.94, 0.9];
    const m = /^#([0-9a-f]{6})$/i.exec(txt || '');
    if (m) {
      const n = parseInt(m[1], 16);
      c = [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
    } else {
      const r = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)/.exec(txt || '');
      if (r) c = [r[1] / 255, r[2] / 255, r[3] / 255];
    }
    cores.set(txt, c);
    return c;
  };

  /* ======================================================== camada do voo */
  G.camada = function (caixa, canvas2d) {
    if (!G.ok) return null;
    const fundo = document.createElement('canvas');
    const frente = document.createElement('canvas');
    fundo.className = 'gpu-fundo';
    frente.className = 'gpu-frente';
    fundo.setAttribute('aria-hidden', 'true');
    frente.setAttribute('aria-hidden', 'true');
    caixa.insertBefore(fundo, canvas2d);
    canvas2d.after(frente);
    const cf = fundo.getContext('webgpu'), cr = frente.getContext('webgpu');
    cf.configure({ device: dev, format: fmt, alphaMode: 'opaque' });
    cr.configure({ device: dev, format: fmt, alphaMode: 'premultiplied' });
    let Wd = 1, Hd = 1, dpr = 1, nFu = 0, nCh = 0;
    const att = (view, ts) => {
      const d = { colorAttachments: [{ view, loadOp: 'clear', storeOp: 'store', clearValue: { r: 0, g: 0, b: 0, a: 0 } }] };
      if (qs) d.timestampWrites = ts === 0 ? { querySet: qs, beginningOfPassWriteIndex: 0 } : { querySet: qs, endOfPassWriteIndex: 1 };
      return d;
    };

    function passes(vF, vR) {
      dev.queue.writeBuffer(ubuf, 0, UF);
      if (nFu) dev.queue.writeBuffer(fbuf, 0, FUD, 0, nFu * 12);
      if (nCh) dev.queue.writeBuffer(cbuf, 0, CHD, 0, nCh * 12);
      const enc = dev.createCommandEncoder();
      let ps = enc.beginRenderPass(att(vF, 0));
      ps.setPipeline(pFundo);
      ps.setBindGroup(0, grupo);
      ps.draw(3);
      ps.end();
      ps = enc.beginRenderPass(att(vR, 1));
      ps.setBindGroup(0, grupo);
      if (nFu) { ps.setPipeline(pFumaca); ps.draw(6, nFu); }
      if (nCh) { ps.setPipeline(pChama); ps.draw(6, nCh); }
      ps.setPipeline(pFrente);
      ps.draw(3);
      ps.end();
      const rb = qs && anel.find((x) => x.livre);
      if (rb) {
        enc.resolveQuerySet(qs, 0, 2, qres, 0);
        enc.copyBufferToBuffer(qres, 0, rb.buf, 0, 16);
      }
      dev.queue.submit([enc.finish()]);
      if (rb) {
        rb.livre = false;
        rb.buf.mapAsync(GPUMapMode.READ).then(() => {
          const t = new BigInt64Array(rb.buf.getMappedRange());
          const ms = Number(t[1] - t[0]) / 1e6;
          rb.buf.unmap();
          rb.livre = true;
          if (ms > 0 && ms < 1000) G.tempos.push(ms);
        }, () => { rb.livre = true; });
      }
    }

    const cam = {
      fundo, frente,
      get ativa() { return G.ok; },
      medir(w, h, d) {
        Wd = Math.max(1, Math.round(w)); Hd = Math.max(1, Math.round(h)); dpr = d || 1;
        fundo.width = frente.width = Wd;
        fundo.height = frente.height = Hd;
      },
      /* tudo em pixels do aparelho (já com a câmera do jogo aplicada) */
      px(x) { return (x - Wd / 2) / Hd; },
      esc(v) { return v / Hd; },
      py(y) { return (Hd / 2 - y) / Hd; },
      limpar() { nFu = 0; nCh = 0; },
      get contagem() { return { fumaca: nFu, chamas: nCh }; },
      fumaca(x, y, r, alfa, semente, idade, cor) {
        if (nFu >= NFU || alfa < 0.004 || r < 0.5) return;
        const o = nFu++ * 12;
        FUD[o] = (x - Wd / 2) / Hd; FUD[o + 1] = (Hd / 2 - y) / Hd; FUD[o + 2] = r / Hd; FUD[o + 3] = alfa;
        FUD[o + 4] = semente; FUD[o + 5] = idade; FUD[o + 6] = cor ? 1 : 0; FUD[o + 7] = 0;
        FUD[o + 8] = cor ? cor[0] : 0; FUD[o + 9] = cor ? cor[1] : 0; FUD[o + 10] = cor ? cor[2] : 0; FUD[o + 11] = 0;
      },
      /* bico (bx, by), direção da chama (ax, ay) em pixels com y para baixo */
      chama(bx, by, ax, ay, meia, comp, semente, cor, alfa) {
        if (nCh >= NCH || comp < 1 || meia < 0.3) return;
        const l = Math.hypot(ax, ay) || 1;
        const o = nCh++ * 12;
        CHD[o] = (bx - Wd / 2) / Hd; CHD[o + 1] = (Hd / 2 - by) / Hd; CHD[o + 2] = ax / l; CHD[o + 3] = -ay / l;
        CHD[o + 4] = meia / Hd; CHD[o + 5] = comp / Hd; CHD[o + 6] = semente; CHD[o + 7] = meia / Hd / 0.056;
        CHD[o + 8] = cor[0]; CHD[o + 9] = cor[1]; CHD[o + 10] = cor[2]; CHD[o + 11] = alfa == null ? 1 : alfa;
      },
      /* parâmetros do quadro: o = { tempo, ceu, estrelas, est1, est2, rastro, rolar:[3], dens:[3], tempestade,
         fogueteX, lua:[x,y,r,a], terra:[x,y,r,a], giroTerra, luaNaFrente, lavagem, vinheta } */
      desenhar(o) {
        if (!G.ok) return;
        UF[0] = Wd; UF[1] = Hd; UF[2] = o.tempo; UF[3] = Wd / Hd;
        UF[4] = o.ceu; UF[5] = o.estrelas; UF[6] = o.est1; UF[7] = o.rastro;
        UF[8] = o.rolar[0]; UF[9] = o.rolar[1]; UF[10] = o.rolar[2]; UF[11] = o.fogueteX;
        UF[12] = o.dens[0]; UF[13] = o.dens[1]; UF[14] = o.dens[2]; UF[15] = o.tempestade;
        UF[16] = o.lua[0]; UF[17] = o.lua[1]; UF[18] = o.lua[2]; UF[19] = o.lua[3];
        UF[20] = o.terra[0]; UF[21] = o.terra[1]; UF[22] = o.terra[2]; UF[23] = o.terra[3];
        UF[24] = o.giroTerra; UF[25] = o.luaNaFrente ? 1 : 0; UF[26] = o.vinheta; UF[27] = o.lavagem;
        UF[28] = 0; UF[29] = dpr; UF[30] = o.est2; UF[31] = 0;
        try {
          passes(cf.getCurrentTexture().createView(), cr.getCurrentTexture().createView());
        } catch (e) {
          console.warn('cena-gpu:', e);
          G.ok = false;
        }
      },
      /* Só para teste: junta fundo, canvas 2D e frente numa imagem PNG. */
      async capturar() {
        const usa = GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC;
        const tF = dev.createTexture({ size: [Wd, Hd], format: fmt, usage: usa });
        const tR = dev.createTexture({ size: [Wd, Hd], format: fmt, usage: usa });
        passes(tF.createView(), tR.createView());
        const bgra = fmt === 'bgra8unorm';
        const a = await ler(tF, Wd, Hd, bgra), b = await ler(tR, Wd, Hd, bgra);
        tF.destroy(); tR.destroy();
        const c = document.createElement('canvas');
        c.width = Wd; c.height = Hd;
        const x = c.getContext('2d');
        x.putImageData(a, 0, 0);
        x.drawImage(canvas2d, 0, 0, Wd, Hd);
        const m = x.getImageData(0, 0, Wd, Hd), d = m.data, f = b.data;
        for (let i = 0; i < d.length; i += 4) {
          const k = 1 - f[i + 3] / 255;
          d[i] = f[i] + d[i] * k; d[i + 1] = f[i + 1] + d[i + 1] * k; d[i + 2] = f[i + 2] + d[i + 2] * k; d[i + 3] = 255;
        }
        x.putImageData(m, 0, 0);
        return c.toDataURL('image/png');
      },
      destruir() {
        try { cf.unconfigure(); cr.unconfigure(); } catch (e) { /* já foi */ }
        fundo.remove();
        frente.remove();
      },
    };
    return cam;
  };
})();

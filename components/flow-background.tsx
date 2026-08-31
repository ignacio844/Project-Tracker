'use client'

import * as React from 'react'

const FLOW_CONFIG = {
  name: 'Untitled blend',
  type: 'flow',
  profile: 'sRGB',
  soften: 0,
  noise: 6,
  speed: 10,
  stops: [
    { hex: '#00A3AF', position: 0.125 },
    { hex: '#1E50A2', position: 0.375 },
    { hex: '#181B3A', position: 0.625 },
    { hex: '#1C1C1C', position: 0.875 },
  ],
} as const

const VERTEX_SHADER = `
  attribute vec2 a_position;

  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`

const FRAGMENT_SHADER = `
  precision highp float;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_noise;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  vec3 colorRamp(float value) {
    vec3 paleBlueGreen = vec3(0.0, 163.0, 175.0) / 255.0;
    vec3 lapis = vec3(30.0, 80.0, 162.0) / 255.0;
    vec3 samuraiIndigo = vec3(24.0, 27.0, 58.0) / 255.0;
    vec3 inkBlack = vec3(28.0, 28.0, 28.0) / 255.0;

    vec3 color = paleBlueGreen;
    color = mix(color, lapis, smoothstep(0.125, 0.375, value));
    color = mix(color, samuraiIndigo, smoothstep(0.375, 0.625, value));
    color = mix(color, inkBlack, smoothstep(0.625, 0.875, value));
    return color;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 point = vec2(uv.x, 1.0 - uv.y);
    float aspect = u_resolution.x / max(u_resolution.y, 1.0);

    vec2 flow = vec2(
      sin(point.y * 3.1 + u_time * 1.15) + sin(point.x * 5.3 - u_time * 0.7),
      cos(point.x * 2.7 - u_time) + cos(point.y * 4.9 + u_time * 0.82)
    );
    point += flow * vec2(0.055 / max(aspect, 1.0), 0.055);

    float diagonal = (point.x + point.y) * 0.5;
    float fold =
      sin((point.x * 2.2 + point.y * 1.6) * 3.14159 + u_time * 0.65) *
      cos((point.y * 2.4 - point.x) * 3.14159 - u_time * 0.48);
    float value = diagonal + fold * 0.075;

    vec3 color = colorRamp(value);
    float grain = (hash(floor(gl_FragCoord.xy)) - 0.5) * u_noise;
    color = clamp(color + grain, 0.0, 1.0);

    gl_FragColor = vec4(color, 1.0);
  }
`

function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

export function FlowBackground() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      powerPreference: 'low-power',
    })
    if (!gl) return
    const surface: HTMLCanvasElement = canvas
    const context: WebGLRenderingContext = gl

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
    if (!vertexShader || !fragmentShader) return

    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    )

    const position = gl.getAttribLocation(program, 'a_position')
    const resolution = gl.getUniformLocation(program, 'u_resolution')
    const time = gl.getUniformLocation(program, 'u_time')
    const noise = gl.getUniformLocation(program, 'u_noise')

    gl.useProgram(program)
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

    let frame = 0
    const startedAt = performance.now()

    function resize() {
      const width = Math.max(1, Math.round(surface.clientWidth))
      const height = Math.max(1, Math.round(surface.clientHeight))
      if (surface.width !== width || surface.height !== height) {
        surface.width = width
        surface.height = height
      }
      context.viewport(0, 0, width, height)
    }

    function draw(now: number) {
      resize()
      context.uniform2f(resolution, surface.width, surface.height)
      context.uniform1f(
        time,
        ((now - startedAt) / 1000) * (FLOW_CONFIG.speed / 10)
      )
      context.uniform1f(noise, FLOW_CONFIG.noise / 255)
      context.drawArrays(context.TRIANGLES, 0, 6)
      frame = requestAnimationFrame(draw)
    }

    frame = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frame)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="flow-background"
      aria-hidden="true"
    />
  )
}

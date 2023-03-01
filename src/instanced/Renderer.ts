import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { Group, PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { LightScheme } from './LightScheme'

export class Renderer {
  public readonly scene: THREE.Scene
  private readonly perspCamera: THREE.PerspectiveCamera
  private width = 10
  private height = 10
  private readonly controls: OrbitControls
  private readonly renderer: WebGLRenderer
  private readonly composer: EffectComposer
  private lightScheme?: LightScheme
  private callbacks: (() => void)[] = []

  public constructor(private readonly root: HTMLElement) {
    this.updateSize = this.updateSize.bind(this)
    this.animate = this.animate.bind(this)

    this.scene = new Scene()
    const group = new Group()
    this.scene.add(group)

    {
      this.renderer = new WebGLRenderer({ antialias: true, alpha: false })
      // this.renderer.shadowMap.enabled = true
      // this.renderer.shadowMap.type = PCFSoftShadowMap
      this.renderer.setPixelRatio(window.devicePixelRatio)
      this.renderer.setSize(this.width, this.height)
      this.renderer.setClearColor(0x999999)
    }

    {
      this.perspCamera = new PerspectiveCamera(
        45,
        this.width / this.height,
        0.1,
        1000
      )
      this.perspCamera.position.set(0.5, 0.5, 2)
      this.perspCamera.lookAt(0.5, 0.5, 0)
    }

    this.updateSize()

    {
      this.composer = new EffectComposer(this.renderer)
      this.composer.setSize(this.width, this.height)
      this.composer.addPass(new RenderPass(this.scene, this.perspCamera))
    }

    {
      this.controls = new OrbitControls(
        this.perspCamera,
        this.renderer.domElement
      )
      this.controls.minDistance = 2
      this.controls.maxDistance = 12
      // this.controls.maxPolarAngle = (7 * Math.PI) / 16
      this.controls.target.set(0, 0, 0)
      this.controls.enableDamping = true
      this.controls.zoomSpeed = 0.5
    }

    window.addEventListener('resize', this.updateSize)

    this.root.appendChild(this.renderer.domElement)
  }

  public addLightScheme(lightScheme: LightScheme) {
    this.lightScheme = lightScheme
  }

  private updateSize() {
    if (!this.root) {
      return
    }
    const rect = this.root.getBoundingClientRect()
    this.width = rect.width
    this.height = rect.height
    this.perspCamera.aspect = this.width / this.height
    this.perspCamera.updateProjectionMatrix()
    this.renderer.setSize(this.width, this.height)
  }

  public animate() {
    this.controls?.update()
    this.controls.update()
    this.composer.render()
    this.lightScheme?.update()
    this.callbacks.forEach((callback) => callback())
    const drawCalls = this.renderer.info.render.calls
    console.log(`Number of draw calls per frame: ${drawCalls}`)
    requestAnimationFrame(this.animate)
  }

  public setCallback(arg: any) {
    this.callbacks.push(arg)
  }
}

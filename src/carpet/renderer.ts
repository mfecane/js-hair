import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import {
  DirectionalLight,
  Group,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three'

export class Renderer {
  public readonly scene: THREE.Scene
  private readonly perspCamera: THREE.PerspectiveCamera
  private width = 10
  private height = 10
  private readonly shadowSize = 0.6
  private readonly controls: OrbitControls
  private readonly renderer: WebGLRenderer
  private readonly composer: EffectComposer

  public constructor(private readonly root: HTMLElement) {
    this.updateSize = this.updateSize.bind(this)
    this.animate = this.animate.bind(this)


    this.scene = new Scene()
    const group = new Group()
    this.scene.add(group)

    {
      this.renderer = new WebGLRenderer({ antialias: true, alpha: true })
      this.renderer.shadowMap.enabled = true
      this.renderer.shadowMap.type = PCFSoftShadowMap
      this.renderer.setPixelRatio(window.devicePixelRatio)
      this.renderer.setSize(this.width, this.height)
    }

    {
      const directionalLight = new DirectionalLight(0xffffff, 0.8)
      directionalLight.position.set(
        1,
        2,
        1
      )
      this.scene.add(directionalLight.target)
      directionalLight.target.position.set(0, 0, 0)
      directionalLight.castShadow = true
      directionalLight.shadow.radius = 4
      directionalLight.shadow.mapSize.width = 2048 // default
      directionalLight.shadow.mapSize.height = 2048 // default
      directionalLight.shadow.camera.near = 0.5 // default
      directionalLight.shadow.camera.far = 2 // default
      directionalLight.shadow.camera.top = this.shadowSize
      directionalLight.shadow.camera.right = this.shadowSize
      directionalLight.shadow.camera.bottom = -this.shadowSize
      directionalLight.shadow.camera.left = -this.shadowSize
      this.scene.add(directionalLight)

      const directionalLight2 = new DirectionalLight(0xffffff, 0.5)
      directionalLight2.position.set(
        -1,
        2,
        -0.5
      )
      this.scene.add(directionalLight2.target)
      directionalLight2.target.position.set(0, 0, 0)
      this.scene.add(directionalLight2)

      const directionalLight3 = new DirectionalLight(0xffffff, 0.3)
      directionalLight3.position.set(
        0.5,
        2,
        -0.5
      )
      this.scene.add(directionalLight3.target)
      directionalLight3.target.position.set(0, 0, 0)
      this.scene.add(directionalLight3)
    }

    {
      this.perspCamera = new PerspectiveCamera(45, 1, 0.1, 2000)
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
      this.controls.minDistance = 3
      this.controls.maxDistance = 10
      this.controls.target.set(0, 0, 0)
      this.controls.enableDamping = true
      this.controls.zoomSpeed = 0.5
    }
    
    window.addEventListener('resize', this.updateSize)

    this.root.appendChild(this.renderer.domElement)
  }

  private updateSize() {
    if (!this.root) {
      return
    }
    this.perspCamera.updateProjectionMatrix()
    const rect = this.root.getBoundingClientRect()
    const min = Math.min(rect.width, rect.height)
    this.width = min
    this.height = min
    this.renderer.setSize(min, min)
  }

  public animate() {
    requestAnimationFrame(this.animate)
    this.controls?.update()
    this.controls.update()
    this.composer.render()
  }
}

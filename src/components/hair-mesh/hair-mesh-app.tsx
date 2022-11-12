import { useEffect } from 'react'
import { init, mount, unmount } from 'src/hair-mesh/scene'

import './hair-mesh-app.scss'

const HairMeshApp = () => {
  useEffect(() => {
    init()
    mount('#hairMeshRenderer')
    return unmount
  })

  return <div id="hairMeshRenderer"></div>
}

export default HairMeshApp

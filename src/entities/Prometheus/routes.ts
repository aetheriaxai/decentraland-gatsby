import client from 'prom-client'

import { handleRaw } from '../Route/handle'
import routes from '../Route/routes'
import { registry } from './metrics'
import { withPrometheusToken } from './middleware'

const PROMETHEUS_REGISTRIES = [registry, client.register]
let PROMETHEUS_REGISTRY = client.Registry.merge(PROMETHEUS_REGISTRIES)

export default routes((router) => {
  router.get(
    '/metrics',
    withPrometheusToken({ optional: true }),
    handleRaw(getMetrics, client.register.contentType)
  )
})

export function exposeRegistry(registry: client.Registry) {
  if (!PROMETHEUS_REGISTRIES.includes(registry)) {
    PROMETHEUS_REGISTRIES.push(registry)
    PROMETHEUS_REGISTRY = client.Registry.merge(PROMETHEUS_REGISTRIES)
  }

  return PROMETHEUS_REGISTRIES.length
}

export async function getMetrics() {
  return PROMETHEUS_REGISTRY.metrics()
}

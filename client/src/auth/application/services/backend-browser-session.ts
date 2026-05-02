// English description: Starts the backend PHP browser session without exposing the access token in the URL.

import { backendRoutes } from "../../../shared-kernel/application/constants/route-registry"
import { useBackendWebUrl } from "../../../shared-kernel/application/utils/backend-web-url"

export function submitBackendBrowserSession(accessToken: string) {
  const sessionUrl = useBackendWebUrl(backendRoutes.session.setBrowserCookie)

  if (import.meta.server) {
    return
  }

  const form = document.createElement("form")
  form.method = "POST"
  form.action = sessionUrl
  form.style.display = "none"

  const tokenInput = document.createElement("input")
  tokenInput.type = "hidden"
  tokenInput.name = "access_token"
  tokenInput.value = accessToken

  form.appendChild(tokenInput)
  document.body.appendChild(form)
  form.submit()
}

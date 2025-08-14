import { Router } from 'express'
import { respondWithError } from 'shared/error'
import { Requests } from 'types/requests'
import fetch from 'node-fetch'

export const storageRouter = (di: DependencyContainer) => {
  const router = Router()

  router.get<'/:path(.*)', { path: string }, Requests['/storage/:path']['GET']['response']>(
    '/:path(.*)',
    async (req, res) => {
      try {
        const [url] = await di.storage
          .bucket()
          .file(req.params.path)
          .getSignedUrl({
            action: 'read',
            expires: Date.now() + 1000 * 60 * 60, // 1 hour
          })

        // fetch the remote file
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.statusText}`)
        }

        // Set headers so client gets correct file type
        res.setHeader(
          'Content-Type',
          response.headers.get('content-type') || 'application/octet-stream',
        )
        res.setHeader('Content-Length', response.headers.get('content-length') || '')

        // Stream the file content directly to the response
        response.body?.pipe(res)
      } catch (err) {
        respondWithError(res, err)
      }
    },
  )

  return router
}

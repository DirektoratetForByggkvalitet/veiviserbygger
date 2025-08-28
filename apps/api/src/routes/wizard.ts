import { Router } from 'express'
import { getCompleteWizard } from '../services/firestore'
import { respondWithError } from 'shared/error'
import { transformWizardDataToLosen } from '../utils/losen'
import { get, set } from '../services/cache'
import { Requests } from 'types/requests'

export const wizardRouter = (di: DependencyContainer) => {
  const router = Router()

  router.get<
    '/:wizardId/:versionId?',
    { wizardId: string; versionId?: string },
    Requests['/wizard/:wizardId/:versionId?']['GET']['response']
  >('/:wizardId/:versionId?', async (req, res) => {
    try {
      let cachedSchema: string | undefined

      try {
        // check if we have the schema in cache
        cachedSchema = !req.params.versionId
          ? await get(di.redis, `schema:${req.params.wizardId}`, true)
          : undefined

        // return cached schema if found
        if (cachedSchema) {
          res.contentType('application/json')
          res.send(cachedSchema as any)
          return
        }
      } catch (err) {
        console.error('Failed to get cached schema for wizard', req.params.wizardId, err)
      }

      const wizardData = await getCompleteWizard(di.db, req.params.wizardId, req.params.versionId)
      const schema = await transformWizardDataToLosen(wizardData, di)

      // cache the published version schema
      if (wizardData && !req.params.versionId) {
        try {
          await set(di.redis, `schema:${req.params.wizardId}`, schema)
          console.log('Cached schema for wizard', req.params.wizardId)
        } catch (err) {
          console.error('Failed to cache schema for wizard', req.params.wizardId, err)
        }
      }

      res.json(schema)
    } catch (err) {
      respondWithError(res, err)
    }
  })

  return router
}

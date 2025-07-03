import { Router } from 'express'
import { getCompleteWizard } from '../services/firestore'
import { respondWithError } from 'shared/error'
import { transformWizardDataToLosen } from '../utils/losen'

export const wizardRouter = (di: DependencyContainer) => {
  const router = Router()

  router.get('/:wizardId/:versionId?/preview', async (req, res) => {
    try {
      const wizardData = await getCompleteWizard(di.db, req.params.wizardId, req.params.versionId)
      res.send(transformWizardDataToLosen(wizardData, di))
    } catch (err) {
      respondWithError(res, err)
    }
  })

  return router
}

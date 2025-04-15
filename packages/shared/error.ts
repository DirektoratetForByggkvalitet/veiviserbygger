export const ErrorCodes = {
  UNAUTHORIZED: {
    statusCode: 401,
    displayError: 'You are not authorized to access this resource',
  },
  BAD_REQUEST: {
    statusCode: 400,
    displayError: 'Bad request',
  },
  NOT_FOUND: {
    statusCode: 404,
    displayError: 'Resource not found',
  },
  UNSPECIFIED_ERROR: {
    statusCode: 500,
    displayError: 'An unspecified error occurred',
  },
  UPSTREAM_DATA_ERROR: {
    statusCode: 502,
    displayError: 'An error occurred while fetching data from the upstream service',
  },
}

type ErrorCode = keyof typeof ErrorCodes

const IS_JEST =
  typeof process === 'undefined' ? false : process?.env?.['JEST_WORKER_ID'] !== undefined

function getErrorCodeForError(error: any): ErrorCode {
  const errorCode: ErrorCode = error?.response?.error?.code || error?.name

  if (!ErrorCodes?.[errorCode]) {
    return 'UNSPECIFIED_ERROR'
  }

  return errorCode
}

export function getDisplayError(error: any) {
  const errorCode = getErrorCodeForError(error)
  return ErrorCodes?.[errorCode]?.displayError || error.message
}

export function respondWithError(res: any, error: any) {
  const errorCode = getErrorCodeForError(error)
  const statusCode = ErrorCodes[errorCode]?.statusCode || 500
  const displayError = getDisplayError(error)

  !IS_JEST && console.error(error.message)
  return res.status(statusCode).send({
    error: {
      code: errorCode,
      message: displayError,
    },
  })
}

export class CustomError extends Error {
  constructor(name: ErrorCode, message?: string) {
    super(message)
    this.name = name
    this.message = message || name
  }

  public is(name: ErrorCode) {
    return this.name === name
  }
}

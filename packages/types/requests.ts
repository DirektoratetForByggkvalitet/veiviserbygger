export type Requests = {
  '/config': {
    GET: {
      response: { flags?: Record<string, boolean>; constants?: Record<string, string> }
      query: {
        // query?: string
      }
    }
  }
  '/storage/:path': {
    GET: {
      response: Blob
    }
  }
}

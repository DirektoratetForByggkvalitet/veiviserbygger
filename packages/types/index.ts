export type Awaited<T> = T extends PromiseLike<infer U> ? U : T

export type Requests = {
  '/config': {
    GET: {
      response: { flags?: Record<string, boolean>; constants?: Record<string, string> }
      query: {
        // query?: string
      }
    }
  }
}

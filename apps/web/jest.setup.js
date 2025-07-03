expect.extend({
  toBeReferenceTo(received, expected) {
    const pass = received.path === expected.path

    return {
      pass,
      message: () =>
        `expected DocumentReference(${received.path}) ${
          pass ? 'not ' : ''
        }to equal DocumentReference(${expected.path})`,
    }
  },
})

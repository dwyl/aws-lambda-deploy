// this file is exclusively for regression test: https://github.com/numo-labs/aws-lambda-deploy/issues/21
module.exports = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      properties: {
        functionName: {
          type: 'string'
        },
        createAlias: {
          type: 'boolean'
        }
      },
      required: ['functionName']
    }
  },
  required: ['body']
};

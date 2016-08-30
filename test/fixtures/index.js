// your ES6 lambda function goes here!
import utils from '../lib/utils';

exports.handler = (event, context) => {
  const basepath = utils.getBasepath();
  if (event.hello === 'world') {
    return context.fail(JSON.stringify({
      statusCode: 500,
      message: 'sorry'
    }));
  } else {
    return context.succeed({
      statusCode: 200,
      message: basepath
    });
  }
};

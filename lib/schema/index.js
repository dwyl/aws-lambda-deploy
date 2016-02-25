// your ES6 lambda function goes here!
import utils from '../../lib/utils';

exports.handler = (event, context) => {
  const base_path = utils.get_base_path();
  if (event.hello === 'world') {
    return context.fail(JSON.stringify({
      statusCode: 500,
      message: 'sorry'
    }));
  } else {
    return context.succeed({
      statusCode: 200,
      message: base_path
    });
  }
};

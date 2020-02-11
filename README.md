<div align="center">

![dpl-logo](https://cloud.githubusercontent.com/assets/194400/13200090/e0a7831c-d831-11e5-809e-4a802b267045.png)

Deploy your AWS Lambda function(s) in seconds with a single command.

[![Build Status](https://img.shields.io/travis/dwyl/aws-lambda-deploy/master.svg?style=flat-square)](https://travis-ci.org/dwyl/aws-lambda-deploy)
[![codecov.io](https://img.shields.io/codecov/c/github/dwyl/aws-lambda-deploy/master.svg?style=flat-square)](http://codecov.io/github/dwyl/aws-lambda-deploy?branch=master)
[![Code Climate maintainability](https://img.shields.io/codeclimate/maintainability/dwyl/aws-lambda-deploy?color=brightgreen&style=flat-square)](https://codeclimate.com/github/dwyl/aws-lambda-deploy)
[![dependencies Status](https://david-dm.org/dwyl/aws-lambda-deploy/status.svg?style=flat-square)](https://david-dm.org/dwyl/aws-lambda-deploy)
[![devDependencies Status](https://david-dm.org/dwyl/aws-lambda-deploy/dev-status.svg?style=flat-square)](https://david-dm.org/dwyl/aws-lambda-deploy?type=dev)
[![HitCount](http://hits.dwyl.com/dwyl/aws-lambda-deploy.svg)](http://hits.dwyl.com/dwyl/aws-lambda-deploy)
[![npm package version](https://img.shields.io/npm/v/dpl.svg?color=brightgreen&style=flat-square)](https://www.npmjs.com/package/dpl)

</div>
<br />


## Why?

Deploying Lambda functions *manually* involves quite a few steps.  
Manually clicking buttons to upload zip files is fine the first few times
but gets old pretty quickly.  
There is an *easier* way!


## What?

Simplify the process of deploying a AWS Lambda Function
*without having to adopt a build tool/system*.


## How?

There are ***5 Steps*** to setup deployment for your Lambda Function:

### 1. install the `dpl` package from NPM

```sh
npm install dpl --save-dev
```

### 2. Ensure that the *required* AWS Environment Variables are set:

You need to have `AWS_REGION` and `AWS_IAM_ROLE` set.
We have created a
[`.env_sample`](https://github.com/dwyl/aws-lambda-deploy/blob/master/.env_sample)
that shows you _exactly_ which environment variables you need.

Simply copy it into your project. e.g:

```sh
cp node_modules/dpl/.env_sample .env && echo ".env\n" >> .gitignore
```

And then update the values with the _real_ ones for your project.

> **Note**: You need to have your AWS Credentials set
to use the `aws-sdk` if you have not yet done this,
see below for instructions.


### 3. Add the *list* of `files_to_deploy` entry to your `package.json`

In your `package.json` file, add the list of files & directories
you want to be included in your distribution.

Example:
```js
"files_to_deploy": [ "package.json", "index.js", "lib/" ]
```

> Sample: [package.json#L14-L17](https://github.com/dwyl/aws-lambda-deploy/blob/81766f9c20157039e14703e36dbbbaef4cfb4ac3/package.json#L14-L17)


### 4. Add the deployment script to the `scripts` section in your `package.json`

Example:
```js
"scripts": {
	"deploy": "dpl"
}
```


### 5. Use the script to *Deploy*!

```sh
npm run deploy
```

### *Congratulations* your Lambda Function is Deployed!  


<br />

### *Troubleshooting*

> If you see an *error* message in your console,
> read the message and resolve it by correcting your setup.
> you have either not set your AWS Credentials or not defined
> the required environment variables.
> If you get stuck or have questions,
[*ping* us!](https://github.com/dwyl/aws-lambda-deploy/issues)


## *Implementation Detail*

### *Required* Environment Variables

Deploying your Lambda function requires a few Environment Variables
to be set.

#### AWS Credentials

As with all node.js code which uses the `aws-sdk`,
it expects to have your AWS credentials stored *locally*.
Your credentials are *expected* to be at: `~/.aws/credentials`
(*e.g: if your username is* ***alex***, *your AWS credentials will
  be stored at* `/Users/alex/.aws/credentials`)
If you have not yet set your AWS credentials on your machine
do this *now*. Read about the [AWS credential format](http://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/credentials.html#credentials-file-format).

#### `AWS_IAM_ROLE`

The script needs to know which `AWS_IAM_ROLE`
you want to use to deploy/run the function.

Example:
```sh
export AWS_IAM_ROLE=arn:aws:iam::123456789:role/LambdaExecRole
```

#### `AWS_REGION` (*where your lambda function will be deployed*)

Example:
```sh
export AWS_REGION=eu-west-1
```

#### *Optionally* you can define a `TMPDIR` Environment Variable

To make the deployment script's run faster,
and avoid forcing people to add entries into their `.gitignore` file,
we store the `/dist` directory and resulting `.zip` file
in your OS's Temporary storage.

e.g:
```sh
export TMPDIR=/path/to/where/you/want/dist/
```


### Two things to add to your `package.json`

For the deploy scrip to do its job,
we need to add two lines to our `package.json`

### List of `files_to_deploy`  

In your `package.json` file, add the list of files & directories
you want to be included in your distribution.

Example:
```js
"files_to_deploy": [ "package.json", "index.js", "lib/", ".env" ]
```

This tells `dpl` to copy these files and directory (with all contents)
to the `/dist` which will be zipped and sent to AWS.

Check our `package.json` if in doubt.

## Explanation of the Steps

### `dpl` ("*Deploy Lambda*") performs the following 5 tasks

#### 1. *Create* the `/dist` (*distribution*) directory

Instead of uploading *all* the files in a project to S3/Lambda we upload only
the *required* files. e.g: `/src` or `/lib` and `./index.js`.
While we are preparing this package, these required files are *copied* to
the (*temporary*) `/dist` directory which will be *zipped* in Step 5.

> Why a *temporary* directory?
see: http://stackoverflow.com/questions/17946360/what-are-the-benefits-of-using-the-official-temp-directory-for-the-os

<br />

#### 2. *Copy* required files into `/dist` directory

This typically includes the following:


+ `lib/` - the directory containing custom code your lambda function uses.
+ `package.json` - the "manifest" file for your project,
includes the Lambda function name, any configuration and dependencies.
+ `index.js` - the "*main*" `handler` of your Lambda function.

<br />

#### 3. *Install* (*only production*) `node_modules` in `/dist` directory

We only need the "*production*" dependencies to be zipped and shipped.
so instead of copying all the *devDependencies* in `node_modules`,
we simply install a fresh set using the `--production` flag.

<br />

#### 4. *Zip* the contents of the `/dist` folder to `{function_name}.zip`

Once the `/dist` directory has been created with the necessary files
and the dependencies have been installed in `/dist/node_modules`
we `zip` the "*distribution*" ready for uploading to AWS.

This can take a few seconds depending on how many dependencies your
Lambda function has.

<br />

#### 5. *Upload*

Once the `zip` has been packaged we upload it to AWS using the `aws-sdk`.
Your Lambda function will be named according to the `"name"` in
the `package.json` file for your project.

> **Note**: We are using the ***latest stable version*** of **Node.js**
when deploying packages.
see: https://aws.amazon.com/blogs/compute/node-js-4-3-2-runtime-now-available-on-lambda/  
If for any reason you *prefer*/*need* to use
the "*Old*" (*legacy*) version, please let us know:
https://github.com/dwyl/aws-lambda-deploy/issues/33

<br />


### Advantages of using `dpl` to *deploy* your Lambdas

+ **Minial Dependencies** - Our solution to the deployment task uses only *one*
core dependency: the [`aws-sdk`](https://github.com/aws/aws-sdk-js).  

+ **Small Code** - The *entire* `dpl` ("*Deploy Lambda*") module is fewer lines
than our original  
[`gulpfile.js`](https://github.com/dwyl/aws-lambda-canary/blob/d18ccc099ec4ab1a7a612716563ec57364c03cc4/gulpfile.js)
and uses *only* node.js core modules
(*you know and love*) and your OS-native `zip` command.

+ A *beginner* can ***read and understand*** all the code used in `dpl`
in a few minutes; our code has *both* JavaDoc and *in-line comments* and we are
[*here*](https://github.com/dwyl/aws-lambda-deploy/issues)
to help if you have *any questions*!

+ **No assumptions** about your code style.
e.g if you need any custom processing
simply add a task in your `scripts` section of your `package.json`
and run that task before deploying.

+ **No _Global_ packages** required or implied, just *one `dev` Dependency*.

### Optional configuration

Want to specify the `MemorySize` or `Timeout` settings for your Lambda function?

+ `"lambda_memory"` - maximum memory allocation for your lambda function.
+ `"lambda_timeout"` - maximum execution time.

In your `package.json` add:

```js
"lambda_memory":"512",
"lambda_timeout": "30",
```

### *Environment Variables*?

Unlike other AWS Lambda deployment methods,
`dpl` lets you use environment
variables in your Lambda Functions!

Simply add `.env` to your list of `"files_to_deploy"` in your `package.json`

Example:
```js
"files_to_deploy": [ "package.json", "index.js", "lib/", ".env" ]
```
And an `.env` file will included in your `.zip` file that gets uploaded to AWS.
This means you can use an Environment Variable loader
e.g [`env2`](https://www.npmjs.com/package/env2)
in your Lambda function:

```js
require('env2')('.env');

exports.handler = (event, context) => {
  if (event.hello === 'world') {
    return context.fail(JSON.stringify({
      statusCode: 500,
      message: 'sorry'
    }));
  } else {
    return context.succeed({
      statusCode: 200,
      message: process.env.HELLO  // or how ever you use environment variables!
    });
  }
};

```


## Suggested Reading

+ Using NPM as a build tool:
http://blog.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/
(*you don't need gulp/grunt/etc...*)

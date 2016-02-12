# aws-lambda-deploy

Deploy your Amazon Web Services Lambda function(s) with a single command.

## Why?

Deploying your lambda functions *manually* involves quite a few steps.
Manually clicking buttons to upload zip files is fine the first few times
but gets old pretty quickly. When you feel the pain, we have the cure.


## What?

Simplify the process of deploying a new (*version of your*)
AWS Lambda Function and check it is working.


## How?

### *Required* Environment Variables

#### AWS Credentials

As with all node.js code which uses the `aws-sdk`,
it expects to have your AWS credentials stored on locally.
Your credentials are *expected* to be at: `~/.aws/credentials`
(*e.g: if your username is* ***alex***, *your AWS credentials will
  be stored at* `/Users/alex/.aws/credentials`)
If you have not yet set your AWS credentials on your machine
do this now.

#### AWS `IAM_ROLE`

The script needs to know which `IAM_ROLE` you want to use to deploy/run
the function.

### Parameters  



### Steps

#### 1. Create the `/dist` (*distribution*) directory (*if it does not exist*)

Instead of uploading *all* the files in a project to S3/Lambda we upload only
the *required* files. e.g: `/src` or `/lib` and `./index.js`.
While we are preparing this package, these required files are *copied* to
the (*temporary*) `/dist` directory which will be *zipped* in step 5.

#### 2. Copy required files into `/dist` directory



#### 3. Copy `package.json` into `/dist` directory



#### 4. Install (*only production*) `node_modules` in `/dist` directory



#### 7. Get Name of Lambda from `package.json`





### Gulp?

Instead of re-inventing task processing, we opted to use Gulp as our task
runner. Gulp is *well documented*, *tested* and *maintained*. [![Build Status](https://img.shields.io/travis/gulpjs/gulp.svg)](https://travis-ci.org/gulpjs/gulp)   [![Coveralls Status](https://img.shields.io/coveralls/gulpjs/gulp/master.svg)](https://coveralls.io/r/gulpjs/gulp)
*Crucially* all the gulp *plugins* needed to "*transpile*" (ES6>ES5),
*pack* and *zip* your code ready for sending it to AWS are already  


### Babel ?

Given that AWS Lambda only supports Node.js **v0.10.36** (*at present*)
the code you *deploy* to Lambda needs to be **ES5 _Only_**.
Since most of the *cool kids* are using ES6/2015
(*aka* [***modern javascript***](https://twitter.com/ericdfields/status/677677470590570496) ...)
the *build* script includes a *transform* step to translate ES6 into ES5
so your ES6 Code will run on Lambda.

### Name?

+ https://www.npmjs.com/package/deploy-aws-lambda > https://github.com/aesinv/aws-lambda-toolkit *looks un-maintained/abandoned with lots of "Todo" items and no tests.*.

## Background

We *briefly* considered using [`node-fs-extra`](https://github.com/jprichardson/node-fs-extra)
to do the heavy lifting, but they are about to remove support for node.js v.0.10
which, if we want to be able to run the deploy script from a CI Environment
running node v.0.10.36 (*the Lambda version of node!*)
we need to DIY the file operations.

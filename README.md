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

Deploying your Lambda function requires a few Environment Variables
to be set.

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


### Two things to add to your `package.json`

For the deploy scrip to do its job,
we need to add two lines to our `package.json`

### List of `files_to_pack`  

In your `package.json` file, add the list of files & directories
you want to be included in your distribution.

Example:
```js
"files_to_pack": [ "package.json", "index.js", "lib/" ]
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

<br />

## tl;dr

### Why not use an *existing* task runner like Gulp or Grunt?

*Originally* we were using Gulp to perform the tasks to deploy our
Lambda Functions. however this required us to duplicate a *very similar*
`gulpfile.js` in all our projects.

***Disadvantages of using Gulp***:

3. New developers on your team who have never used Gulp have
*one-more-thing* to *learn* before they can be productive.

4. Gulp is (*up to*) **50% Slower** than using node.js core modules/methods.

1. Each repo has to duplicate *several* Gulp devDependencies which
have varing degrees of quality in their documentation/testing
and will need to be updated *soon* when Gulp v.4 is released.

2. The devDependencies take up
[***28 Megabytes on disk***](https://github.com/numo-labs/aws-lambda-deploy/issues/14)
For *one* lambda function that's insignificant,
but if, like us, you have *many* Lambda functions (*e.g: 40*)
you using Gulp will take up a *Gigabyte* of your hard drive.

> ***Note***: *we still love Gulp and use it in our non-lambda projects,
we just think this is a* ***leaner*** *way of deploying our Lambdas*.

### Advantages of using `dpl` to *deploy* your Lambdas

+ **On Dependency** - Our solution to the deployment task uses only *one* dependency:
the [`aws-sdk`](https://github.com/aws/aws-sdk-js).  

+ **Small Code** - The *entire* `dpl` ("*Deploy Lambda*") module is fewer lines
than our original  
[`gulpfile.js`](https://github.com/numo-labs/aws-lambda-canary/blob/d18ccc099ec4ab1a7a612716563ec57364c03cc4/gulpfile.js)
and uses *only* node.js core modules
(*you know and love*) and your OS-native `zip` command.

+ A *beginner* can ***read and understand*** all the code used in `dpl`
in a few minutes; our code has *both* JavaDoc and *in-line comments* and we are
[*here*](https://github.com/numo-labs/aws-lambda-deploy/issues)
to help if you have *any questions*!

+ **No assumptions** about your code style.
e.g if you need any custom processing (_e.g `babel` for your **ES6**_)
simply add a task in your `scripts` section of your `package.json`
and run that task before deploying.

+ **No _Global_ packages** required or implied, just *one `dev` Dependency*.



### Babel ?

Given that AWS Lambda only supports Node.js **v0.10.36** (*at present*)
the code you *deploy* to Lambda needs to be **ES5 _Only_**.
Since most of the *cool kids* are using ES6/2015
(*aka* [***modern javascript***](https://twitter.com/ericdfields/status/677677470590570496) ...)
the *build* script includes a *transform* step to translate ES6 into ES5
so your ES6 Code will run on Lambda.

### Alterantives?

+ https://www.npmjs.com/package/deploy-aws-lambda > https://github.com/aesinv/aws-lambda-toolkit *looks un-maintained/abandoned with lots of "Todo" items and no tests.*.
+

## Background

We *briefly* considered using [`node-fs-extra`](https://github.com/jprichardson/node-fs-extra)
to do the heavy lifting, but they are about to remove support for node.js v.0.10
which, if we want to be able to run the deploy script from a CI Environment
running node v.0.10.36 (*the Lambda version of node!*)
we need to DIY the file operations.

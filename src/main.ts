import * as cdk from 'aws-cdk-lib';
import * as kc from 'cdk-keycloak';
//const kc = require("keycloak");
//import {KeyCloak} from './index';
import { Construct } from 'constructs';


export class Demo extends Construct {
  constructor(scope: Construct, id: string ) {
    super(scope, id);

    const certificateArn = this.node.tryGetContext('ACM_CERT_ARN') ?? process.env.ACM_CERT_ARN;
    if (!certificateArn) {
      throw new Error('ERROR - ACM_CERT_ARN not found');
    }
    new kc.KeyCloak(this, 'KeyCloak', {
      auroraServerless: true,
      certificateArn,
    });
  }
}

const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new cdk.App();

const stack = new cdk.Stack(app, 'my-stack-dev', { env: devEnv,  description: "(qs-1sqf96ugi)" });


new Demo(stack, 'Demo');

app.synth();

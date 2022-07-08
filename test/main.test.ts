import 'aws-cdk-lib/assert/jest';
import { App, Stack } from 'aws-cdk-lib';
import { Demo } from '../src/main';

// match snapshot
test('Snapshot', () => {
  const app = new App();
  const stack = new Stack(app, 'test');
  new Demo(stack, 'Demo');
  expect(app.synth().getStackArtifact(stack.artifactId).template).toMatchSnapshot();
});

// create the default cluster
test('create the default cluster', () => {
  // GIVEN
  const app = new App();
  const stack = new Stack(app, 'testing-stack');

  // WHEN
  new Demo(stack, 'Demo');

  // THEN
  // we should have aurora serverless
  expect(stack).hasResource('AWS::RDS::DBCluster', {
    Engine: 'aurora-mysql',
    DBClusterParameterGroupName: 'default.aurora-mysql5.7',
    EngineMode: 'serverless',
  });
  // we should have 0 db instance in the cluster
  expect(stack).toCountResources('AWS::RDS::DBInstance', 0);
  // we should have 2 secrets
  expect(stack).toCountResources('AWS::SecretsManager::Secret', 2);
  // we should have an ecs service with FARGATE launch type
  expect(stack).hasResource('AWS::ECS::Service', {
    Cluster: {
      Ref: 'DemoKeyCloakKeyCloakContainerSerivceCluster7C35B187',
    },
    DeploymentConfiguration: {
      MaximumPercent: 200,
      MinimumHealthyPercent: 50,
    },
    DesiredCount: 2,
    EnableECSManagedTags: false,
    HealthCheckGracePeriodSeconds: 120,
    LaunchType: 'FARGATE',
    LoadBalancers: [
      {
        ContainerName: 'keycloak',
        ContainerPort: 8443,
        TargetGroupArn: {
          Ref: 'DemoKeyCloakKeyCloakContainerSerivceALBHttpsListenerECSTargetGroupFF9C7FFB',
        },
      },
    ],
    NetworkConfiguration: {
      AwsvpcConfiguration: {
        AssignPublicIp: 'DISABLED',
        SecurityGroups: [
          {
            'Fn::GetAtt': [
              'DemoKeyCloakKeyCloakContainerSerivceServiceSecurityGroupB6605C2C',
              'GroupId',
            ],
          },
        ],
        Subnets: [
          {
            Ref: 'DemoKeyCloakVpcPrivateSubnet1Subnet19670105',
          },
          {
            Ref: 'DemoKeyCloakVpcPrivateSubnet2SubnetAFE16A44',
          },
        ],
      },
    },
    TaskDefinition: {
      Ref: 'DemoKeyCloakKeyCloakContainerSerivceTaskDef1869871E',
    },
  });

  // we should have an ALB
  expect(stack).hasResource('AWS::ElasticLoadBalancingV2::LoadBalancer', {
    LoadBalancerAttributes: [
      {
        Key: 'deletion_protection.enabled',
        Value: 'false',
      },
    ],
    Scheme: 'internet-facing',
    SecurityGroups: [
      {
        'Fn::GetAtt': [
          'DemoKeyCloakKeyCloakContainerSerivceALBSecurityGroup5CBC79D7',
          'GroupId',
        ],
      },
    ],
    Subnets: [
      {
        Ref: 'DemoKeyCloakVpcPublicSubnet1SubnetB77500B2',
      },
      {
        Ref: 'DemoKeyCloakVpcPublicSubnet2Subnet10148C71',
      },
    ],
    Type: 'application',
  });
});

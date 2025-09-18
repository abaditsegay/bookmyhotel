targetScope = 'resourceGroup'

@description('Name of the environment (e.g., dev, staging, prod)')
@allowed(['dev', 'staging', 'prod'])
param environmentName string = 'dev'

@description('Location for all resources')
param location string = resourceGroup().location

@description('Unique suffix for resource names')
param resourceToken string = uniqueString(subscription().id, resourceGroup().id)

@description('Container image for the backend application')
param backendImage string = 'nginx:latest' // Will be replaced during deployment

@description('Frontend URL for CORS and configuration')
param frontendUrl string = 'https://localhost:3000'

@description('JWT secret key for authentication')
@secure()
param jwtSecretKey string

@description('Stripe secret key for payment processing')
@secure()
param stripeSecretKey string

@description('Email configuration')
param mailHost string = 'smtp.gmail.com'
param mailPort string = '587'
@secure()
param mailUsername string
@secure()
param mailPassword string

@description('MySQL administrator password')
@secure()
param mysqlAdminPassword string

// Variables for consistent naming
var abbrs = loadJsonContent('abbreviations.json')
var resourceBaseName = '${abbrs.resourceGroup}${environmentName}-${resourceToken}'
var tags = {
  'azd-env-name': environmentName
  Environment: environmentName
  Application: 'BookMyHotel'
}

// Container App Environment
resource containerAppEnvironment 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: '${abbrs.containerAppEnvironment}${resourceBaseName}'
  location: location
  tags: tags
  properties: {
    workloadProfiles: [
      {
        name: 'consumption'
        workloadProfileType: 'Consumption'
      }
    ]
  }
}

// Log Analytics Workspace for Container App Environment
resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: '${abbrs.logAnalyticsWorkspace}${resourceBaseName}'
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

// Update Container App Environment with Log Analytics
resource containerAppEnvironmentDiagnostics 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: containerAppEnvironment.name
  location: location
  tags: tags
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalyticsWorkspace.properties.customerId
        sharedKey: logAnalyticsWorkspace.listKeys().primarySharedKey
      }
    }
    workloadProfiles: [
      {
        name: 'consumption'
        workloadProfileType: 'Consumption'
      }
    ]
  }
}

// Container Registry
resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: '${abbrs.containerRegistry}${resourceBaseName}'
  location: location
  tags: tags
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: false
    publicNetworkAccess: 'Enabled'
  }
}

// User Assigned Managed Identity
resource managedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: '${abbrs.managedIdentity}${resourceBaseName}'
  location: location
  tags: tags
}

// Role assignment for Container Registry
resource registryPullRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: containerRegistry
  name: guid(containerRegistry.id, managedIdentity.id, 'acrpull')
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d') // AcrPull
    principalId: managedIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

// MySQL Flexible Server
resource mysqlServer 'Microsoft.DBforMySQL/flexibleServers@2023-12-30' = {
  name: '${abbrs.mysqlServer}${resourceBaseName}'
  location: location
  tags: tags
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    version: '8.0'
    administratorLogin: 'bookmyhotel_admin'
    administratorLoginPassword: mysqlAdminPassword
    storage: {
      storageSizeGB: 20
      autoGrow: 'Enabled'
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    network: {
      publicNetworkAccess: 'Enabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
  }
}

// MySQL Database
resource mysqlDatabase 'Microsoft.DBforMySQL/flexibleServers/databases@2023-12-30' = {
  parent: mysqlServer
  name: 'bookmyhotel'
  properties: {
    charset: 'utf8mb4'
    collation: 'utf8mb4_unicode_ci'
  }
}

// Firewall rule to allow Azure services
resource mysqlFirewallRule 'Microsoft.DBforMySQL/flexibleServers/firewallRules@2023-12-30' = {
  parent: mysqlServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// Storage Account for file uploads and logs
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: '${abbrs.storageAccount}${resourceBaseName}'
  location: location
  tags: tags
  kind: 'StorageV2'
  sku: {
    name: 'Standard_LRS'
  }
  properties: {
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
    supportsHttpsTrafficOnly: true
    allowSharedKeyAccess: false
  }
}

// Role assignment for Storage Account
resource storageDataContributorRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: storageAccount
  name: guid(storageAccount.id, managedIdentity.id, 'storage-data-contributor')
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'ba92f5b4-2d11-453d-a403-e96b0029c9fe') // Storage Blob Data Contributor
    principalId: managedIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

// Backend Container App
resource backendContainerApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: '${abbrs.containerApp}backend-${resourceBaseName}'
  location: location
  tags: tags
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${managedIdentity.id}': {}
    }
  }
  properties: {
    managedEnvironmentId: containerAppEnvironmentDiagnostics.id
    configuration: {
      ingress: {
        external: true
        targetPort: 8080
        corsPolicy: {
          allowedOrigins: ['*']
          allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
          allowedHeaders: ['*']
          allowCredentials: false
        }
      }
      registries: [
        {
          server: containerRegistry.properties.loginServer
          identity: managedIdentity.id
        }
      ]
      secrets: [
        {
          name: 'jwt-secret'
          value: jwtSecretKey
        }
        {
          name: 'stripe-secret'
          value: stripeSecretKey
        }
        {
          name: 'mail-password'
          value: mailPassword
        }
        {
          name: 'db-password'
          value: mysqlAdminPassword
        }
      ]
    }
    template: {
      containers: [
        {
          image: backendImage
          name: 'backend'
          env: [
            {
              name: 'SPRING_PROFILES_ACTIVE'
              value: 'azure'
            }
            {
              name: 'SPRING_DATASOURCE_URL'
              value: 'jdbc:mysql://${mysqlServer.properties.fullyQualifiedDomainName}:3306/bookmyhotel?useSSL=true&requireSSL=true&serverTimezone=UTC'
            }
            {
              name: 'SPRING_DATASOURCE_USERNAME'
              value: 'bookmyhotel_admin'
            }
            {
              name: 'SPRING_DATASOURCE_PASSWORD'
              secretRef: 'db-password'
            }
            {
              name: 'JWT_SECRET_KEY'
              secretRef: 'jwt-secret'
            }
            {
              name: 'STRIPE_SECRET_KEY'
              secretRef: 'stripe-secret'
            }
            {
              name: 'SPRING_MAIL_HOST'
              value: mailHost
            }
            {
              name: 'SPRING_MAIL_PORT'
              value: mailPort
            }
            {
              name: 'SPRING_MAIL_USERNAME'
              value: mailUsername
            }
            {
              name: 'SPRING_MAIL_PASSWORD'
              secretRef: 'mail-password'
            }
            {
              name: 'APP_FRONTEND_URL'
              value: frontendUrl
            }
            {
              name: 'AZURE_STORAGE_CONNECTION_STRING'
              value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};EndpointSuffix=${environment().suffixes.storage};AccountKey=${storageAccount.listKeys().keys[0].value}'
            }
          ]
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '30'
              }
            }
          }
        ]
      }
    }
  }
}

// Outputs
@description('The hostname of the backend container app')
output backendUrl string = 'https://${backendContainerApp.properties.configuration.ingress.fqdn}'

@description('The name of the resource group')
output resourceGroupName string = resourceGroup().name

@description('The name of the container registry')
output containerRegistryName string = containerRegistry.name

@description('The login server of the container registry')
output containerRegistryLoginServer string = containerRegistry.properties.loginServer

@description('The principal ID of the managed identity')
output managedIdentityPrincipalId string = managedIdentity.properties.principalId

@description('The client ID of the managed identity')
output managedIdentityClientId string = managedIdentity.properties.clientId

@description('The MySQL server hostname')
output mysqlServerName string = mysqlServer.properties.fullyQualifiedDomainName

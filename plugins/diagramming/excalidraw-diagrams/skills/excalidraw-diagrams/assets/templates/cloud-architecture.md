# Template: Cloud Architecture Diagrams

**Scope**: AWS, GCP, Azure, and multi-cloud infrastructure diagrams

Apply styling defaults from `references/styling-defaults.md`. This template
defines cloud-specific conventions for service categories, grouping, and
connectivity patterns.

---

## Core Approach

Cloud architecture diagrams use **shape + label** to represent services (no custom
icons in Excalidraw text-based generation). Group services by:

1. **Service category** (compute, storage, networking, database)
2. **Network boundary** (VPC, subnet, region, availability zone)

---

## Service Categories and Shapes

| Category | Shape | Style Tier | Examples |
|----------|-------|------------|---------|
| Compute | `rectangle` | Standard | EC2, GCE, Azure VM, Lambda, Cloud Functions, App Service |
| Container / Orchestration | `rectangle` rounded | Standard | ECS, EKS, GKE, AKS, Fargate |
| Storage | `rectangle` | Standard | S3, GCS, Azure Blob, EBS, EFS |
| Database | `rectangle` | Standard | RDS, DynamoDB, Cloud SQL, Cosmos DB, Aurora |
| Networking | `rectangle` | Standard Light | ALB, API Gateway, CloudFront, Azure Front Door |
| Security / IAM | `rectangle` | Rare Highlight | IAM, KMS, Secrets Manager, Azure AD |
| Messaging / Queue | `rectangle` | Standard | SQS, SNS, Pub/Sub, Service Bus, EventBridge |
| Monitoring | `rectangle` | Standard Lighter | CloudWatch, Cloud Monitoring, Azure Monitor |
| External / User | `rectangle` | Standard | End users, external services, on-prem |

```json
{ "type": "rectangle", "width": 180, "height": 80 }
```

```json
{ "type": "rectangle", "roundness": { "type": 3 }, "width": 180, "height": 80 }
```

---

## Network Boundary Conventions

| Boundary Type | Excalidraw Element | Label |
|--------------|-------------------|-------|
| VPC / Virtual Network | `frame` | `"VPC: 10.0.0.0/16"` or `"Virtual Network"` |
| Public Subnet | `frame` (nested or separate) | `"Public Subnet"` |
| Private Subnet | `frame` (nested or separate) | `"Private Subnet"` |
| Availability Zone | `frame` | `"us-east-1a"` |
| Region | `frame` (outermost) | `"AWS us-east-1"` |
| Internet | Stand-alone `rectangle` | `"Internet"` |
| On-Premises | `frame` | `"On-Premises"` |

Use nested `frame` elements to represent subnet-within-VPC hierarchy. Child frames
reference the parent frame via `frameId`, and child services reference the subnet frame.

---

## Label Convention

Each service element has a two-line label:

```
ServiceName
[Provider: Service Type]
```

Examples:

```json
"text": "Web Server\n[AWS: EC2 t3.medium]"
"text": "User Database\n[GCP: Cloud SQL PostgreSQL]"
"text": "Load Balancer\n[Azure: Application Gateway]"
"text": "Object Storage\n[AWS: S3]"
```

Use `fontSize: 16` for the main label.

---

## Connection Patterns

| Connection Type | Arrow Style | Label |
|----------------|-------------|-------|
| HTTP/HTTPS request | `solid` arrow | `"HTTPS"` |
| Internal service call | `solid` arrow | `"REST"` or `"gRPC"` |
| Database connection | `solid` arrow | `"TCP/5432"` or `"SQL"` |
| Message/event flow | `dashed` arrow | `"SNS/SQS"` or `"Pub/Sub"` |
| Async / background | `dashed` arrow | `"async"` |
| Managed service (no direct traffic) | `dotted` arrow | `"managed"` |

Always add brief labels to arrows for protocol/port clarity.

**Arrow label binding:** All connection labels use `containerId` binding with
`lineHeight: 1.25` and calculated midpoint positioning. See
`references/excalidraw-format.md` section "Arrow label rules" for the complete
JSON pattern, sizing formulas, and readability rules.

---

## Layout Guidelines

### Standard 3-Tier Layout (most common)

```
[Internet / Users]           (top)
       ↓
[Load Balancer / API GW]     (networking tier) — public subnet
       ↓
[Application Servers]        (compute tier)    — private subnet
       ↓
[Databases / Storage]        (data tier)       — private subnet
```

Position from top to bottom with increasing trust level. Public-facing services
at top, databases and internal services at bottom.

### Availability Zone Layout

When showing AZ redundancy, create two side-by-side zones:

```
VPC frame
├── AZ-A frame (left)
│   └── services
└── AZ-B frame (right)
    └── services (mirrored)
```

### Multi-Region Layout

Show regions as top-level `frame` elements, side by side. Use dashed arrows
for cross-region replication.

---

## Grouping Rules

1. Always group services by network boundary using `frame` elements
2. Services in the same subnet share a `frameId`
3. Use `groupIds` to logically group replicated services (e.g., both AZ-A and AZ-B app servers)
4. Internet-facing elements sit OUTSIDE VPC frame, connected via arrows

---

## AWS Quick-Reference Labels

| Service | Label |
|---------|-------|
| EC2 instance | `"App Server\n[AWS: EC2]"` |
| Lambda function | `"Handler\n[AWS: Lambda]"` |
| ECS service | `"Container\n[AWS: ECS Fargate]"` |
| Application Load Balancer | `"Load Balancer\n[AWS: ALB]"` |
| API Gateway | `"API Gateway\n[AWS: API GW]"` |
| S3 bucket | `"Static Assets\n[AWS: S3]"` |
| RDS instance | `"Database\n[AWS: RDS PostgreSQL]"` |
| DynamoDB table | `"Sessions\n[AWS: DynamoDB]"` |
| ElastiCache | `"Cache\n[AWS: ElastiCache Redis]"` |
| CloudFront | `"CDN\n[AWS: CloudFront]"` |
| SQS queue | `"Job Queue\n[AWS: SQS]"` |
| SNS topic | `"Notifications\n[AWS: SNS]"` |

## GCP Quick-Reference Labels

| Service | Label |
|---------|-------|
| Compute Engine | `"VM\n[GCP: Compute Engine]"` |
| Cloud Run | `"Service\n[GCP: Cloud Run]"` |
| GKE cluster | `"Cluster\n[GCP: GKE]"` |
| Cloud SQL | `"Database\n[GCP: Cloud SQL]"` |
| Firestore | `"NoSQL DB\n[GCP: Firestore]"` |
| Cloud Storage | `"Storage\n[GCP: Cloud Storage]"` |
| Pub/Sub | `"Events\n[GCP: Pub/Sub]"` |
| Cloud Load Balancing | `"Load Balancer\n[GCP: Cloud LB]"` |

## Azure Quick-Reference Labels

| Service | Label |
|---------|-------|
| Virtual Machine | `"VM\n[Azure: Virtual Machine]"` |
| App Service | `"Web App\n[Azure: App Service]"` |
| AKS cluster | `"Cluster\n[Azure: AKS]"` |
| Azure SQL | `"Database\n[Azure: SQL Database]"` |
| Cosmos DB | `"NoSQL DB\n[Azure: Cosmos DB]"` |
| Blob Storage | `"Storage\n[Azure: Blob Storage]"` |
| Service Bus | `"Messages\n[Azure: Service Bus]"` |
| Application Gateway | `"Load Balancer\n[Azure: App Gateway]"` |

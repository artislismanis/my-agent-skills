# Cloud Architecture Quick Reference

**Scope**: AWS, GCP, Azure, and multi-cloud infrastructure

## Service Category → Shape Mapping

| Category | Shape | Background |
|----------|-------|------------|
| Compute (EC2, GCE, VMs) | `rectangle` | `#dbe4ff` |
| Container / Orchestration (ECS, GKE, AKS) | `rectangle` + `roundness: {type:3}` | `#dbe4ff` |
| Storage (S3, GCS, Blob) | `rectangle` | `#fff3bf` |
| Database (RDS, DynamoDB, Cloud SQL) | `rectangle` | `#fff3bf` |
| Networking (ALB, API GW, CloudFront) | `rectangle` | `#f1f3f5` |
| Security / IAM | `rectangle` | `#ffe3e3` |
| Messaging / Queue (SQS, Pub/Sub) | `rectangle` | `#fff3bf` |
| External / User | `rectangle` | `#d3f9d8` |
| Network Boundary (VPC, Subnet, Region) | `frame` | `transparent` |

## Label Convention

Two-line label: `"ServiceName\n[Provider: Service Type]"`
Examples: `"Web Server\n[AWS: EC2]"`, `"Database\n[GCP: Cloud SQL]"`, `"Cache\n[Azure: Redis]"`

## Connection Types

- HTTPS request → solid arrow, label `"HTTPS"`
- Internal service → solid arrow, label `"REST"` / `"gRPC"`
- Database → solid arrow, label `"SQL"` / `"TCP/5432"`
- Message/event → dashed arrow, label `"SQS"` / `"Pub/Sub"`
- Async / background → dashed arrow

## Standard Layout

```
[Internet / Users]           ← top, green
       ↓
[Load Balancer / API GW]     ← public subnet, grey
       ↓
[Application Servers]        ← private subnet, blue
       ↓
[Databases / Storage]        ← private subnet, yellow
```

- Outer frames: Region → VPC → Subnet
- Internet-facing elements sit OUTSIDE VPC frame

Full template: `assets/templates/cloud-architecture.md`

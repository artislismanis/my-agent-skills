# Example Prompts: Excalidraw Diagram Skill

This catalog contains 15 test prompts (5 templates × 3 complexity levels) for the
`excalidraw-diagrams` skill. Each prompt is designed to:

- Validate the brand and style system for that template type
- Exercise specific template features at increasing complexity
- Serve as regression testing prompts for future changes

**Usage**: Pass each prompt directly to the skill. For testing, tell the skill
"generate directly, no questions needed" to skip the design session.

**Output naming**: `{simple|medium|complex}-{descriptor}.{excalidraw|png}`

---

## C4 Diagrams → `c4/`

### Simple — `simple-blog-context.excalidraw`

> Draw a C4 context diagram for a personal blog platform. The blogger writes posts
> via a web app, readers view the blog, and the system sends emails via an external
> email service.

**Exercises**: 3 elements (person, system, external), 3 labelled arrows, single
boundary frame, `[Person]`/`[Software System]` tags, Standard + Standard Light tiers.

---

### Medium — `medium-bookstore-containers.excalidraw`

> Draw a C4 container diagram for an online bookstore. The system has a React SPA,
> a Node.js REST API, a PostgreSQL database, and a Redis cache. An external payment
> gateway handles payments. Show the system boundary.

**Exercises**: 6 elements inside boundary frame, 1 external, multi-line labels with
technology (`[Container: Node.js]`), dashed arrow for async payment flow, protocol
labels (`HTTPS`, `SQL`, `Redis`).

---

### Complex — `complex-order-components.excalidraw`

> Draw a C4 component diagram for a microservices order management system. Inside
> the Order Service container: OrderController, OrderService, PaymentClient,
> InventoryClient, OrderRepository. External containers: Payment Service, Inventory
> Service, PostgreSQL database. Show the container boundary frame and all internal
> component interactions.

**Exercises**: 10+ elements, nested boundary frame, component-level labels
(`[Component]`), multiple arrow types, layer layout
(controller → service → repository → external), cross-boundary arrows.

---

## Flowcharts → `flowchart/`

### Simple — `simple-login.excalidraw`

> Draw a flowchart for user login: start, enter credentials, validate credentials
> (decision), show dashboard on success, show error on failure, end.

**Exercises**: Start/end terminators (rounded), process rectangles, 1 decision
diamond, Yes/No branch labels, top-to-bottom layout, Occasional Highlight for error
state.

---

### Medium — `medium-checkout-flow.excalidraw`

> Draw a flowchart for an e-commerce checkout process: start, view cart, apply
> discount code (optional path with decision), calculate total, select shipping
> method, enter payment details, validate payment (decision: success/retry/cancel
> paths), confirm order, send confirmation email, end.

**Exercises**: 8+ elements, 2 decisions, loop-back (retry), 3 terminal paths,
multiple branch labels, mixed shape types.

---

### Complex — `complex-support-swimlanes.excalidraw`

> Draw a flowchart with swim lanes for a support ticket workflow. Customer lane:
> submit ticket, receive updates. Support Agent lane: review ticket, classify
> priority (decision: low/medium/high), handle low priority directly, escalate
> medium/high. Engineering lane: investigate escalated tickets, implement fix
> (decision: fix works?), deploy fix or escalate to management. Include a loop for
> "needs more info" back to the customer.

**Exercises**: 12+ elements, 3 swim lane frames, cross-lane arrows, multiple
decisions, loop-back across lanes, all shape types, frame labels.

---

## Data Flow Diagrams → `data-flow/`

### Simple — `simple-library-context.excalidraw`

> Draw a Level 0 context DFD for a library management system. External entities:
> Library Member, Librarian. Single central process: Library System. Data flows:
> borrow request, book availability, return notification, catalogue updates.

**Exercises**: 2 external entities (rectangles), 1 process (ellipse), 4 labelled
data flow arrows, no data stores at Level 0, radial layout.

---

### Medium — `medium-food-ordering.excalidraw`

> Draw a Level 1 DFD for an online food ordering system. External entities:
> Customer, Restaurant, Delivery Driver. Processes: 1.0 Place Order, 2.0 Process
> Payment, 3.0 Assign Delivery. Data stores: D1: Orders DB, D2: Menu Catalogue.
> Show all data flows between entities, processes, and stores.

**Exercises**: 3 external entities, 3 numbered processes, 2 data stores, 8+ data
flow arrows, left-to-right layout, process numbering convention (`1.0`, `2.0`),
`D1:`/`D2:` labelling.

---

### Complex — `complex-hospital-management.excalidraw`

> Draw a Level 1 DFD for a hospital patient management system. External entities:
> Patient, Doctor, Insurance Company, Lab. Processes: 1.0 Register Patient, 2.0
> Schedule Appointment, 3.0 Conduct Examination, 4.0 Order Lab Tests, 5.0 Process
> Insurance Claim. Data stores: D1: Patient Records, D2: Appointment Schedule, D3:
> Lab Results, D4: Billing. Show all data flows. Use a system boundary frame.

**Exercises**: 4 external entities, 5 processes, 4 data stores, 15+ data flows,
system boundary frame, dashed arrows for async (lab results), complex routing to
avoid crossing arrows.

---

## Cloud Architecture → `cloud-architecture/`

### Simple — `simple-3tier-aws.excalidraw`

> Draw a simple AWS 3-tier architecture: users connect to an Application Load
> Balancer in a public subnet, which routes to an EC2 instance in a private subnet,
> which connects to an RDS PostgreSQL database in a private subnet. Show the VPC
> boundary.

**Exercises**: 4 elements (user + 3 services), VPC frame, public/private subnet
frames, 3-tier top-to-bottom layout, service-specific labels (`[AWS: ALB]`,
`[AWS: EC2]`, `[AWS: RDS PostgreSQL]`), protocol labels (`HTTPS`, `HTTP`,
`TCP/5432`).

---

### Medium — `medium-serverless.excalidraw`

> Draw an AWS serverless architecture: CloudFront CDN serves a React SPA from S3.
> API Gateway routes to Lambda functions. Lambda reads/writes to DynamoDB and
> publishes events to an SNS topic. An SQS queue subscribes to SNS and triggers
> another Lambda for async processing. Show the VPC boundary around Lambda and
> DynamoDB.

**Exercises**: 8 elements, CDN/S3 outside VPC, Lambda + DynamoDB inside VPC,
mixed connection types (solid for sync, dashed for async SNS/SQS), service-specific
labels, event-driven flow pattern.

---

### Complex — `complex-multi-az.excalidraw`

> Draw a multi-AZ AWS architecture for a high-availability web application. Region:
> us-east-1. Two availability zones (AZ-A and AZ-B), each containing an EC2
> auto-scaling group and an RDS replica. A public ALB sits in front of both AZs.
> An ElastiCache Redis cluster spans both AZs. CloudFront CDN and S3 for static
> assets sit outside the VPC. Route 53 at the very top.

**Exercises**: 12+ elements, nested frames (Region → VPC → AZ → subnets), mirrored
AZ layout, cross-AZ replication arrows (dashed), 4 frame nesting levels, all
service categories represented.

---

## BPMN → `bpmn/`

### Simple — `simple-expense-report.excalidraw`

> Draw a BPMN diagram for a simple expense report process: start event, submit
> expense report (user task), approve expense (user task), exclusive gateway
> (approved?), if yes: process payment (service task) then end event, if no:
> notify rejection (send task) then end event.

**Exercises**: Start event (thin stroke), end events (thick stroke), 3 tasks
(rounded rectangles), 1 XOR gateway (diamond), Yes/No branch labels, single pool,
linear flow.

---

### Medium — `medium-order-fulfilment.excalidraw`

> Draw a BPMN diagram with two swim lanes for an order fulfilment process. Customer
> lane: start event, place order, receive confirmation. Fulfilment lane: validate
> order, check inventory (exclusive gateway: in stock?), if yes: pick and pack,
> ship order, send confirmation, end. If no: notify backorder, wait for restock
> (intermediate event), then loop back to check inventory.

**Exercises**: 2 swim lanes (frames), 8+ tasks, 1 XOR gateway, 1 intermediate
event, loop-back arrow, cross-lane message flows (dashed), lane labels, pool frame.

---

### Complex — `complex-employee-onboarding.excalidraw`

> Draw a BPMN diagram with three swim lanes for an employee onboarding process. HR
> lane: start, create employee record, assign equipment, schedule orientation,
> parallel gateway (fork). IT lane: provision accounts, set up workstation,
> configure VPN access, parallel gateway (join). Manager lane: prepare training
> plan, assign mentor, schedule check-ins, parallel gateway (join). After both
> parallel joins converge: HR conducts orientation, employee signs documents, end
> event. Include an error boundary event on "Provision Accounts" with an exception
> path to an IT escalation task.

**Exercises**: 3 swim lanes, 12+ tasks, parallel gateways (AND fork/join), boundary
error event, exception path, cross-lane synchronisation, all BPMN element types.

# CloudSmith  ☁️🚀
**A Cloud-Native Deployment Platform for One-Click Web App Deployments**          > Built with ❤️ by Salil Fernandes

CloudSmith is a developer-centric CI/CD platform that lets you deploy web apps directly from GitHub with a single click. Powered by event-driven microservices and scalable AWS infrastructure, CloudSmith automates the entire pipeline — from GitHub OAuth to production deployment. 
It is my version of a minimalist PaaS offering inspired by Vercel, Heroku from Salesforce, Netlify and Hostinger.

## 📌 Highlights

- Hands-on experience with scalable cloud architecture  
- Focus on automation, reliability, and clean developer experience  
- Full-stack engineering across frontend, backend, DevOps, and cloud  

CloudSmith showcases end-to-end ownership of a real-world CI/CD system — from OAuth authentication to production deployment. It demonstrates hands-on experience with distributed systems, cloud infrastructure, microservices, and DevOps best practices.

---

## 🔧 Features

- **GitHub OAuth**: Secure public repo access integration via GitHub login  
- **Repo Picker**: Modern UI to select repositories for deployment  
- **CI/CD Pipeline**: Jenkins and Groovy pipelines for build and deployment  
- **Event-Driven Architecture**: Kafka powered inter-service communication  
- **Infrastructure-as-Code**: Terraform managed AWS cloud services 
- **Microservices**: Auth, Launch, Pipeline, Build, Deploy  

---

## ⚙️ Tech Stack

**Frontend**: Next.js, TypeScript, Tailwind CSS, Chakra UI, NextAuth.js (OAuth)  
**Backend**: Node.js, AWS Lambda, Jenkins  
**Microservices**: Kafka-driven services (Gitpulse, Buildrelay, Docksage)  
**Message Queue / Streaming**: Apache Kafka  
**Storage**: Amazon S3  
**Database**: Amazon DynamoDB  
**Containerization**: Docker  
**Container Orchestration**: AWS ECS (Fargate + EC2)  
**CI/CD**: Jenkins  
**Infrastructure as Code**: Terraform  
**Cloud Provider**: AWS Amazon Web Services
**Inter-service Communication**: Kafka Events  
**Auto-scaling**: ECS Cluster Auto Scaling (Fargate)  

---

## 📦 Architecture Overview

- **Authspire** – Manages GitHub OAuth and session validation  
- **Launchboard** – UI for repo selection and deployment triggers  
- **Gitpulse, Buildrelay, Docksage** – Kafka-driven microservices for orchestrating builds and deployments  
- **Jenkins** – Builds and uploads repo artifacts to S3  
- **AWS Lambda** – Triggers containerization and service registration  
- **Docker + ECR + ECS/Fargate** – Builds, pushes, and deploys containers at scale  
- **DynamoDB + S3** – Tracks deployment state and stores build artifacts  
- **Application Load Balance ALB** – Exposes live deployed apps via DNS

---

## ⚖️ Auto-scaling

CloudSmith ensures efficient, demand-based scalability across its deployment infrastructure:

- **Amazon ECS Auto Scaling**: Services deployed via **AWS Fargate** automatically scale based on CPU and memory utilization, ensuring consistent performance under varying loads without manual intervention.  
- **Jenkins Load Management**: Build workloads are processed asynchronously and decoupled via Kafka, preventing bottlenecks during burst traffic.  
- **Kafka-Driven Microservices**: Gitpulse, Buildrelay, and Docksage consume events independently, allowing them to scale horizontally based on topic traffic and system demand.

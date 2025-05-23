# CloudSmith 🚀  
**A Cloud-Native Deployment Platform for One-Click Web App Deployments**

CloudSmith is a developer-centric CI/CD platform that lets you deploy web apps directly from GitHub with a single click. Powered by event-driven microservices and scalable AWS infrastructure, CloudSmith automates the entire pipeline — from GitHub OAuth to production deployment. 
It is my version of a minimalist PaaS offering inspired by Vercel, Heroku from Salesforce, Netlify and Hostinger.

---

## 🔧 Features

- **GitHub OAuth**: Secure public repo access integration via GitHub login  
- **Repo Picker**: Modern UI to select repositories for deployment  
- **CI/CD Pipeline**: Jenkins and Groovy pipelines for build and deployment  
- **Event-Driven Architecture**: Kafka powered inter-service communication  
- **Infrastructure-as-Code**: Terraform managed AWS cloud services (Lambda, ECR, ECS, S3, IAM, DynamoDB)    
- **Microservices**: Auth, Launch, Pipeline, Build, Deploy  

---

## 📦 Architecture Overview

- **Authspire** – Manages GitHub OAuth and session validation  
- **Launchboard** – UI for repo selection and deployment triggers  
- **Gitpulse, Buildrelay, Docksage** – Kafka-driven microservices for orchestrating builds and deployments  
- **Jenkins** – Builds and uploads repo artifacts to S3  
- **AWS Lambda** – Triggers containerization and service registration  
- **Docker + ECR + ECS/Fargate** – Builds, pushes, and deploys containers at scale  
- **DynamoDB + S3** – Tracks deployment state and stores build artifacts  
- **ALB** – Exposes live deployed apps via DNS

---

> Built with ❤️ by Salil Fernandes

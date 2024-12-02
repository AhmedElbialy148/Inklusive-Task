# Inklusive Task - Backend
This is a backend code for a NestJS server

# Important
Include the follwing (.env) file data for needed credentils for Supabase and others except for the SendGrid credentials. Used for task pupose only.

PORT=3002
POSTGRES_DB_HOST=aws-0-eu-central-1.pooler.supabase.com
POSTGRES_DB_PORT=6543
POSTGRES_DB_USERNAME=postgres.zokbigyqvgycknkrcxoe
POSTGRES_DB_PASSWORD=ahmed_elbialy14800
POSTGRES_DB_NAME=postgres
SUPER_ADMIN_USERNAME=super-admin
SUPER_ADMIN_EMAIL=super-admin@example.com
SUPER_ADMIN_PASSWORD=super-admin
JWT_ACCESS_SECRET=721KDTVGWEoM0cPqjzlYcMN72pHL8GCZWydbXQFRyn3EJQ8k11TBBydMIX0lviES4lHqa/jw7FyJQN0/LUxIpXfrIZBFYn0+VSPKiGy+pvN7bQ2d/G1j3dSf/1Dv4TTZEh3NL/2IODwxq0YKUz0IQU0IUcq9u2qPrGGsBV2mwEj5sjK4mRwrXgR7AGHSMiC1w36ZNFmdRl3jYm8ssMBkSpUr0qiSFzxmK3xphVlyfK3iv4SeRO3jlXoSQ+ePe5Lq46nishfZzUFNe4fTidBTE21tCCHCVRDg4pbf7cfwMh0pE7saJJJMYZ5Bo5Gjz9BU+YdbdIlOSiRPkQNNlY+I7A==
JWT_REFRESH_SECRET=w8Chmar873k3AZl47nIQJOSqKdNzdU3+BzVWaoIddlOIXCk7ZmeSrZi6+zmCFw9vAKciHbVPJWhmb2wbK5ERbz1IZSZtDr8CRLcu8Xgu7PMJzxRVsCuSh6aCIPiaEVbazgQEAbD84Nf0i75hUmgZ3DCbw9quoxvzLfvp+vkNjPGIkratFW9BoIbOhmGmjtdJELHmzXVIjs6ENm9h4kHJWdNyzXqJqLWX6TmiJKdEkWXpZ+WtdGAAoKiWR6Cx2xvCH8lqW8GzBiSPxjzC6JJAterihZXXBfT2U0pn9EtazgzRlkaBoHp4P6nm/XiuZk2a8LvH8J1tVtt1E52Eb9o7LA==
JWT_GENERAL_SECRET=67b2f58a-61da-431d-91c9-b4debe109356
SEND_GRID_FROM_EMAIL=mustafa.ryad12@gmail.com
FRONT_HOST_URL=http://localhost:3000
ACTIVATION_FRONT_URL=http://127.0.0.1:3000/auth/activation
SEND_GRID_API_KEY=


## Getting Started
First, run the development server:

```bash
npm install
npm run start:dev
```
## 

## Technologies Used
- NestJS
- TypeScript
- Passport JWT
- TypeORM (PostgreSQL)
- Swagger
- Socket.io
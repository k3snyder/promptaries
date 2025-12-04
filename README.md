# Promptaries

> A modern, high-performance library for managing, discovering, and sharing AI prompts.

Promptaries is a full-stack web application built with **Next.js 16** and **MongoDB** that allows users to create, organize, and discover AI prompts. Whether you're a prompt engineer or just getting started, Promptaries helps you keep your best prompts at your fingertips.

## 🚀 Features

- **Prompt Library**: Organize your prompts with ease.
- **Discovery**: Search and filter prompts by category, tags, and popularity.
- **Leaderboard**: See the top-rated prompts based on community engagement.
- **Modern UI**: Built with Tailwind CSS and Shadcn/ui for a premium look and feel.
- **Performance**: Powered by Next.js 16 App Router and Server Actions.

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **Database**: MongoDB (Native Driver)
- **UI Components**: Shadcn/ui (Radix UI)
- **Validation**: Zod

## 🏁 Quick Start

For a detailed step-by-step guide, please refer to [QUICKSTART.md](./QUICKSTART.md).

### Prerequisites

- Node.js 20+
- MongoDB Atlas account or local instance

### Installation

1.  **Clone the repository**
    ```bash
    git clone <your-repo-url>
    cd promptaries-app/website
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Copy `.env.example` to `.env.local` and add your MongoDB URI.
    ```bash
    cp .env.example .env.local
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📂 Project Structure

The main application logic resides in the `website/` directory:

```
website/
├── app/          # Next.js App Router pages & API
├── components/   # React components (UI, features)
├── lib/          # Utilities, DB connection, validations
├── public/       # Static assets
└── scripts/      # Database seeding scripts
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

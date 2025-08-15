# CodeReview.AI
<img width="500" height="300" alt="Screenshot 2025-08-14 at 7 21 15 PM" src="https://github.com/user-attachments/assets/68d9b977-8bdf-428c-9bae-d13b43dfe601" />

Live demo - https://codereviewai.vercel.app/

## Description

CodeReview.AI is a web application that allows developers to easily review GitHub pull requests with the help of AI. Simply paste a GitHub repository URL, select an open pull request, and choose which files you want AI feedback on. The app fetches the PR diff, lets you preview changes, and sends the selected code to OpenAI for review.

## Features
- **GitHub Pull Request Integration**: Paste a GitHub repo link and instantly see open pull requests.
- **Diff Viewer**: View changes file-by-file in a clean, color-coded diff format.
- **File Selection**: Select specific files to include in the AI review to stay within token limits.
- **Token Usage Bar**: See how much of the AI’s input limit your selection will use.
- **AI Feedback**: Get categorized AI insights on potential bugs, security issues, and best practices.
- **Modal View**: Open files in a modal to switch between “Code Diff” and “AI Feedback” tabs.
- **Selection Filtering**: Hide irrelevant files like `node_modules` or `package-lock.json` for faster navigation.

## Technologies Used
- Next.js
- React
- TypeScript
- Tailwind CSS
- OpenAI API
- GitHub REST API

## Lessons Learned
- Optimizing API requests to handle large diffs within AI token limits.
- Designing a clean UI for navigating and filtering pull request files.
- Using query parameters to persist state between pages in a Next.js app.
- Managing modal views with multiple tabbed states in a React component.

## Future Improvements
- Support for larger PRs by automatically batching requests.
- Improved AI feedback formatting and summaries.
- GitHub OAuth for authenticated access to private repos.
- Real-time updates for PR changes.

## Installation

**1. Clone the repository**  
`git clone https://github.com/your-username/codereview-ai.git`

**2. Install dependencies**  
`npm install`

**3. Set up environment variables**  
Create a `.env` file with:  
(Required)   
`OPENAI_API_KEY=your_openai_api_key`     
`GITHUB_TOKEN=your_github_token`   
(Optional)    
`DATABASE_URL=your_database_url_here`   
`NEXTAUTH_SECRET=your_nextauth_secret_here`      
`NEXTAUTH_URL=http://localhost:3000`   

**4. Run the development server**  
`npm run dev`  

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Deploy on Vercel
The easiest way to deploy is to use the [Vercel Platform](https://vercel.com/).

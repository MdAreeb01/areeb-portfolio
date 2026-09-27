# Areeb --- Data Science & AI/ML Portfolio

A modern, responsive personal portfolio for **Areeb**, focused on Data
Science, Machine Learning, AI, Data Analytics, Python, SQL, and
practical software projects.

The portfolio uses a dark, minimal visual system with animated sections,
responsive layouts, interactive project cards, Framer Motion effects,
and a polished 3D-inspired presentation.

## 🌐 Live Website

**Portfolio:** https://its-areebarchives.vercel.app/

## ✨ Highlights

-   Responsive design for mobile, tablet, laptop, desktop, and ultrawide
    screens
-   Animated hero section with interactive visual elements
-   Scroll-based animations and reveal effects
-   Interactive project showcase
-   Responsive project-card stacking on larger screens
-   Mobile-friendly project presentation
-   Interactive social/contact cards
-   Smooth hover and motion effects
-   Dark premium visual design
-   Lazy-loaded project preview images
-   Deployed with Vercel

## 🧩 Website Sections

### Hero

Introduces Areeb as a Data Science / AI/ML professional with animated
typography, navigation, interactive visual elements, and a contact
call-to-action.

### About

Presents Areeb's background, interests, skills, and professional focus
with animated content and decorative visual elements.

### Services

Highlights areas of work related to:

-   Data Science
-   Machine Learning
-   Data Analytics
-   Python
-   SQL
-   Power BI
-   AI/ML Applications
-   Intelligent Data-driven Solutions

### Projects

The project showcase currently includes:

#### 01 --- RetainAI · Churn Intelligence

**Category:** Personal

A customer churn prediction and retention intelligence application
featuring machine-learning-based churn prediction and AI-assisted
retention insights.

**Live:** https://retainai-churn-intelligence.streamlit.app/

#### 02 --- Travel Management Analysis Dashboard

**Category:** Personal

A Power BI data analytics project focused on travel-management data,
dashboards, visual analysis, and business insights.

**GitHub:** https://github.com/MdAreeb01/Travel-Management-Analysis-

#### 03 --- Human Resource Analysis Dashboard

**Category:** Personal

A Power BI dashboard project focused on HR analytics, employee-related
metrics, recruitment analysis, and visual business insights.

**GitHub:** https://github.com/MdAreeb01/Human-Resource-Analysis

### Contact

Provides direct contact and social links for:

-   Email
-   Instagram
-   LinkedIn
-   GitHub

The contact cards include responsive layouts, hover effects, and subtle
3D pointer interactions on devices with a fine pointer.

## 🛠️ Tech Stack

-   React
-   TypeScript
-   TanStack Start
-   Vite
-   Tailwind CSS
-   Framer Motion
-   Three.js
-   React Three Fiber
-   @react-three/drei
-   Lucide React
-   Nitro
-   Vercel

## 📱 Responsive Design

The portfolio is designed with a mobile-first approach and adapts
across:

-   Mobile phones
-   Tablets
-   Laptops
-   Desktop monitors
-   Large and ultrawide displays

Responsive behavior uses Tailwind breakpoints together with fluid sizing
techniques such as `clamp()`, viewport-aware sizing, flexible layouts,
and responsive positioning.

Special attention is given to:

-   3D/hero composition
-   Project cards
-   Project image proportions
-   Contact-card layouts
-   Typography
-   Horizontal overflow prevention
-   Mobile spacing
-   Sticky and scroll interactions

## 🎞️ Animations & Interactions

The website uses Framer Motion for:

-   Fade-in animations
-   Scroll-based effects
-   Project-card scaling
-   Hover interactions
-   Image parallax
-   Contact-card movement
-   Subtle 3D pointer tilt
-   UI transitions

Reduced-motion preferences are respected where applicable.

## 📁 Project Structure

``` text
src/
├── components/
│   └── portfolio/
│       ├── HeroSection.tsx
│       ├── MarqueeSection.tsx
│       ├── AboutSection.tsx
│       ├── ServicesSection.tsx
│       ├── ProjectsSection.tsx
│       ├── ContactSection.tsx
│       ├── Buttons.tsx
│       └── FadeIn.tsx
├── routes/
│   ├── __root.tsx
│   └── index.tsx
└── server.ts
```

Project preview images are stored in the public assets:

``` text
public/
└── projects/
    ├── 01_prediction_page.png
    ├── 01_ai_retention.png
    ├── 01_home_page.png
    ├── 02_dashboard.png
    ├── 02_dashboard1.png
    ├── 02_main.png
    ├── 03_dashboard.png
    ├── 03_dashboard1.png
    └── 03_main.png
```

## 🚀 Getting Started

### Prerequisites

-   Node.js
-   npm
-   Git

### Installation

``` bash
git clone <your-repository-url>
cd areeb-portfolio
npm install
```

### Run locally

``` bash
npm run dev
```

Then open the local development URL shown by Vite.

### Production build

``` bash
npm run build
```

## ☁️ Deployment

The portfolio is deployed on **Vercel** and connected to GitHub.

Production URL:

https://its-areebarchives.vercel.app/

After pushing changes to the connected production branch, Vercel can
automatically create a new deployment.

## 👨‍💻 About Areeb

Areeb is a Computer Science graduate focused on turning data into
insights and building practical applications using:

-   Python
-   Machine Learning
-   AI
-   Data Analytics
-   SQL
-   Power BI
-   Excel
-   Modern web technologies

The portfolio showcases projects that combine data analysis, machine
learning, AI, dashboards, and practical application development.

## 📬 Connect

-   **Portfolio:** https://its-areebarchives.vercel.app/
-   **GitHub:** https://github.com/MdAreeb01
-   **LinkedIn:** https://www.linkedin.com/in/mohd-areeb1201
-   **Instagram:** https://instagram.com/\_\_areeb_28\_

------------------------------------------------------------------------

Built with React, TypeScript, Tailwind CSS, Framer Motion, and modern
web technologies.

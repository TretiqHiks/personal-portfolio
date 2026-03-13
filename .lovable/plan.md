
# Premium Software Engineer Portfolio

## Design System
- **Theme**: Dark futuristic with glassmorphism — deep navy background (#0D1117), soft white text, blue accents, subtle green status indicators
- **Typography**: Inter font throughout, bold headlines, clean body text
- **Components**: Rounded corners (12-16px), glass surfaces with backdrop blur, 1px white-alpha borders, soft glows on hover
- **Motion**: Snappy 200-300ms transitions, subtle hover lifts, fade-in reveals

## Shared Components
- **Floating Navbar**: Centered pill-shaped glass container with Home, About, Experience, Projects links — does not stretch full width
- **Status Bubble**: Reusable pill near top-right with green accent — "Open to new opportunities"
- **Layout Wrapper**: Consistent page structure with navbar + status on every page

## Pages

### 1. Home (Non-scrollable Hero)
- Full viewport, no scroll — everything fits in one screen
- Centered layout: profile picture (avatar), name, title, short bio, engaging quote
- Two CTA buttons: "View Projects" and "Experience" styled with blue accent
- Balanced, confident first impression

### 2. About
- Short biography section
- Engineering philosophy / mindset
- Types of problems the engineer enjoys solving
- Current interests and explorations
- Cards or sectioned layout, visually cohesive with the rest of the site

### 3. Experience
- **Vertical Timeline**: Modern interactive timeline with role, company, dates, description for each entry
- **Skill Matrix**: Grid organized by category (Languages, Frameworks, Cloud/DevOps, Databases, Tools) with hover states and subtle animations
- **Interactive connection**: Hovering a timeline entry highlights related skills in the matrix

### 4. Projects Overview
- Grid of elevated glass-style project cards
- Each card: title, summary, tech stack tags, optional GitHub/demo icons
- Smooth hover states with blue accent border/glow
- Clicking navigates to project detail page

### 5. Project Detail (Dynamic Route)
- Case-study layout: title, description, tech stack (visual tags), key features, challenges/solutions, external links
- Clean single-column readable layout
- Structured sections with clear hierarchy

## Content
All pages use realistic placeholder content (name, bio, experience entries, skills, projects) that can be easily swapped out later.

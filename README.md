# InhaleSync - Smart Inhaler Care

A comprehensive web application for smart inhaler management with role-based access for Patients, Caregivers, and Medical Teams.

## Features

### Patient Dashboard
- Track inhaler dosage history and remaining doses
- Receive medication reminders and notifications
- Emergency SOS functionality
- Weekly adherence reports and charts
- Environmental alerts monitoring

### Caregiver Portal
- Monitor linked patients (with patient approval)
- Receive alerts for missed doses and low battery
- Emergency notifications with patient location
- View patient adherence summaries
- Add care notes and observations

### Medical Team Dashboard
- Access assigned patient data and reports
- Monitor dosage/adherence across multiple patients
- Update prescriptions with automatic sync
- View caregiver notes and patient history
- Emergency alert management

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI Components**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (Database, Authentication, Storage)
- **Authentication**: Email/Password with role-based access
- **State Management**: React Query + Context
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (for backend services)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd inhalesync

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup

Create a `.env.local` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components and routing
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── integrations/       # External service integrations
└── assets/             # Static assets
```

## Authentication & Roles

The application supports three user roles:

- **Patient**: Individual inhaler users
- **Caregiver**: Family members or care providers
- **Medical Team**: Healthcare professionals

Each role has specific permissions and dashboard views.

## Database Schema

The application uses Supabase with the following main tables:

- `profiles` - User profiles with role information
- `medications` - Medication tracking and history
- `appointments` - Medical appointments
- `emergency_alerts` - SOS and emergency notifications
- `caregiver_notes` - Care observations and notes

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
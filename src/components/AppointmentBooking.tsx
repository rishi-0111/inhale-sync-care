import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  FileText,
  Video,
  MapPin,
  Phone 
} from "lucide-react";

export function AppointmentBooking() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const doctors = [
    {
      name: "Dr. Sarah Johnson",
      specialty: "Pulmonologist",
      rating: 4.9,
      experience: "15 years",
      nextAvailable: "Tomorrow, 2:30 PM",
      type: "In-person"
    },
    {
      name: "Dr. Michael Chen",
      specialty: "Respiratory Specialist",
      rating: 4.8,
      experience: "12 years",
      nextAvailable: "Today, 4:00 PM",
      type: "Telehealth"
    },
    {
      name: "Dr. Emily Rodriguez",
      specialty: "Allergy & Asthma",
      rating: 4.9,
      experience: "18 years",
      nextAvailable: "Friday, 10:15 AM",
      type: "In-person"
    }
  ];

  const upcomingAppointments = [
    {
      date: "Jan 25, 2024",
      time: "2:30 PM",
      doctor: "Dr. Sarah Johnson",
      type: "Follow-up",
      mode: "In-person"
    },
    {
      date: "Feb 8, 2024",
      time: "10:00 AM",
      doctor: "Dr. Michael Chen",
      type: "Check-up",
      mode: "Telehealth"
    }
  ];

  const timeSlots = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
    "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM"
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Appointment Booking
          </h1>
          <p className="text-muted-foreground mt-1">
            Schedule consultations with respiratory specialists
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar & Time Selection */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Select Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                />
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Available Times
                </CardTitle>
                <CardDescription>
                  {selectedDate?.toDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {timeSlots.map((time, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-sm hover:bg-primary hover:text-primary-foreground"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Doctor Selection */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Available Doctors
                </CardTitle>
                <CardDescription>
                  Choose your preferred respiratory specialist
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {doctors.map((doctor, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={`/doctor-${index + 1}.jpg`} />
                          <AvatarFallback className="bg-gradient-primary text-white">
                            {doctor.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{doctor.name}</h3>
                          <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              ⭐ {doctor.rating}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {doctor.experience}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-accent">{doctor.nextAvailable}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {doctor.type === "Telehealth" ? (
                            <Video className="w-4 h-4" />
                          ) : (
                            <MapPin className="w-4 h-4" />
                          )}
                          <span className="text-xs text-muted-foreground">{doctor.type}</span>
                        </div>
                        <Button size="sm" className="mt-2 bg-gradient-primary hover:opacity-90">
                          Book Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Upcoming Appointments
            </CardTitle>
            <CardDescription>
              Your scheduled consultations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((apt, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="font-semibold text-primary">{apt.date}</p>
                      <p className="text-sm text-muted-foreground">{apt.time}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">{apt.doctor}</h3>
                      <p className="text-sm text-muted-foreground">{apt.type}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {apt.mode === "Telehealth" ? (
                          <Video className="w-4 h-4" />
                        ) : (
                          <MapPin className="w-4 h-4" />
                        )}
                        <span className="text-xs text-muted-foreground">{apt.mode}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      Share Report
                    </Button>
                    <Button size="sm" variant="outline">
                      <Phone className="w-4 h-4 mr-2" />
                      Reschedule
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
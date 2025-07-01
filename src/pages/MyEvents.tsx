"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";

import dayjs from "dayjs"; // Import dayjs
import utc from "dayjs/plugin/utc"; // Import UTC plugin if you deal with UTC dates
import timezone from "dayjs/plugin/timezone"; // Import timezone plugin for local time conversion
import { Link } from "react-router-dom";

dayjs.extend(utc); // Extend dayjs with utc plugin
dayjs.extend(timezone); // Extend dayjs with timezone plugin

// Event interface remains the same as your backend sends dateTime as one field
interface Event {
  _id: string;
  title: string;
  name: string;
  dateTime: string; // This will be the ISO string from the backend
  location: string;
  description: string;
  attendeeCount: number;
  user: string;
}

export default function MyEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    name: "",
    date: "", // These are for the form inputs (YYYY-MM-DD)
    time: "", // These are for the form inputs (HH:mm)
    location: "",
    description: "",
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const data = await apiService.getMyEvents();
      // Sort events by dateTime (most recent first)
      const sortedEvents = data.sort((a: Event, b: Event) => {
        // Use dayjs to parse and compare
        const dateA = dayjs(a.dateTime);
        const dateB = dayjs(b.dateTime);
        return dateB.diff(dateA); // diff returns difference in milliseconds
      });
      setEvents(sortedEvents);
    } catch (error) {
      toast.error("Failed to fetch events.");
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);

    // Use dayjs to parse the ISO string from the backend
    const eventDayjs = dayjs(event.dateTime);

    setFormData({
      title: event.title,
      name: event.name,
      // Format for input type="date" (YYYY-MM-DD)
      date: eventDayjs.format("YYYY-MM-DD"),
      // Format for input type="time" (HH:mm)
      time: eventDayjs.format("HH:mm"),
      location: event.location,
      description: event.description,
    });
    setIsDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    setUpdateLoading(true);
    try {
      // Combine date and time from formData into a single dayjs object
      // Assuming formData.date is YYYY-MM-DD and formData.time is HH:mm
      // We explicitly set a base date and then combine the time for robustness
      const combinedDateTimeString = `${formData.date} ${formData.time}`;
      const combinedDayjs = dayjs(combinedDateTimeString);

      // Convert to ISO 8601 string for the backend, ideally with UTC if backend expects it
      // If your backend stores as UTC from input, .utc().toISOString() is safer
      // If it stores based on server's local time and converts, .toISOString() might be fine
      const dateTimeToSend = combinedDayjs.toISOString(); // Or combinedDayjs.utc().toISOString() if you need to guarantee UTC

      await apiService.updateEvent(editingEvent._id, {
        ...formData,
        dateTime: dateTimeToSend,
        date: undefined, // Remove separate date/time fields from payload
        time: undefined,
      });
      toast.success("Event updated successfully!");
      setIsDialogOpen(false);
      fetchMyEvents(); // Re-fetch to show updated data
    } catch (error: any) {
      toast.error("Failed to update event.");
      console.error("Error updating event:", error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    try {
      await apiService.deleteEvent(eventId);
      toast.success("Event deleted successfully!");
      fetchMyEvents();
    } catch (error: any) {
      toast.error("Failed to delete event.");
      console.error("Error deleting event:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Helper function to format the dateTime string for display
  const formatDateForDisplay = (isoDateTimeString: string) => {
    // Parse the ISO string with dayjs and format it
    // Example: "Tuesday, July 15, 2025"
    return dayjs(isoDateTimeString).format("dddd, MMMM D, YYYY");
  };

  // Helper function to format the dateTime string for time display
  const formatTimeForDisplay = (isoDateTimeString: string) => {
    // Parse the ISO string with dayjs and format it
    // Example: "2:30 PM"
    return dayjs(isoDateTimeString).format("h:mm A");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Events</h1>
        <p className="text-gray-600">Manage your created events</p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No events created yet
          </h3>
          <p className="text-gray-600 mb-4">
            Start by creating your first event
          </p>
          <Link to={"/add-event"}>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card
              key={event._id}
              className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-lg overflow-hidden"
            >
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <CardTitle className="text-xl font-bold truncate">
                  {event.title}
                </CardTitle>
                <div className="flex items-center text-purple-100">
                  <Users className="h-4 w-4 mr-1" />
                  <span className="text-sm">by {event.name}</span>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                    <span className="text-sm">
                      {formatDateForDisplay(event.dateTime)}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2 text-purple-500" />
                    <span className="text-sm">
                      {formatTimeForDisplay(event.dateTime)}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-purple-500" />
                    <span className="text-sm truncate">{event.location}</span>
                  </div>
                </div>

                <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                  {event.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <Badge
                    variant="secondary"
                    className="bg-purple-100 text-purple-800"
                  >
                    <Users className="h-3 w-3 mr-1" />
                    {event.attendeeCount} attendees
                  </Badge>
                </div>

                <div className="flex space-x-2">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer flex-1 border-purple-200 text-purple-600 hover:bg-purple-50 bg-transparent"
                        onClick={() => handleEdit(event)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Update
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl bg-white">
                      <DialogHeader>
                        <DialogTitle>Update Event</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Event Title</Label>
                          <Input
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="name">Organizer Name</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                              id="date"
                              name="date"
                              type="date"
                              value={formData.date}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="time">Time</Label>
                            <Input
                              id="time"
                              name="time"
                              type="time"
                              value={formData.time}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            required
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            className="cursor-pointer"
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={updateLoading}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          >
                            {updateLoading ? "Updating..." : "Update Event"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer flex-1 border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete your event.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(event._id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

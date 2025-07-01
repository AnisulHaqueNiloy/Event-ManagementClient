"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/services/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Search, Calendar, MapPin, Users, Clock, Filter } from "lucide-react";

import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/EnhancedAuthContext";

import dayjs from "dayjs"; // Import dayjs
import utc from "dayjs/plugin/utc"; // Import UTC plugin
import timezone from "dayjs/plugin/timezone"; // Import timezone plugin
import isBetween from "dayjs/plugin/isBetween"; // Import isBetween plugin

dayjs.extend(utc); // Extend dayjs with utc plugin
dayjs.extend(timezone); // Extend dayjs with timezone plugin
dayjs.extend(isBetween); // Extend dayjs with isBetween plugin

// Update the Event interface to match the backend structure
interface Event {
  _id: string;
  title: string;
  name: string;
  dateTime: string; // This will be the ISO string from the backend
  location: string;
  description: string;
  attendeeCount: number;
  user: string; // Assuming 'user' is the ID of the creator
  joinedUsers: string[]; // Array of user IDs who have joined
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const { user } = useAuth(); // Get the logged-in user from auth context

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, dateFilter]); // Re-run filter when these dependencies change

  const fetchEvents = async () => {
    try {
      const data = await apiService.getAllEvents();
      // Sort events by dateTime (most recent first)
      const sortedEvents = data.sort((a: Event, b: Event) => {
        // Use dayjs to parse and compare dateTimes
        const dateA = dayjs(a.dateTime);
        const dateB = dayjs(b.dateTime);
        return dateB.diff(dateA); // diff returns difference in milliseconds
      });
      setEvents(sortedEvents);
    } catch (error) {
      toast.error("Failed to fetch events."); // Use toast.error for better UX
      console.error("Error fetching all events:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    // Search filter based on event title
    if (searchTerm) {
      filtered = filtered.filter((event) =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = dayjs(); // Get current time with dayjs
      const todayStart = now.startOf("day"); // Start of today

      filtered = filtered.filter((event) => {
        const eventDayjs = dayjs(event.dateTime); // Parse event's dateTime

        switch (dateFilter) {
          case "today":
            return eventDayjs.isSame(todayStart, "day"); // Check if event is on the same day as today
          case "current-week": {
            const weekStart = todayStart.startOf("week"); // Start of current week (Sunday by default)
            const weekEnd = todayStart.endOf("week"); // End of current week (Saturday by default)
            return eventDayjs.isBetween(weekStart, weekEnd, null, "[]"); // [] means inclusive of start and end
          }
          case "last-week": {
            const lastWeekStart = todayStart
              .subtract(1, "week")
              .startOf("week");
            const lastWeekEnd = todayStart.subtract(1, "week").endOf("week");
            return eventDayjs.isBetween(lastWeekStart, lastWeekEnd, null, "[]");
          }
          case "current-month":
            return eventDayjs.isSame(todayStart, "month"); // Check if event is in the same month as today
          case "last-month": {
            const lastMonthStart = todayStart
              .subtract(1, "month")
              .startOf("month");
            const lastMonthEnd = todayStart.subtract(1, "month").endOf("month");
            return eventDayjs.isBetween(
              lastMonthStart,
              lastMonthEnd,
              null,
              "[]"
            );
          }
          default:
            return true;
        }
      });
    }

    setFilteredEvents(filtered);
  };

  const handleJoinEvent = async (eventId: string) => {
    try {
      await apiService.joinEvent(eventId);
      toast.success("Successfully joined event!"); // Use toast.success
      fetchEvents(); // Refresh events to update attendee count and joined status
    } catch (error) {
      // error.response?.data?.message || "Failed to join event.";
      toast.error("error"); // Display specific error message from backend
      console.error("Error joining event:", error);
    }
  };

  // Helper function to format the dateTime string for display
  const formatDateForDisplay = (isoDateTimeString: string) => {
    // Parse the ISO string with dayjs and format it
    return dayjs(isoDateTimeString).format("dddd, MMMM D, YYYY");
  };

  // Helper function to format the dateTime string for time display
  const formatTimeForDisplay = (isoDateTimeString: string) => {
    // Parse the ISO string with dayjs and format it
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Events</h1>
        <p className="text-gray-600">
          Discover and join amazing events in your community
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search events by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
          />
        </div>
        <div className="flex  items-center space-x-2">
          <Filter className="text-gray-400 h-5 w-5" />
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-48 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="today">Today</SelectItem>

              <SelectItem value="current-month">Current Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No events found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card
              key={event._id}
              className="cursor-pointer group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-lg overflow-hidden"
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

                <div className="flex items-center justify-between">
                  <Badge
                    variant="secondary"
                    className="bg-purple-100 text-purple-800"
                  >
                    <Users className="h-3 w-3 mr-1" />
                    {event.attendeeCount} attendees
                  </Badge>

                  {user &&
                    event.user !== user.id && ( // Only show join button if logged in and not creator
                      <Button
                        onClick={() => handleJoinEvent(event._id)}
                        disabled={event.joinedUsers?.includes(user?.id)} // Check if user has already joined
                        className="cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                      >
                        {event.joinedUsers?.includes(user?.id) // Check if user has already joined
                          ? "Joined"
                          : "Join Event"}
                      </Button>
                    )}
                  {user &&
                    event.user === user.id && ( // Show "Your Event" badge if user is creator
                      <Badge
                        variant="outline"
                        className="border-purple-600 text-purple-600 px-3 py-1"
                      >
                        Your Event
                      </Badge>
                    )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

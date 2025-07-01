"use client";

import type React from "react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "@/services/api";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Calendar, MapPin, Clock, Users, Plus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function AddEvent() {
  const [formData, setFormData] = useState({
    title: "",
    name: "",
    date: "",
    time: "",
    location: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const combinedDateTimeString = `${formData.date} ${formData.time}`;
      const localDateTime = dayjs(combinedDateTimeString);
      const dateTimeToSend = localDateTime.utc().toISOString();

      await apiService.createEvent({
        title: formData.title,
        name: formData.name,
        dateTime: dateTimeToSend,
        location: formData.location,
        description: formData.description,
        attendeeCount: 0,
      });

      toast.success("Event has been created successfully!");

      navigate("/events");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to create event.";
      toast.error(errorMessage);
      console.error("Error creating event:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create New Event
        </h1>
        <p className="text-gray-600">
          Share your amazing event with the community
        </p>
      </div>

      <Card className="shadow-xl border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardTitle className="flex items-center text-2xl">
            <Plus className="mr-2 h-6 w-6" />
            Event Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="text-sm font-medium text-gray-700 flex items-center"
              >
                <Calendar className="mr-2 h-4 w-4 text-purple-500" />
                Event Title
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter event title"
                required
                className="h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-gray-700 flex items-center"
              >
                <Users className="mr-2 h-4 w-4 text-purple-500" />
                Organizer Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                required
                className="h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="date"
                  className="text-sm font-medium text-gray-700 flex items-center"
                >
                  <Calendar className="mr-2 h-4 w-4 text-purple-500" />
                  Date
                </Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                  min={dayjs().add(1, "day").format("YYYY-MM-DD")}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="time"
                  className="text-sm font-medium text-gray-700 flex items-center"
                >
                  <Clock className="mr-2 h-4 w-4 text-purple-500" />
                  Time
                </Label>
                <Input
                  id="time"
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="location"
                className="text-sm font-medium text-gray-700 flex items-center"
              >
                <MapPin className="mr-2 h-4 w-4 text-purple-500" />
                Location
              </Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Event location"
                required
                className="h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-sm font-medium text-gray-700"
              >
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your event..."
                rows={4}
                required
                className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-lg font-medium"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Event...
                </div>
              ) : (
                <>
                  <Plus className="mr-2 h-5 w-5" />
                  Create Event
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

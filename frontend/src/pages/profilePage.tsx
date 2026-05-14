import React, { useEffect, useState } from "react";
import { Mail, Pencil, Upload, User } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useAuthProfile } from "@/hooks/useAuthProfile";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router";

const ProfilePage = () => {
  const { token } = useAuth();
  const { user, loading } = useAuthProfile();
  const navigate = useNavigate();

  const [name, setName] = useState("Undefined");
  const [tempName, setTempName] = useState("");

  const [profileImage, setProfileImage] = useState("");
  const [tempProfileImage, setTempProfileImage] = useState("");

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
      setTempName(user.name);
    }
    if (user?.profileUrl) {
      setProfileImage(user.profileUrl);
    }
  }, [user]);

  const email = user?.email || "No Email";

  const handleBack = () => {
    navigate(-1);
  };

  async function handleSave() {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/profile`,
        {
          name: tempName || name,
          profileUrl: tempProfileImage || profileImage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setName(response.data.user.name);

      if (tempProfileImage) {
        setProfileImage(tempProfileImage);
      }

      setIsEditDialogOpen(false);
      setIsUploadDialogOpen(false);
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setTempName("");
      setTempProfileImage("");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-muted/30 flex min-h-dvh items-center justify-center p-6">
      <div className="bg-background flex w-full max-w-4xl flex-col rounded-2xl border p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={handleBack}>
            ← Go Back
          </Button>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Pencil size={16} />
                Edit Name
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
              </DialogHeader>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="cursor-not-allowed">
                    <Input value={email} disabled />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button onClick={handleSave}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Main Content */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-28 w-28 border">
                <AvatarImage src={profileImage} />
                <AvatarFallback>
                  <User size={40} />
                </AvatarFallback>
              </Avatar>

              <Dialog
                open={isUploadDialogOpen}
                onOpenChange={setIsUploadDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    size="icon"
                    className="absolute -right-2 -bottom-2 rounded-full"
                  >
                    <Upload size={16} />
                  </Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Profile Picture</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-2">
                    <Label>Image URL</Label>
                    <Input
                      type="text"
                      placeholder="Enter image URL"
                      value={tempProfileImage}
                      onChange={(e) => setTempProfileImage(e.target.value)}
                    />
                  </div>

                  <DialogFooter>
                    <Button onClick={handleSave}>Save Changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-muted-foreground text-sm">Name</p>
                <h1 className="text-3xl font-bold">{name}</h1>
              </div>

              <div className="flex items-center gap-2">
                <Mail size={16} className="text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground text-sm">Email</p>
                  <p className="font-medium">{email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

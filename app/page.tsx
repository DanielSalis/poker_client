"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import background from "./background.png";
import { funAnimalName } from "fun-animal-names";
import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TabsContent } from "@radix-ui/react-tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { z } from "zod";
import React from "react";
import { usePokerApi } from "@/hooks/usePokerApi";
import DialogLayout from "@/components/dialog/dialog-layout";
import CreateRoomForm from "@/components/form/create-room-form";
import JoinRoomForm from "@/components/form/join-room-form";

const formSchema = z.object({
  roomName: z.string().min(1, "Room name is required"),
  maxPlayers: z.string().min(1).max(8, "Max players must be between 1 and 8"),
  username: z.string().min(1, "Username is required"),
  balance: z.number().min(0).max(3000, "Balance must be between 0 and 3000"),
});

const joinFormSchema = z.object({
  username: z.string().min(1, "Username is required"),
  balance: z.number().min(0).max(3000, "Balance must be between 0 and 3000"),
  roomId: z.string().min(1, "Room name is required"),
});

type FormValues = z.infer<typeof formSchema>;
type JoinFormValues = z.infer<typeof joinFormSchema>;

export default function Home() {
  const createRoomApi = usePokerApi<{
    id: number;
    name: string;
    max_players: number;
    current_players: [];
  }>();
  const createPlayerApi = usePokerApi<{
    id: string;
    username: string;
    chips: string;
  }>();
  const joinApi = usePokerApi<{ message: string }>();

  const handleCreateRoomAndPlayer = (data: FormValues) => {
    createRoomApi.fetchApi("games", {
      method: "POST",
      body: {
        name: data.roomName,
        max_players: data.maxPlayers,
      },
    });

    createPlayerApi.fetchApi("players", {
      method: "POST",
      body: {
        username: data.username,
        balance: data.balance,
      },
    });
  };

  const handleJoin = async (data: JoinFormValues) => {
    await createPlayerApi.fetchApi("players", {
      method: "POST",
      body: {
        username: data.username,
        balance: data.balance,
      },
    });

    const playerId = createPlayerApi.data?.id;

    if (playerId) {
      joinApi.fetchApi(`games/${data.roomId}/join`, {
        method: "POST",
        body: {
          player_id: playerId,
        },
      });
    }
  };

  return (
    <div
      className="w-[100%] h-[100%] flex flex-col justify-center items-center"
      style={{
        backgroundImage: `url(${background.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <DialogLayout>
        <Tabs defaultValue="create">
          <TabsList>
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="join">Join</TabsTrigger>
          </TabsList>
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Create a room</CardTitle>
                <CardDescription>
                  You will be redirected to a new room, and a shareable ID will
                  be generated.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CreateRoomForm onSubmit={handleCreateRoomAndPlayer}/>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="join">
            <Card>
              <CardHeader>
                <CardTitle>Join an existing room</CardTitle>
                <CardDescription>
                  Grab a friend's room ID and join!
                </CardDescription>
              </CardHeader>
              <JoinRoomForm onSubmit={handleJoin}/>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogLayout>
    </div>
  );
}

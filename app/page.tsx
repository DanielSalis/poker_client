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
import DialogLayout from "@/components/dialog/dialog-layout";
import CreateRoomForm from "@/components/form/create-room-form";
import JoinRoomForm from "@/components/form/join-room-form";
import { useRouter } from 'next/navigation'
import Link from "next/link";

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
  const router = useRouter();

  const handleCreateRoomAndPlayer = async (data: FormValues) => {
    const roomResponse = await fetch("http://localhost:3000/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: data.roomName,
        max_players: data.maxPlayers,
      }),
    });
    const room = await roomResponse.json()

    const playerResponse = await fetch("http://localhost:3000/players", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: data.username,
        balance: data.balance,
      }),
    });
    const player = await playerResponse.json()

    const joinResponse = await fetch(`http://localhost:3000/rooms/${room.id}/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        player_id: player.id,
      }),
    });

    if(joinResponse){
      router.push(`room/${room.id}`)
    }
  };

  const handleJoin = async (data: JoinFormValues) => {
    const playerCreated = await fetch("http://localhost:3000/players", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: data.username,
        balance: data.balance,
      }),
    });

    const player = await playerCreated.json()

    const playerId = player.id;

    if (playerId) {
      const joinResponse = await fetch(`http://localhost:3000/rooms/${data.roomId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          player_id: playerId,
        }),
      });
      if(joinResponse.ok){
        router.push(`room/${data.roomId}`)
      }
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
                <CreateRoomForm onSubmit={handleCreateRoomAndPlayer} />
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
              <CardContent>
                <JoinRoomForm onSubmit={handleJoin} />
                <div className="w-[100%] flex justify-center items-center mt-4">
                  <Link href="/room/all" className=" underline text-sky-600">check the ongoing games!</Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogLayout>
    </div>
  );
}

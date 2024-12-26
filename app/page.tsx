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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { usePokerApi } from "@/hooks/usePokerApi";

interface ICreatedRoom {
  id: number;
  name: string;
  max_players: number;
  current_players: [];
}

interface ICreatedPlayer {
  name: string;
}

interface IForm {
  roomName: string;
  maxPlayers: number;
  username: string;
  balance: number;
}

export default function Home() {
  const [roomNameHint, setRommNameHint] = useState(
    "player" + Math.floor(Math.random() * 100)
  );
  const [form, setForm] = useState<IForm>({
    roomName: "",
    maxPlayers: 1,
    username: "",
    balance: 1000,
  });
  const createRoomApi = usePokerApi<ICreatedRoom>();
  const createPlayerApi = usePokerApi<ICreatedPlayer>();

  const createRoom = () => {
    createRoomApi.fetchApi("games", {
      method: "POST",
      body: {
        name: form.roomName,
        max_players: form.maxPlayers
      },
    });
  };

  const createPlayer = () => {
    createPlayerApi.fetchApi("player", {
      method: "POST",
      body: {
        username: form.username,
        balance: form.balance
      }
    })
  }

  const handleCreateRoomAndPlayer = () => {
    createRoom();
    createPlayer();
  }

  return (
    <div
      className=" w-[100%] h-[100%] flex flex-col justify-center items-center"
      style={{
        backgroundImage: `url(${background.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Dialog open={true}>
        <DialogContent className="w-[360px] min-h-[640px] flex flex-col justify-start">
          <DialogDescription></DialogDescription>
          <DialogHeader>
            <DialogTitle>
              Welcome to li<em>a</em>poker
            </DialogTitle>
          </DialogHeader>
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
                    You will be redirect to a new room and then a shareable ID
                    will be generated.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="roomName">Room name</Label>
                    <Input
                      id="roomName"
                      placeholder={
                        "e.g: " + funAnimalName(roomNameHint) + " room"
                      }
                      value={form.roomName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setForm({ ...form, roomName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="maxPlayers">Max players</Label>
                    <Input
                      id="maxPlayers"
                      type="number"
                      max="8"
                      min="1"
                      value={form.maxPlayers}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setForm({ ...form, maxPlayers: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder={"e.g: " + roomNameHint}
                      value={form.username}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setForm({ ...form, username: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="balance">Balance</Label>
                    <Input
                      id="balance"
                      type="number"
                      step="1"
                      min="0"
                      max="3000"
                      placeholder="e.g: 1000"
                      value={form.username}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setForm({ ...form, balance: Number(e.target.value) })
                      }
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handleCreateRoomAndPlayer()}
                  >
                    Create
                  </Button>
                </CardFooter>
                <p>{createRoomApi.data?.id}</p>
              </Card>
            </TabsContent>
            <TabsContent value="join">
              <Card>
                <CardHeader>
                  <CardTitle>Join in an existent room</CardTitle>
                  <CardDescription>
                    Grab a friend's room ID and join!
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="roomId">Room ID</Label>
                    <Input id="roomId" placeholder={"e.g: " + uuidv4()} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" defaultValue={roomNameHint} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="balance">Balance</Label>
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      max="3000"
                      id="balance"
                      defaultValue="1000"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Create</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}

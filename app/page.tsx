'use client'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import background from "./background.png";
import { funAnimalName } from 'fun-animal-names'


import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TabsContent } from "@radix-ui/react-tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Home() {
  const [roomNameHint, setRommNameHint] = useState("player"+Math.floor(Math.random()*100));

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
        <DialogContent className="w-[360px] min-h-[600px] flex flex-col justify-start">
          <DialogHeader>
            <DialogTitle>Welcome to lia poker</DialogTitle>
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
                    You will be redirect to a new room and then a shareable ID will be generated.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="roomName">Room name</Label>
                    <Input id="roomName" placeholder={"e.g: "+funAnimalName(roomNameHint) + " room"}/>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="maxPlayers">Max players</Label>
                    <Input id="maxPlayers" type="number" max="8" min="1" defaultValue="1"/>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" defaultValue={roomNameHint} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="balance">Balance</Label>
                    <Input type="number" step="1" min="0" max="3000" id="balance" defaultValue="1000" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Create</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="join">join here</TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}

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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { usePokerApi } from "@/hooks/usePokerApi";

const formSchema = z.object({
  roomName: z.string().min(1, "Room name is required"),
  maxPlayers: z.number().min(1).max(8, "Max players must be between 1 and 8"),
  username: z.string().min(1, "Username is required"),
  balance: z.number().min(0).max(3000, "Balance must be between 0 and 3000"),
  roomId: z.string().min(1, "Room name is required")
});

const joinFormSchema = z.object({
  username: z.string().min(1, "Username is required"),
  balance: z.number().min(0).max(3000, "Balance must be between 0 and 3000"),
  roomId: z.string().min(1, "Room name is required")
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
  const createPlayerApi = usePokerApi<{ id: string,  username: string, chips: string}>();
  const joinApi = usePokerApi<{ message: string }>();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomName: "",
      maxPlayers: 1,
      username: "",
      balance: 1000,
    },
  });

  const formJoin = useForm<JoinFormValues>({
    resolver: zodResolver(joinFormSchema),
    defaultValues: {
      roomId: "",
      username: "",
      balance: 1000,
    },
  });

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

    const playerId = createPlayerApi.data?.id

    if (playerId) {
      joinApi.fetchApi(`games/${data.roomId}/join`, {
        method: "POST",
        body: {
          player_id: playerId
        }
      })
    }
  }

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
                    You will be redirected to a new room, and a shareable ID
                    will be generated.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(handleCreateRoomAndPlayer)}
                      className="space-y-4"
                    >
                      <FormField
                        name="roomName"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Room Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={`e.g: ${funAnimalName(
                                  uuidv4.toString()
                                )}`}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="maxPlayers"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Players</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="username"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g: player123" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="balance"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Balance</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit">Create</Button>
                    </form>
                  </Form>
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
                <CardContent className="space-y-4">
                  <Form {...formJoin}>
                    <form
                      onSubmit={formJoin.handleSubmit(handleJoin)}
                      className="space-y-4"
                    >
                      <FormField
                        name="roomId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Room ID</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={"e.g: " + uuidv4()}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={"e.g: John doe"}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="balance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Balance</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="3000"
                                step="1"
                                placeholder="e.g: 1000"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full">
                        Join Room
                      </Button>
                      {createPlayerApi.data?.id}
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}

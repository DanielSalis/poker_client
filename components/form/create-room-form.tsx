import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RoomForm } from "@/components/form/room-form";

const createRoomSchema = z.object({
  roomName: z.string().min(1, "Room name is required"),
  maxPlayers: z.string().min(1, "Max players must be between 1 and 8"),
  username: z.string().min(1, "Username is required"),
  balance: z.string().min(1, "Balance must be between 0 and 3000"),
});


const CreateRoomForm = ({ onSubmit }: any) => {
  const form = useForm({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      roomName: "",
      maxPlayers: "",
      username: "",
      balance: "",
    },
  });

  const fields = [
    { name: "roomName", label: "Room Name", placeholder: "Enter a room name" },
    { name: "maxPlayers", label: "Max Players", type: "number", placeholder: "1-8" },
    { name: "username", label: "Username", placeholder: "Enter your username" },
    { name: "balance", label: "Balance", type: "number", placeholder: "1000" },
  ];

  return <RoomForm form={form} fields={fields} onSubmit={onSubmit} />;
};

export default CreateRoomForm;

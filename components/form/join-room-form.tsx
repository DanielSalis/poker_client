import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RoomForm } from "@/components/form/room-form";

const joinRoomSchema = z.object({
  username: z.string().min(1, "Username is required"),
  balance: z.string().min(1, "Balance must be between 0 and 3000"),
  roomId: z.string().min(1, "Room id is required"),
});


const JoinRoomForm = ({ onSubmit, roomId }: any) => {
  const form = useForm({
    resolver: zodResolver(joinRoomSchema),
    defaultValues: {
      roomId: roomId ? roomId : "",
      username: "",
      balance: "1000",
    },
  });

  const fields = [
    { name: "roomId", label: "Room Name", placeholder: "Enter a room name" },
    { name: "username", label: "Username", placeholder: "Enter your username" },
    { name: "balance", label: "Balance", type: "number", placeholder: "1000" },
  ];

  return <RoomForm form={form} fields={fields} onSubmit={onSubmit} />;
};

export default JoinRoomForm;

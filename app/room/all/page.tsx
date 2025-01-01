"use client";

import { usePokerApi } from "@/hooks/usePokerApi";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Frown,
  Loader,
  MoreHorizontal,
  SquareArrowOutUpRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import JoinRoomForm from "@/components/form/join-room-form";

interface Game {
  id: string;
  status: string;
  pot: any;
  created_at: string;
  updated_at: string;
  max_players: number;
  name: string;
  cards: [];
  comunity_cards: [];
  available_cards: [];
  phase: string;
  is_showdown: boolean;
}

const Rooms = () => {
  const router = useRouter();

  const [clickedId, setClickedId] = useState("");

  const getAllGamesApi = usePokerApi<Game[]>();

  const columns: ColumnDef<Game>[] = [
    {
      accessorKey: "id",
      header: "Id",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      accessorKey: "player_count",
      header: "Players in the room",
    },
    {
      accessorKey: "max_players",
      header: "Max Players",
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const game = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(game.id)}
              >
                Copy room ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <DialogTrigger asChild>
                  <div className="flex justify-center items-center">
                    <span onClick={() => setClickedId(game.id)}>Join room</span>
                    <SquareArrowOutUpRight />
                  </div>
                </DialogTrigger>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const fetchGames = async () => {
    await getAllGamesApi.fetchApi("rooms", {
      method: "GET",
    });
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleJoin = async (data: any) => {
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

    const player = await playerCreated.json();

    const playerId = player.id;

    if (playerId) {
      debugger
      await fetch(
        `http://localhost:3000/rooms/${data.roomId}/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            player_id: playerId,
          }),
        }
      )
      .then(async (response)=>{
        debugger
        if (response.ok) {
          router.push(`/room/${data.roomId}`);
        }else {
          await fetch("http://localhost:3000/players/"+playerId, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            }
          });
          const json = await response.json()
          alert(json?.message)
        }
      })
      .catch(async err=>{
        debugger
        await fetch("http://localhost:3000/players/"+playerId, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          }
        });
        alert(err)
      });
    }
  };

  return (
    <div className="w-[100%] h-[100%] flex justify-center items-center">
      {getAllGamesApi.loading ? (
        <Loader />
      ) : getAllGamesApi.data ? (
        <Dialog>
          <DataTable columns={columns} data={getAllGamesApi.data} />
          <DialogContent className="w-[360px] min-h-[640px] flex flex-col justify-start">
            <DialogHeader>
              <DialogTitle>Join game!</DialogTitle>
              <DialogDescription>{clickedId}</DialogDescription>
            </DialogHeader>
            <JoinRoomForm onSubmit={handleJoin} roomId={clickedId} />
          </DialogContent>
        </Dialog>
      ) : (
        <div className="flex items-center">
          <Frown />
          <p>Unfortunately no room started</p>
        </div>
      )}
    </div>
  );
};

export default Rooms;

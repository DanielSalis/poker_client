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
import { MoreHorizontal, SquareArrowOutUpRight } from "lucide-react";
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
    await getAllGamesApi.fetchApi("games", {
      method: "GET",
    });
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleJoin = async (data: any) => {
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

    if (createRoomApi.data?.id) {
      router.push(`room/${createRoomApi.data?.id}`);
    }
  };

  return (
    <div>
      {getAllGamesApi.data && (
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
      )}
    </div>
  );
};

export default Rooms;
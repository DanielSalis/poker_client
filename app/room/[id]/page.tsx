"use client"
import { usePokerApi } from "@/hooks/usePokerApi";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface IRoom {
  data: {
      id: string;
      status: string;
      pot: number | null;
      max_players: number;
      name: string;
      cards: string[];
      comunity_cards: string[];
      available_cards: string[];
      phase: string;
      is_showdown: boolean;
      created_at: string;
      updated_at: string;
  };
  players: IPlayer[];
}

interface IPlayer {
  id: number;
  player_id: string;
  game_id: string;
  chips: number | null;
  status: string;
  hand: string[] | null;
  last_position: number | null;
  bet: number | null;
  last_action: string | null;
  created_at: string;
  updated_at: string;
}

const RoomId = () => {

  const getRoomById = usePokerApi<IRoom>();
  const [room, setRoom] = useState<IRoom | null>();

  const {id} = useParams()

  useEffect(()=> {
    async function fetchRoom (){
      await getRoomById.fetchApi(`rooms/${id}`, {
        method: "GET"
      })
    }
    fetchRoom()
  }, []);

  useEffect(()=>{
    setRoom(getRoomById.data)
  },[getRoomById.data])

   return (
    <div>
      Room {id}
      <p>{room?.players.length}</p>
    </div>
   )
}

export default RoomId;
"use client";

import { usePokerApi } from "@/hooks/usePokerApi";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createConsumer } from "@rails/actioncable";

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
  const [room, setRoom] = useState<IRoom | null>(null);

  const { id } = useParams();

  useEffect(() => {
    async function fetchRoom() {
      await getRoomById.fetchApi(`rooms/${id}`, {
        method: "GET",
      });
    }
    fetchRoom();
  }, [id]);

  useEffect(() => {
    if (getRoomById.data) {
      setRoom(getRoomById.data);
    }
  }, [getRoomById.data]);

  useEffect(() => {
    // Set up ActionCable consumer
    const consumer = createConsumer("ws://localhost:3000/cable");

    const subscription = consumer.subscriptions.create(
      { channel: "GameChannel", game_id: id },
      {
        connected() {
          console.log(`Connected to GameChannel for game ${id}`);
        },
        disconnected() {
          console.log(`Disconnected from GameChannel for game ${id}`);
        },
        received(data: any) {
          console.log("Received data:", data);
          debugger
          if (data.action?.player_id) {
            setRoom((prevRoom) => {
              if (!prevRoom) return null;
              return {
                ...prevRoom,
                players: [...prevRoom.players, data.action],
              };
            });
          }
        },
      }
    );

    // Cleanup on unmount
    return () => {
      subscription.unsubscribe();
      console.log("Unsubscribed from GameChannel");
    };
  }, [id]);

  return (
    <div>
      Room {id}
      <p>Players: {room?.players.length}</p>
      <ul>
        {room?.players.map((player) => (
          <li key={player.id}>
            {player?.player_id || player?.id} - Chips: {player.chips}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoomId;

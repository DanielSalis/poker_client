"use client";

import { usePokerApi } from "@/hooks/usePokerApi";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createConsumer } from "@rails/actioncable";
import "./style.css";
import { Button } from "@/components/ui/button";

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
  username: string
}

const RoomId = () => {
  const getRoomById = usePokerApi<IRoom>();
  const [room, setRoom] = useState<IRoom | null>(null);

  const { id } = useParams();

  async function fetchRoom() {
    await getRoomById.fetchApi(`rooms/${id}`, {
      method: "GET",
    });
  }

  useEffect(() => {
    fetchRoom();
  }, [id]);

  useEffect(() => {
    if (getRoomById.data) {
      setRoom(getRoomById.data);
    }
    console.log(getRoomById.data);
  }, [getRoomById.data]);

  useEffect(() => {
    const player = JSON.parse(sessionStorage.getItem("player") as string);

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
          if (data.action?.name === "join" && data.player_data) {
              fetchRoom()
          } else if (data.action?.name === "delete" && data.action.player_id) {
            setRoom((prevRoom) => {
              if (!prevRoom) return null;
              return {
                ...prevRoom,
                players: prevRoom.players.filter(
                  (player) => player.player_id !== data.action.player_id
                ),
              };
            });
          }
        },
      }
    );

    return () => {
      subscription.unsubscribe();
      console.log("Unsubscribed from GameChannel");
    };
  }, [id, room]);

  useEffect(() => {
    const handleBeforeUnload = async (event: BeforeUnloadEvent) => {
      const player = JSON.parse(sessionStorage.getItem("player") as string);
      if (player) {
        await fetch(`http://localhost:3000/rooms/${id}/leave`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            player_id: player.id,
          }),
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [id, room]);

  const handleAction = async (endpoint: string, method: string = "POST") => {
    const player = JSON.parse(sessionStorage.getItem("player") as string);
    try {
      const response = await fetch(`http://localhost:3000/rooms/${id}/${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({player_id: player.id})
      });

      if (!response.ok) {
        throw new Error(`Failed to call ${endpoint}: ${response.statusText}`);
      }

      console.log(`Success: ${endpoint}`);
    } catch (error) {
      console.error(`Error: ${error}`);
    }
  };

  return (
    <div className="flex flex-col items-center w-[100%] h-[100%] p-8">
      <h1>Room {id}</h1>
      <div className="flex justify-center space-x-4 mb-4">
        {room?.data.status === "waiting" && (
          <Button variant="default" onClick={() => handleAction("start")}>
            Start
          </Button>
        )}
        <Button variant="destructive" onClick={() => handleAction("leave")}>
          Leave
        </Button>
      </div>
      <div className="table">
        <div className="community-cards">
          {room && room.data.comunity_cards.length > 0 ? (
            <>
              {room?.data.comunity_cards.map((card, index) => (
                <span key={index} className="card">
                  {card}
                </span>
              ))}
            </>
          ) : (
            <span>Waiting for game to start</span>
          )}
        </div>

        {room?.players.map((player, index) => (
          <div key={player.id} className={`player player-${index + 1}`}>
            <span>
              {player.username}
            </span>
            <span>
            Chips: {player.chips}
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-center space-x-4 mt-auto">
        <Button
          variant="default"
          onClick={() => handleAction("action", "POST")}
        >
          Check
        </Button>
        <Button
          variant="default"
          onClick={() => handleAction("action", "POST")}
        >
          Raise
        </Button>
        <Button
          variant="secondary"
          onClick={() => handleAction("action", "POST")}
        >
          Fold
        </Button>
      </div>
    </div>
  );
};

export default RoomId;

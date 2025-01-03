"use client";

import { usePokerApi } from "@/hooks/usePokerApi";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createConsumer } from "@rails/actioncable";
import "./style.css";
import { Button } from "@/components/ui/button";
import backimg from "@/public/cards/back.svg";
import Image from "next/image";
import avatar from "animal-avatar-generator";
import {
  CircleDollarSign,
  DollarSign,
  Wallet,
  WalletMinimal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  username: string;
}

const getCardSvgPath = (card: string): string => {
  return `/cards/${card}.svg`;
};

const RoomId = () => {
  const sessionPlayer = JSON.parse(sessionStorage.getItem("player") as string);
  const getRoomById = usePokerApi<IRoom>();
  const [room, setRoom] = useState<IRoom | null>(null);
  const avatarRef = useRef<HTMLDivElement | null>(null);
  const [playerTurn, setPlayerTurn] = useState<IPlayer | null>();

  const { id } = useParams();

  async function fetchRoom() {
    await getRoomById.fetchApi(`rooms/${id}`, {
      method: "GET",
    });
  }

  const generateAvatar = (seed: string) => {
    const svg = avatar(seed, { size: 65 });
    return (
      <div
        className="z-10 ml-[-35px]"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
  };

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
    if (room?.players) {
      const result = room.players.find((player) => player.last_action == null);
      if(result === undefined || result === null){
         handleGameControl("next-phase", "POST")
         return
      }
      setPlayerTurn(result === undefined ? null : result);
    }
  }, [room]);

  useEffect(() => {
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
            fetchRoom();
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
          } else if (data.action?.name === "action" && data.action.player_id){
            console.log("action");

          }
           else {
            fetchRoom();
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
      if (sessionPlayer) {
        await fetch(`http://localhost:3000/rooms/${id}/leave`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            player_id: sessionPlayer.id,
          }),
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [id, room]);

  const handleGameControl = async (
    endpoint: string,
    method: string = "POST"
  ) => {
    try {
      const response = await fetch(
        `http://localhost:3000/rooms/${id}/${endpoint}`,
        {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ player_id: sessionPlayer.id }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to call ${endpoint}: ${response.statusText}`);
      }

      console.log(`Success: ${endpoint}`);
    } catch (error) {
      console.error(`Error: ${error}`);
    }
  };

  const handleGameAction = async (
    endpoint: string,
    method: string = "POST",
    action_type: string,
    amount: number
  ) => {
    try {
      const response = await fetch(
        `http://localhost:3000/rooms/${id}/${endpoint}`,
        {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            player_id: sessionPlayer.id,
            action_type,
            amount,
          }),
        }
      );

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
      <h1>
        Room {id} - Next Phase: {room?.data.phase}
      </h1>
      <div className="flex justify-center space-x-4 mb-4 mt-4">
        {room?.data.status === "waiting" && (
          <Button variant="default" onClick={async () => {
            await handleGameControl("start")
            await handleGameControl("next-phase", "POST")
          }}>
            Start
          </Button>
        )}
        <Button
          variant="destructive"
          onClick={() => handleGameControl("leave")}
        >
          Leave
        </Button>
        <Button
          variant="default"
          className=" bg-amber-400"
          onClick={() => handleGameControl("next-phase", "POST")}
        >
          next-phase(experimental)
        </Button>
      </div>
      <div className="table">
        <div className="community-cards">
          {room && room.data.comunity_cards.length > 0 ? (
            <>
              {room?.data.comunity_cards.map((card, index) => (
                <Image
                  key={index + card}
                  src={getCardSvgPath(card)}
                  alt={`Card image ${card}`}
                  width={60}
                  height={80}
                />
              ))}
            </>
          ) : (
            Array.from({ length: 5 }).map((_, index) => (
              <Image
                key={index}
                src={getCardSvgPath("back")}
                alt={`Card back ${index + 1}`}
                width={60}
                height={80}
              />
            ))
          )}
        </div>

        {room?.players.map((player, index) => (
          <div key={player.player_id} className={`player player-${index + 1}`}>
            <div className="flex justify-center items-center">
              {player.hand &&
                player.hand.map((card, index) => {
                  if (player.player_id === sessionPlayer.id) {
                    return (
                      <Image
                        key={player.id + index + card}
                        src={getCardSvgPath(card)}
                        alt={`playerCard image ${card}`}
                        width={40}
                        height={60}
                      />
                    );
                  } else {
                    return (
                      <Image
                        key={player.id + index + card}
                        src={getCardSvgPath("back")}
                        alt={`playerCard image ${card}`}
                        width={40}
                        height={60}
                      />
                    );
                  }
                })}
            </div>
            <div className="flex justify-center items-center mt-[-25px]">
              {generateAvatar(player.username)}
              <div className="flex flex-col justify-center items-start bg-stone-200 pl-4 pr-1 ml-[-12px] z-0 rounded-md min-w-20">
                <span>{player.username}</span>
                <span className="flex justify-center items-center">
                  <DollarSign size={12} /> {player.chips}
                </span>
              </div>
            </div>
            {playerTurn && playerTurn.player_id === player.player_id && (
              <Badge className=" bg-red-400 mt-[-12px]">playing</Badge>
            )}
            {playerTurn && playerTurn.player_id !== player.player_id && player.last_action &&
              (
                <Badge className=" bg-green-300 mt-[-12px]">{player.last_action}</Badge>
              )
            }
          </div>
        ))}
      </div>

      {room?.data.status !== "waiting" && sessionPlayer.id === playerTurn?.player_id && (
        <div className="flex justify-center space-x-4 mt-auto w-[100%] ">
          <Button
            variant="default"
            onClick={() => handleGameAction("action", "POST", "check", 0)}
          >
            Check
          </Button>
          <Button
            variant="default"
            onClick={() => handleGameAction("action", "POST", "raise", 100)}
          >
            Raise (100)
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleGameAction("action", "POST", "fold", 0)}
          >
            Fold
          </Button>
        </div>
      )}
    </div>
  );
};

export default RoomId;

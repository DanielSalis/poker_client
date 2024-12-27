
const RoomId = async ({params}: {
  params: Promise<{id: string}>
}) => {
  const roomId = (await params).id
   return (
    <div>Room {roomId}</div>
   )
}

export default RoomId;
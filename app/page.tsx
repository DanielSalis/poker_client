import Image from "next/image";
import background from "./background.png"

export default function Home() {
  return (
    <div className=" w-[100%] h-[100%] flex flex-col justify-center items-center" style={{
      backgroundImage: `url(${background.src})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      }}>
      <div className=" bg-red-600 w-100 h-100">
        teste
      </div>
    </div>
  );
}

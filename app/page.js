import ObjectDetection from "@/components/object-detection";

export default function Home() {
  return (
    <main 
  className="w-full h-screen flex flex-col items-center justify-center p-8 
             bg-gradient-to-br from-blue-400 via-indigo-300 to-violet-200 text-white"
>
  <h1 className=" font-extrabold text-3xl md:text-6xl lg:text-8xl tracking-tighter">
    Object Detection
  </h1>

  {/* Flex container for webcam & image */}
  <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-6">
    {/* Webcam & Detection */}
    <div className="relative">
      <ObjectDetection /> 
    </div>

   
    <img 
      src="\back.png" 
      alt="Reference"
      className="w-[680px] h-[440px] rounded-md object-cove items-right ml-15" 
    />
  </div>
</main>

  

  );
}

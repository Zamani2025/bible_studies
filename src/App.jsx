import { LuCircleStop, LuAudioLines } from "react-icons/lu";
import { IoIosMic } from "react-icons/io";
import { IoPauseOutline } from "react-icons/io5";
import { AiOutlineAudioMuted } from "react-icons/ai";
import { useState } from "react";
import axios from "axios";

function App() {
  const [quotation, setQuotation] = useState("");
  const [bibleReference, setBibleReference] = useState("");
  const [bibleVersion, setBibleVersion] = useState("ESV");
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioState, setAudioState] = useState("idle"); // idle, listening, paused

  const handleButtonClick = async () => {
    if (audioState === "idle") {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = async (event) => {
        if (audioState !== "paused") {
          const audioBlob = event.data;
  
          // Create FormData and append the audio Blob
          const formData = new FormData();
          formData.append("audio", audioBlob, "recording.webm"); // Use webm format
  
          try {
            const response = await axios.post(
              "http://localhost:5000/stream-audio",
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data", // Set the correct header
                },
              }
            );
            setBibleReference(response.data.reference);
            setQuotation(response.data.verse);
            setBibleVersion(response.data.version);
          } catch (error) {
            console.error("Error:", error);
          }
        }
      };
      recorder.start(1000); // Start recording in chunks
      setMediaRecorder(recorder);
      setAudioState("listening");
    } else if (audioState === "listening") {
      mediaRecorder.pause();
      setAudioState("paused");
    } else if (audioState === "paused") {
      mediaRecorder.resume();
      setAudioState("listening");
    }
  };
  
  
  

  const stopListening = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setAudioState("idle");
    }
  };

  return (
    <section className="flex flex-col items-center justify-between h-screen w-[100%] sm:pt-6 lg:py-6">
      <h4 className="text-2xl font-bold">VerseCatch</h4>

      <div className="flex px-4 flex-col items-center justify-center lg:w-[50%] text-center">
        <h1 className="lg:text-3xl text-2xl font-bold">
          {bibleReference || "Romans 11:36"} ({bibleVersion})
        </h1>
        <p className="lg:text-2xl pt-4">
          {quotation ||
            "We all know that in all things, God works for the good of those who love him, even as he also loved the world, so that he could create for himself a new creation for those who believe in his Son."}
        </p>
      </div>

      <div className="flex flex-col items-center justify-center w-[100%] lg:w-[45%] bg-gray-100 lg:rounded-lg pb-4 lg:py-4">
        <div className="lg:hidden block w-[20%] mb-4 mt-1 h-1 rounded-lg bg-gray-200"></div>
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
          {audioState === "listening" ? (
            <LuAudioLines className="text-2xl text-gray-600" />
          ) : audioState === "paused" ? (
            <IoPauseOutline className="text-2xl text-gray-600" />
          ) : (
            <LuCircleStop className="text-2xl text-gray-600" />
          )}
        </div>
        <div className="lg:w-[40%] w-[55%] text-center mt-2">
          <p>Transcribing and detecting Bible quotations in real time</p>
        </div>
        <div
          onClick={handleButtonClick}
          className={`lg:w-[30%] cursor-pointer w-[50%] flex gap-2 items-center justify-center text-center mt-4 h-10 ${
            audioState === "listening"
              ? "bg-red-300 text-red-600"
              : "bg-black text-white"
          } rounded-full`}
        >
          {audioState === "listening" || audioState === "paused" ? (
            <AiOutlineAudioMuted />
          ) : (
            <IoIosMic />
          )}
          <p className="text-sm">
            {audioState === "listening"
              ? "Stop listening"
              : audioState === "paused"
              ? "Continue listening"
              : "Start listening"}
          </p>
        </div>
      </div>
    </section>
  );
}

export default App;

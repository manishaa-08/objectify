"use client";
import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { load as cocoSSDLoad } from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";
import { renderPrediction } from "@/utils/render-prediction";



const videoConstraints = {
  width: 640,
  height: 480,
  facingMode: "user",
};

let detectInterval;

const ObjectDetection = () => {
  const [isLoading, setIsLoading] = useState(true);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const showMyVideo = () => {
    if (
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const myVideoWidth = webcamRef.current.video.videoWidth;
      const myVideoHeight = webcamRef.current.video.videoHeight;

      webcamRef.current.video.width = myVideoWidth;
      webcamRef.current.video.height = myVideoHeight;
    }
  };

  const runCoco = async () => {
    setIsLoading(true);
    const net = await cocoSSDLoad();
    setIsLoading(false);

    detectInterval = setInterval(() => {
      runObjectDetection(net);
    }, 100);
  };

  async function runObjectDetection(net) {
    if (
      canvasRef.current && 
      webcamRef.current !== null &&
      webcamRef.current.video?.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Detect objects
      const objects = await net.detect(webcamRef.current.video, undefined, 0.6);

      
      renderPrediction(objects, ctx);  
    }
  }

  useEffect(() => {
    runCoco();
    showMyVideo();
    return () => clearInterval(detectInterval);
  }, []);

  return (
    <div className="mt-8">
      {isLoading ? (
        <div className="gradient-text">Loading AI Model...</div>
      ) : (
        <div className="relative flex justify-center items-center gradient p-1.5 rounded-md">
          {/* Webcam Component */}
          <Webcam
            ref={webcamRef}
            className="rounded-md w-full lg:h-[720px]"
            muted
            videoConstraints={videoConstraints}
          />
          {/* Canvas Component */}
          <canvas
            ref={canvasRef} 
            className="absolute top-0 left-0 z-10 w-full lg:h-[720px]"
          />
        </div>
      )}
    </div>
  );
};

export default ObjectDetection;

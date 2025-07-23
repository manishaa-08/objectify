"use client";
import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { load as cocoSSDLoad } from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";
import { renderPrediction } from "@/utils/render-prediction";
import dayjs from "dayjs";



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
  const [detectionHistory, setDetectionHistory] = useState([]);
  const lastLoggedRef = useRef({}); // To avoid flooding log with same object every frame
  const [objectCounts, setObjectCounts] = useState({}); // For live object statistics

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

      // Count each object type in the current frame
      const counts = {};
      objects.forEach(obj => {
        counts[obj.class] = (counts[obj.class] || 0) + 1;
      });
      setObjectCounts(counts);

      // Log detections with timestamp, avoid flooding
      const now = dayjs();
      const newLogs = [];
      const labelMap = {};
      objects.forEach(obj => {
        // Only log if not logged in last 1s
        if (!lastLoggedRef.current[obj.class] || now.diff(lastLoggedRef.current[obj.class], 'second') > 0) {
          newLogs.push({
            class: obj.class,
            time: now.format('HH:mm:ss'),
          });
          lastLoggedRef.current[obj.class] = now;
        }
        // For overlay: map label to time
        labelMap[obj.class] = now.format('HH:mm:ss');
      });
      if (newLogs.length > 0) {
        setDetectionHistory(prev => [...prev, ...newLogs]);
      }

      // Draw predictions with time label
      objects.forEach(obj => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.font = '18px Arial';
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(obj.bbox[0], obj.bbox[1] - 28, ctx.measureText(`${obj.class} @ ${labelMap[obj.class]}`).width + 12, 28);
        ctx.fillStyle = '#fff';
        ctx.fillText(`${obj.class} @ ${labelMap[obj.class]}`, obj.bbox[0] + 6, obj.bbox[1] - 8);
      });

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
        <>
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
        {/* Object Statistics Panel */}
        <div className="mb-4 p-3 bg-white bg-opacity-90 rounded shadow border border-gray-200 flex flex-wrap gap-4">
          <h3 className="font-bold mr-4">Live Object Counts:</h3>
          {Object.keys(objectCounts).length === 0 ? (
            <span className="text-gray-500">No objects detected</span>
          ) : (
            Object.entries(objectCounts).map(([type, count]) => (
              <span key={type} className="px-2 py-1 rounded bg-blue-100 text-blue-800 font-semibold">
                {count} {type}{count > 1 ? 's' : ''}
              </span>
            ))
          )}
        </div>
        {/* End Object Statistics Panel */}
        {/* Detection History Timeline */}
        <div className="mt-6 max-h-60 overflow-y-auto bg-white bg-opacity-80 rounded p-4 shadow border border-gray-200">
          <h3 className="font-bold mb-2">Detection History</h3>
          {detectionHistory.length === 0 ? (
            <div className="text-gray-500">No detections yet.</div>
          ) : (
            <ul className="space-y-1 text-sm">
              {detectionHistory.map((log, idx) => (
                <li key={idx} className="flex justify-between text-black">
                  <span>{`${log.class} detected at ${log.time}`}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        </>
      )}
    </div>
  );
};

export default ObjectDetection;

import { throttle } from "lodash";

export const renderPrediction = (predictions, ctx) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); 

  const font = "16px sans-serif";
  ctx.font = font;
  ctx.textBaseline = "top";

  let bottleDetected = false;

  predictions.forEach((prediction) => { 
    const [x, y, width, height] = prediction["bbox"];
    const isBottle = prediction.class === "bottle";

    // Draw bounding box
    ctx.strokeStyle = isBottle ? "#FF0000" : "#00FFFF";
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, width, height); 

    // Fill the color
    ctx.fillStyle = `rgb(255, 0, 0, ${isBottle ? 0.2 : 0})`;
    ctx.fillRect(x, y, width, height);

    // Draw label background
    ctx.fillStyle = isBottle ? "#FF0000" : "#00FFFF";
    const textWidth = ctx.measureText(prediction.class).width;
    const textHeight = parseInt(font, 10); 
    ctx.fillRect(x, y, textWidth + 4, textHeight + 4);

    // Text color and label
    ctx.fillStyle = "#000000";
    ctx.fillText(prediction.class, x, y);

    if (isBottle) {
      bottleDetected = true;
    }
  });

  // Play audio only once per frame if any bottle was detected
  if (bottleDetected) {
    playAudio();
  }
};

const playAudio = throttle(() => {
  const audio = new Audio("/alert.mp3");
  audio.play();
}, 2000); // Only once every 2 seconds

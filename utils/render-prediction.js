import { throttle } from "lodash";

export const renderPrediction = (predictions, ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); 
  
    // Font
    const font = "16px sans-serif";
    ctx.font = font;
    ctx.textBaseline = "top";
  
    predictions.forEach((prediction) => { 
      const [x, y, width, height] = prediction["bbox"];
  
      const isPerson = prediction.class === "person";
      // Bounding box
      ctx.strokeStyle = isPerson ? "#FF0000" : "#00FFFF";
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, width, height); 
  
      // Fill the color
      ctx.fillStyle = `rgb(255, 0, 0, ${isPerson ? 0.2 : 0})`;
      ctx.fillRect(x, y, width, height);
  
      // Draw label background
      ctx.fillStyle = isPerson ? "#FF0000" : "#00FFFF";
      const textWidth = ctx.measureText(prediction.class).width;
      const textHeight = parseInt(font, 10); 
      ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
  
      // Text color and label
      ctx.fillStyle = "#000000";
      ctx.fillText(prediction.class, x, y);

      if (isPerson) {
        playAudio();
      }
    });
  };

  
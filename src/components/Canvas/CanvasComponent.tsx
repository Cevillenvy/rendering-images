import React, { useState, useRef } from "react";
import "./CanvasComponent.css";

const ImageSizeComponent: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>(
      {
        width: 0,
        height: 0,
      }
  );
  const [error, setError] = useState<string | null>(null);
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  const [hoveredPixelCoordinates, setHoveredPixelCoordinates] = useState<{ x: number; y: number } | null>(null);
  const [clickedPixelCoordinates, setClickedPixelCoordinates] = useState<{ x: number; y: number } | null>(null);
  const [isHoveringCanvas, setIsHoveringCanvas] = useState<boolean>(false);
  const [lastClickedColor, setLastClickedColor] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWidth = 400;
  const canvasHeight = 300;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setImageUrl(value);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      setImageUrl(result);
    };
  };

  const handleImageLoad = () => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = imageUrl;
    image.onload = () => {
      setImageSize({ width: image.width, height: image.height });
      drawImageToCanvas(image);
    };
    image.onerror = () => {
      setError("Failed to load image");
    };
  };

  const drawImageToCanvas = (image: HTMLImageElement) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    const aspectRatio = image.width / image.height;
    let newWidth = canvasWidth;
    let newHeight = canvasWidth / aspectRatio;

    if (newHeight > canvasHeight) {
      newHeight = canvasHeight;
      newWidth = canvasHeight * aspectRatio;
    }

    const xOffset = (canvasWidth - newWidth) / 2;
    const yOffset = (canvasHeight - newHeight) / 2;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    context.drawImage(image, xOffset, yOffset, newWidth, newHeight);

    canvas.addEventListener("mousemove", handleCanvasMouseMove);
    canvas.addEventListener("mouseleave", handleCanvasMouseLeave);
    canvas.addEventListener("mouseenter", handleCanvasMouseEnter);
    canvas.addEventListener("click", handleCanvasMouseClick);
  };

  const handleCanvasMouseMove = (event: MouseEvent) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    try {
      const pixel = context.getImageData(x, y, 1, 1).data;
      const color = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
      setHoveredColor(color);
      setHoveredPixelCoordinates({ x, y });
    } catch (error) {
      console.error("Failed to get pixel data:", error);
    }
  };

  const handleCanvasMouseClick = (event: MouseEvent) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    try {
      const pixel = context.getImageData(x, y, 1, 1).data;
      const color = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
      setClickedPixelCoordinates({ x, y });
      setLastClickedColor(color);
    } catch (error) {
      console.error("Failed to get pixel data:", error);
    }
  };

  const handleCanvasMouseLeave = () => {
    setIsHoveringCanvas(false);
  };

  const handleCanvasMouseEnter = () => {
    setIsHoveringCanvas(true);
  };

  return (
      <div className="form">
        <div className="form__link">
          <input
              className="form__input-file"
              type="text"
              placeholder="Enter image URL"
              value={imageUrl}
              onChange={handleInputChange}
          />
          <input
              className="form__input-file"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
          />
          <button onClick={handleImageLoad} className="form__btn-link">
            Загрузить изображение
          </button>
        </div>

        {error && <div>{error}</div>}
        {imageSize.width > 0 && imageSize.height > 0 && (
            <div className={'image__size'}>
              <p>Размер исходного изображения:</p>
              <p>Ширина: {imageSize.width}</p>
              <p>Высота: {imageSize.height}</p>
            </div>
        )}
        <canvas
            ref={canvasRef}
            style={{width: `${canvasWidth}px`, height: `${canvasHeight}px`}}
        />

        {(isHoveringCanvas || lastClickedColor) && (
          <div className="hover__color">
            {hoveredColor && (
                <>
                  <div
                      style={{
                        width: "20px",
                        height: "20px",
                        backgroundColor: hoveredColor,
                      }}
                  />
                  <p>Наведенный цвет: {hoveredColor}</p>
                  {hoveredPixelCoordinates && (
                      <p>
                        Координаты: X: {hoveredPixelCoordinates.x},Y: {hoveredPixelCoordinates.y}
                      </p>
                  )}
                </>
            )}
            {lastClickedColor && (
                <>
                  <p>Выбранный цвет: {lastClickedColor}</p>
                  <div
                      style={{
                        width: "20px",
                        height: "20px",
                        backgroundColor: lastClickedColor,
                      }}
                  />
                  {clickedPixelCoordinates && (
                      <p>
                        Координаты: X: {clickedPixelCoordinates.x},Y: {clickedPixelCoordinates.y}
                      </p>
                  )}
                </>
            )}
          </div>
        )}
      </div>
  );
};

export default ImageSizeComponent;

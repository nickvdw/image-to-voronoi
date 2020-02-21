/**
 * Computes centroids from greyScale imageData using a threshold
 * Inverting the threshold 'flips' the >= operator
 * The centroids are drawn on a canvas in red, and stored in a variable
 * */
export const computeCentroidsFromGreyScale = (
  imageData,
  threshold, // value between 0 and 1
  inverseThreshold = false, // Use >= or <= operator for threshold check
  densityX = 0, // Positive integer value which skips pixels in X direction if a centroid is found
  densityY = 0 // Positive integer value which skips pixels in Y direction if a centroid is found
) => {
  const centroids = [];

  // imageData.data is a flat array of RGB values so we iterate with += 4
  let lastY = 0;
  for (let i = 0; i < imageData.data.length; i += 4) {
    const currentX = (i / 4) % imageData.width;
    const currentY = Math.floor(i / 4 / imageData.width);
    const centroid = { x: currentX, y: currentY };
    // Create a centroid for each pixel that passes the threshold test
    if (inverseThreshold) {
      if (imageData.data[i] / 255 <= 1 - threshold) {
        centroids.push(centroid);

        // Set the pixel of the centroid to red for testing purposes
        imageData.data[i] = 255;
        imageData.data[i + 1] = 100;
        imageData.data[i + 2] = 100;
      }
    } else if (imageData.data[i] / 255 >= threshold) {
      centroids.push(centroid);

      // Set the pixel of the centroid to red for testing purposes
      imageData.data[i] = 255;
      imageData.data[i + 1] = 100;
      imageData.data[i + 2] = 100;
    }

    // If we entered the next row
    if (currentY > lastY) {
      // Skip densityY pixels in vertical direction
      i += 4 * imageData.width * (densityY - 1);
      lastY = Math.floor(i / 4 / imageData.width);
    }

    // Skip densityX pixels in horizontal direction
    // The -1 offsets the addition to i in the loop iteration
    densityX > 0 && (i += 4 * (densityX - 1));
  }
  return centroids;
};

/**
 * Greyscales the given image, expects imageData from a Canvas context
 * */
export const greyScaleImage = imageData => {
  // imageData.data is a flat array of RGB values so we iterate with += 4
  for (let i = 0; i < imageData.data.length; i += 4) {
    // Get average of RGB values
    const avg =
      (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
    imageData.data[i] = avg;
    imageData.data[i + 1] = avg;
    imageData.data[i + 2] = avg;
  }
  return imageData;
};

export const colorCentroidsByCoordinates = (imageData, centroids) => {
  return centroids.map(centroid => {
    const imageDataIndex = centroid.y * 4 * imageData.width + centroid.x * 4;

    // Retrieve color from coordinates
    centroid.color = [
      imageData.data[imageDataIndex],
      imageData.data[imageDataIndex + 1],
      imageData.data[imageDataIndex + 2]
    ];

    return centroid;
  });
};

/**
 * Uses the FileReader API to read the file Input
 * The read image is drawn onto a canvas from which we can get image data per pixel
 * */
export const uploadImage = image => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("CANVAS");
    const context = canvas.getContext("2d");
    const reader = new FileReader();

    // Image is interpreted as a data url and painted on a canvas
    reader.onload = event => {
      const image = new Image();

      // Sets image source to the read data url
      image.src = event.target.result;

      // Draw the image onto the canvas so we can retrieve pixel data
      image.addEventListener("load", () => {
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0);
        const imageData = context.getImageData(0, 0, image.width, image.height);
        resolve(imageData);
      });

      image.onerror = reject;
    };

    // Only use the image when there is an actual image
    image && reader.readAsDataURL(image);
  });
};

export const toImageDataUrl = imageData => {
  const canvas = document.createElement("CANVAS");
  const context = canvas.getContext("2d");
  const imageDataObject = context.createImageData(
    imageData.width,
    imageData.height,
    imageData.data
  );
  // Draw the imageData on the canvas
  context.putImageData(
    imageDataObject,
    0,
    0,
    0,
    0,
    imageDataObject.width,
    imageDataObject.height
  );
  // Defaults to png
  return canvas.toDataURL();
};

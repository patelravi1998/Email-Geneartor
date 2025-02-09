// src/services/UserService.ts

import { Ceritificate } from "../entities";
import { ApiError } from "../middleware/errors";
// import logger from '../utils/logger';
import axios from "axios";
import fs from "fs";
import path from "path";
import { createCanvas, loadImage, registerFont } from "canvas";
import PublicService from "../services/PublicService";

export class UserService {
  async generateUserCertificate(
    mobile: string,
    name: string,
    designation: string
  ) {
    const certificateSession = await Ceritificate.findOne({
      where: { mobile: mobile },
    });

    if (!certificateSession) {
      //Generate Certificate

      const img =
        "https://almondvirtex.s3.ap-south-1.amazonaws.com/channel_champions/ChannelChampions.jpg";

      const templateImagePath = img;
      const outputPath = path.join(
        __dirname,
        "certificates",
        `certificate_${name}.png`
      );

      // Ensure the certificates directory exists
      const pdfDirectory = path.join(__dirname, "certificates");
      if (!fs.existsSync(pdfDirectory)) {
        fs.mkdirSync(pdfDirectory, { recursive: true });
      }

      try {
        // Register the appropriate font based on language
        let fontFamily = "";
        let fontFilePath = "";

        fontFilePath = path.join(__dirname, "fonts", "english.ttf");
        fontFamily = "EnglishFont";

        // Check if the font file exists
        if (!fs.existsSync(fontFilePath)) {
          console.warn(`Font file not found: ${fontFilePath}`);
        } else {
          console.log(
            `>>>>>eeeeeeeeeeeee-- fontFilePath ${fontFilePath} fontFamily ${fontFamily}`
          );

          // Register the font
          try {
            await registerFont(fontFilePath, { family: fontFamily });
            console.log(`Font "${fontFamily}" registered successfully.`);
          } catch (error) {
            console.error(`Failed to register font "${fontFamily}".`, error);
          }
        }

        // Load the template image
        const templateImage = await loadImage(templateImagePath);

        // Create the canvas
        const canvas = createCanvas(templateImage.width, templateImage.height);
        const ctx = canvas.getContext("2d");

        // Draw the template image onto the canvas
        ctx.drawImage(templateImage, 0, 0);

        // Set font and color for text
        ctx.font = `28px ${fontFamily}`;
        ctx.fillStyle = "#000000";

        // Calculate center X for name and selfie placement
        const canvasCenterX = canvas.width / 2;

        // Load and draw the selfie image
        // const selfieImage = await loadImage(img);
        // const selfieWidth = 100;
        // const selfieHeight = 100;
        // const selfieX = canvasCenterX + 160 - selfieWidth / 2;
        // const selfieY = 180; // Adjust as needed
        // ctx.drawImage(selfieImage, selfieX, selfieY, selfieWidth, selfieHeight);

        // Draw the user's name below the selfie
        // // Measure the width of the name text
        // const nameTextWidth = ctx.measureText(dynamicName).width;

        // // Adjust X coordinate to place the name slightly to the left of the selfie
        // const nameX = selfieX - nameTextWidth - 50; // 10px padding from the left edge of the selfie

        // // Adjust Y coordinate to place the name slightly above the selfie
        // const nameY = (selfieY + selfieHeight / 2)+ 30; // Centered vertically with respect to the selfie

        // // Draw the name at the new position
        // ctx.fillText(dynamicName, nameX, nameY);

        const boxX = 60; // X-coordinate of the top-left corner of the box
        const boxY = 300; // Y-coordinate of the top-left corner of the box
        const boxWidth = 450; // Width of the box
        const boxHeight = 60; // Height of the box

        // Draw the box border for testing
        // ctx.strokeStyle = "black"; // Border color
        // ctx.lineWidth = 2; // Border thickness
        // ctx.strokeRect(boxX, boxY, boxWidth, boxHeight); // Draw the border

        // Measure the width of the text
        const nameTextWidth = ctx.measureText(name).width;
        const nameTextHeight = parseInt(ctx.font, 10); // Extract font size from the font string

        // Calculate X and Y coordinates for centered text
        const nameX = boxX + (boxWidth - nameTextWidth) / 2; // Center horizontally
        const nameY = boxY + (boxHeight + nameTextHeight) / 2; // Center vertically

        // Set text alignment and draw the text
        ctx.textAlign = "center"; // Keep left alignment since we're calculating coordinates manually
        ctx.textBaseline = "middle"; // Align text vertically by the middle of the font

        // Draw the text at the centered position
        ctx.fillText(name, nameX, nameY);
        console.log("coming here");

        const imageBuffer = canvas.toBuffer("image/png");
        // Save the canvas to a file
        // await new Promise((resolve, reject) => {
        //   const out = fs.createWriteStream(outputPath);
        //   const stream = canvas.createPNGStream();
        //   stream.pipe(out);
        //   out.on("finish", () => resolve);
        //   out.on("error", reject);
        // });
        console.log("coming here 2");
        console.log(`Certificate saved at ${outputPath}`);

        // Upload the certificate to S3
        // const rawData = fs.readFileSync(outputPath);
        const imgKey = `certificates/${Date.now()}_certificate_${name}.png`;
        const resultFromUploadToS3 = await PublicService.uploadToS3(
          imageBuffer,
          `certificate_${name}.png`,
          imgKey
        );

        if (!resultFromUploadToS3) {
          throw new ApiError(
            500,
            500,
            "Something went wrong while uploading the certificate to S3"
          );
        }

        // Save the certificate URL to the session
        let certificateSession = new Ceritificate();
        certificateSession.name = name;
        certificateSession.mobile = mobile;
        certificateSession.designation = designation;
        certificateSession.certificate = resultFromUploadToS3.Location;
        await certificateSession.save();

        // // Remove the local file
        // fs.unlinkSync(outputPath);

        return resultFromUploadToS3.Location;
      } catch (error) {
        console.error("Error generating certificate:", error);
        throw new ApiError(
          500,
          500,
          "An error occurred while generating the certificate"
        );
      }
    } else {
      console.log("coming here");
      return certificateSession.certificate;
    }
  }
  async whatsaAppMessageSent(mobile: string, name: string, link: string) {
    console.log(link);
    const data = {
      project_id: "6482c4adda0e29b69bfec072",
      admin_id: "6482c4e0da0e29b69bfec079",
      raw_template: {
        name: "channel_champions_workshop",
        parameter_format: "POSITIONAL",
        components: [
          {
            type: "HEADER",
            format: "IMAGE",
            example: {
              header_handle: [
                "https://scontent.whatsapp.net/v/t61.29466-34/473397448_1120493159759484_7416428200470976260_n.jpg?ccb=1-7&_nc_sid=8b1bef&_nc_ohc=VixOX9D3FO4Q7kNvgFsooxC&_nc_oc=AdhUjbf5gxabhVgFeOjyaufFNrHYtC2DG9pWE58WoMHilIHHIa7XMdfSl2Y0kfdosBk&_nc_zt=3&_nc_ht=scontent.whatsapp.net&edm=AH51TzQEAAAA&_nc_gid=AaqWwvANpvvj6MyNkOr-1x7&oh=01_Q5AaIOY0l3pBcZAJ__UQhDwrfF2vaWzuTcLdPEusAOfcmD9A&oe=67CEAFC7",
              ],
            },
          },
          {
            type: "BODY",
            text: "Dear {{1}}\n\nThank you for attending Channel Champions Workshop with Almonds Ai on 9th Feb’2025. Click to download your certificate of participation.",
            example: {
              body_text: [["Shriyansh"]],
            },
          },
          {
            type: "FOOTER",
            text: "Team - Almonds Ai",
          },
        ],
        language: "en",
        status: "APPROVED",
        category: "UTILITY",
        id: "1120408653101268",
      },
      number: mobile,
      body: {
        "1": name,
        image: link,
      },
      language: "english",
    };

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://communicationapi2.almond.solutions/api/v1/message/process",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer zTHWyD37TX4hnsBDvT8hXSK5aWWLRwI0",
      },
      data: JSON.stringify(data),
    };

    axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
      })
      .catch((error) => {
        console.log(error);
      });
    return true;
  }
}

// Export a singleton instance if desired
export default new UserService();

export default {
  async fetch(request) {
    try {
      const contentType = request.headers.get("content-type") || "";
      
      if (contentType.includes("multipart/form-data")) {
        const form = await request.formData();
        const videoFile = form.get("video");
        const audioFile = form.get("audio");
        const format = form.get("format") || "mp4";

        if (!videoFile || !audioFile) {
          return new Response("Missing video or audio file", { status: 400 });
        }

        const { FFmpeg } = await import("@ffmpeg/ffmpeg");
        const ffmpeg = new FFmpeg();

        await ffmpeg.load();

      
        await ffmpeg.writeFile("input.mp4", await videoFile.arrayBuffer());
        await ffmpeg.writeFile("audio.mp3", await audioFile.arrayBuffer());

        // 
        await ffmpeg.exec([
          "-i", "input.mp4",
          "-i", "audio.mp3",
          "-c:v", "copy",
          "-c:a", "aac",
          "output." + format
        ]);

        //
        const output = await ffmpeg.readFile("output." + format);

        return new Response(output, {
          headers: {
            "Content-Type": "video/mp4"
          }
        });
      }

      return new Response("Send video + audio via POST FormData");
    } catch (err) {
      return new Response("Error: " + err.message, { status: 500 });
    }
  }
};

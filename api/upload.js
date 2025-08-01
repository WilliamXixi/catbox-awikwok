export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const busboy = require('busboy');
  const BB = busboy({ headers: req.headers });

  let imageBuffer;
  let filename;

  BB.on('file', (_, file, info) => {
    filename = info.filename;
    const buffers = [];
    file.on('data', (data) => buffers.push(data));
    file.on('end', () => {
      imageBuffer = Buffer.concat(buffers);
    });
  });

  BB.on('finish', async () => {
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', new Blob([imageBuffer]), filename);

    try {
      const response = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: formData
      });
      const text = await response.text();
      if (text.startsWith('https://')) {
        res.status(200).json({ link: text });
      } else {
        res.status(500).json({ error: text });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  req.pipe(BB);
}

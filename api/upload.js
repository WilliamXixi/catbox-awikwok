import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new formidable.IncomingForm({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err || !files.image) {
      return res.status(500).json({ error: 'File parsing failed' });
    }

    const file = fs.createReadStream(files.image.filepath);
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', file);

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
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
}

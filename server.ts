import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API ROUTE: /api/save
  app.post('/api/save', async (req, res) => {
    try {
      const { password, content, windowsData, changedEntryTitle, verifyOnly } = req.body;

      // 1. Password comparison
      const expectedPassword = process.env.ADMIN_PASSWORD || 'admin';
      if (password !== expectedPassword) {
        return res.status(401).json({ error: 'Invalid admin password' });
      }

      // If just verifying password (e.g., during unlock screen)
      if (verifyOnly) {
        return res.json({ success: true, message: 'Password verified' });
      }

      // 2. Validate payload
      const rawData = content || windowsData || req.body;
      let windowsArray: any[] | null = null;

      if (Array.isArray(rawData)) {
        windowsArray = rawData;
      } else if (rawData && typeof rawData === 'object' && Array.isArray(rawData.windows)) {
        windowsArray = rawData.windows;
      }

      if (!windowsArray) {
        return res.status(400).json({ error: 'Invalid payload: must contain a windows array' });
      }

      const fullJsonObj = { windows: windowsArray };
      const formattedJson = JSON.stringify(fullJsonObj, null, 2);

      // 3. Always update local disk file first if possible
      const localFilePath = path.join(process.cwd(), 'src/data/windows.json');
      try {
        fs.writeFileSync(localFilePath, formattedJson, 'utf-8');
      } catch (fsErr) {
        console.warn('Warning: Could not write to local windows.json file:', fsErr);
      }

      // 4. GitHub API Commit
      const githubToken = process.env.GITHUB_TOKEN;
      const githubRepo = process.env.GITHUB_REPO;
      const githubBranch = process.env.GITHUB_BRANCH || 'main';

      if (githubToken && githubRepo) {
        const repoPath = githubRepo.includes('/') ? githubRepo : `owner/${githubRepo}`;
        const fileUrl = `https://api.github.com/repos/${repoPath}/contents/src/data/windows.json`;

        // Get current file SHA
        const getShaRes = await fetch(`${fileUrl}?ref=${encodeURIComponent(githubBranch)}`, {
          headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'AI-Studio-App',
          },
        });

        if (!getShaRes.ok) {
          const shaErrText = await getShaRes.text();
          return res.status(500).json({
            error: `GitHub fetch file SHA failed (${getShaRes.status}): ${shaErrText}`,
          });
        }

        const shaData = (await getShaRes.json()) as { sha: string };
        const currentSha = shaData.sha;

        // Commit updated file
        const commitMessage = changedEntryTitle
          ? `Update windows.json: ${changedEntryTitle}`
          : 'Update windows.json configuration';

        const commitRes = await fetch(fileUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'AI-Studio-App',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: commitMessage,
            content: Buffer.from(formattedJson, 'utf-8').toString('base64'),
            sha: currentSha,
            branch: githubBranch,
          }),
        });

        if (!commitRes.ok) {
          const commitErrText = await commitRes.text();
          return res.status(500).json({
            error: `GitHub commit failed (${commitRes.status}): ${commitErrText}`,
          });
        }

        return res.json({
          success: true,
          message: 'Saved and committed to GitHub successfully',
        });
      }

      // If no GitHub env vars, confirm local save succeeded
      return res.json({
        success: true,
        message: 'Saved locally (GitHub credentials not provided in environment)',
      });
    } catch (err: any) {
      console.error('Error in /api/save:', err);
      return res.status(500).json({
        error: err.message || 'An unexpected error occurred while saving',
      });
    }
  });

  // Vite Middleware in Dev
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

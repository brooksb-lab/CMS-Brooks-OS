export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    // 1. Check ADMIN_PASSWORD env var
    const expectedPassword = process.env.ADMIN_PASSWORD;
    if (!expectedPassword) {
      return res.status(500).json({
        error: 'Server misconfigured: ADMIN_PASSWORD environment variable is missing.',
      });
    }

    const { password, content, windowsData, changedEntryTitle, verifyOnly } = req.body || {};

    // 2. Compare password against ADMIN_PASSWORD
    if (password !== expectedPassword) {
      return res.status(401).json({ error: 'Invalid admin password' });
    }

    // If verifyOnly request (from unlock screen)
    if (verifyOnly) {
      return res.json({ success: true, message: 'Password verified' });
    }

    // 3. Check GitHub credentials
    const githubToken = process.env.GITHUB_TOKEN;
    const githubRepo = process.env.GITHUB_REPO;
    const githubBranch = process.env.GITHUB_BRANCH || 'main';

    if (!githubToken || !githubRepo) {
      return res.status(500).json({
        error: 'Server misconfigured: GITHUB_TOKEN and GITHUB_REPO environment variables are required.',
      });
    }

    // 4. Validate payload contains windows array
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

    // 5. Fetch current file SHA and content from GitHub to preserve all top-level keys
    const fileUrl = `https://api.github.com/repos/${githubRepo}/contents/src/data/windows.json`;

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

    const shaData = (await getShaRes.json()) as { sha: string; content?: string };
    const currentSha = shaData.sha;

    // Decode existing JSON content from GitHub to preserve keys like dockOrder, mobileDockOrder, etc.
    let existingJson: Record<string, any> = {};
    if (shaData.content) {
      try {
        const decodedContent = Buffer.from(shaData.content, 'base64').toString('utf-8');
        existingJson = JSON.parse(decodedContent);
      } catch (err) {
        console.warn('Could not parse existing windows.json content from GitHub:', err);
      }
    }

    // Replace ONLY the windows array and top-level site/orders if provided, keeping all other top-level keys untouched
    existingJson.windows = windowsArray;

    if (req.body.site) {
      existingJson.site = req.body.site;
    }
    if (req.body.dockOrder) {
      existingJson.dockOrder = req.body.dockOrder;
    }
    if (req.body.mobileDockOrder) {
      existingJson.mobileDockOrder = req.body.mobileDockOrder;
    }
    if (req.body.desktopOrder) {
      existingJson.desktopOrder = req.body.desktopOrder;
    }

    const formattedJson = JSON.stringify(existingJson, null, 2);

    // 6. Commit updated file to GitHub
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
  } catch (err: any) {
    console.error('Error in /api/save handler:', err);
    return res.status(500).json({
      error: err.message || 'An unexpected error occurred while saving',
    });
  }
}

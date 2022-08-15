import { Confirm } from "https://deno.land/x/cliffy@v0.24.3/prompt/mod.ts";
import { ensureDir } from "https://deno.land/std@0.151.0/fs/ensure_dir.ts";

if (Deno.args.length == 0) {
    console.log("Usage: `quickstart <directory>`");
    Deno.exit(1);
}

const dir = Deno.args[0];

const items = [];
for await (const dirEntry of Deno.readDir(dir)) {
    items.push(dirEntry);
}

if (items.length > 0) {
    const confirm = await Confirm.prompt(
        "The directory is not empty. Continue?",
    );
    if (!confirm) {
        Deno.exit(1);
    }
}

// .gitignore

await Deno.writeTextFile(
    `${dir}/.gitignore`,
    `.env
/.vscode
`,
);

// .gitattributes

await Deno.writeTextFile(
    `${dir}/.gitattributes`,
    `* text=auto
    `,
);

// LICENSE

const mit = await fetch(`https://cdn-raw.modrinth.com//licenses/mit.txt`).then((
    res,
) => res.text());
await Deno.writeTextFile(
    `${dir}/LICENSE`,
    mit.replace("[year]", new Date().getFullYear().toString()).replace(
        "[fullname]",
        "Jamalam",
    ),
);

// .vscode

await ensureDir(`${dir}/.vscode`);
await Deno.writeTextFile(
    `${dir}/.vscode/settings.json`,
    JSON.stringify(
        {
            "deno.enable": true,
            "deno.lint": true,
            "deno.unstable": true,
            "editor.defaultFormatter": "denoland.vscode-deno",
        },
        null,
        4,
    ) + "\n",
);

// deno.json

await Deno.writeTextFile(
    `${dir}/deno.json`,
    JSON.stringify(
        {
            fmt: {
                options: {
                    indentWidth: 4,
                },
            },
        },
        null,
        4,
    ) + "\n",
);

// .github

const ci = (await Confirm.prompt("Run tests in CI?"))
    ? "https://gist.githubusercontent.com/Jamalam360/0375a36378c9d45b74f93b7d4269177f/raw/4b5b127633ef332acf6ebc4f1f3fd9078a36cde2/ci.yaml"
    : "https://gist.githubusercontent.com/Jamalam360/1c5ac4902204b370e64e7af835ab9b07/raw/1a2fe1e36a964be651b2511a026bb5dd4d881a4e/ci.yaml";

await ensureDir(`${dir}/.github`);
await ensureDir(`${dir}/.github/workflows`);
await Deno.writeTextFile(
    `${dir}/.github/workflows/ci.yaml`,
    await fetch(ci).then((res) => res.text()),
);

// README.md

await Deno.writeTextFile(
    `${dir}/README.md`,
    `# New Project
    `,
);

const init = Deno.run({
    cmd: ["git", "init", dir],
});

await init.status();

const add = Deno.run({
    cmd: ["git", "add", "."],
    cwd: dir,
});

await add.status();

const commit = Deno.run({
    cmd: ["git", "commit", "-am", "Initial commit"],
    cwd: dir,
});

await commit.status();

const main = Deno.run({
    cmd: ["git", "branch", "-M", "main"],
    cwd: dir,
});

await main.status();

console.log("Initialization complete.");
